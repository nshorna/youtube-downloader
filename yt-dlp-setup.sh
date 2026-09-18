#!/usr/bin/env bash
set -euo pipefail

YTDLP_INSTALL_DIR="${YTDLP_INSTALL_DIR:-/usr/local/bin}"
YTDLP_BIN="${YTDLP_INSTALL_DIR}/yt-dlp"
YTDLP_RELEASE_URL="https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp"
YTDLP_COOKIES_FILE="${YTDLP_COOKIES_FILE:-$HOME/.config/yt-dlp/cookies.txt}"
YTDLP_COOKIES_FROM_BROWSER="${YTDLP_COOKIES_FROM_BROWSER:-chrome}"

log() {
  echo "==> $*"
}

require_command() {
  if ! command -v "$1" &>/dev/null; then
    echo "Error: '$1' is required but not installed." >&2
    exit 1
  fi
}

install_ffmpeg() {
  if command -v ffmpeg &>/dev/null; then
    log "ffmpeg already installed: $(ffmpeg -version | head -n1)"
    return
  fi

  log "Installing ffmpeg..."

  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq
    sudo apt-get install -y ffmpeg
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y ffmpeg
  elif command -v yum &>/dev/null; then
    sudo yum install -y ffmpeg
  else
    echo "Error: Could not detect a supported package manager. Install ffmpeg manually." >&2
    exit 1
  fi
}

install_ytdlp() {
  require_command curl

  if command -v yt-dlp &>/dev/null; then
    log "yt-dlp already installed: $(yt-dlp --version)"
    log "Updating yt-dlp..."
  else
    log "Installing yt-dlp to ${YTDLP_BIN}..."
  fi

  sudo mkdir -p "${YTDLP_INSTALL_DIR}"
  sudo curl -fsSL "${YTDLP_RELEASE_URL}" -o "${YTDLP_BIN}"
  sudo chmod a+rx "${YTDLP_BIN}"
}

find_nvm_node_bin() {
  local nvm_dir="${NVM_DIR:-$HOME/.nvm}"
  local node_bin=""

  if [[ -s "${nvm_dir}/nvm.sh" ]]; then
    # shellcheck disable=SC1090
    source "${nvm_dir}/nvm.sh" >/dev/null 2>&1 || true
    node_bin="$(command -v node 2>/dev/null || true)"
  fi

  if [[ -z "${node_bin}" && -d "${nvm_dir}/versions/node" ]]; then
    node_bin="$(find "${nvm_dir}/versions/node" -maxdepth 2 -type f -name node -path '*/bin/node' 2>/dev/null | sort -V | tail -n1)"
  fi

  if [[ -z "${node_bin}" || ! -x "${node_bin}" ]]; then
    echo "Error: Could not find an nvm-managed Node.js binary. Install Node with nvm first." >&2
    exit 1
  fi

  printf '%s' "${node_bin}"
}

install_node_symlinks() {
  local node_bin
  node_bin="$(find_nvm_node_bin)"
  local node_dir
  node_dir="$(dirname "${node_bin}")"

  log "Linking nvm Node.js into ${YTDLP_INSTALL_DIR} for system-wide access..."
  log "Node binary: ${node_bin}"

  for binary in node npm npx; do
    if [[ -x "${node_dir}/${binary}" ]]; then
      sudo ln -sf "${node_dir}/${binary}" "${YTDLP_INSTALL_DIR}/${binary}"
    fi
  done
}

configure_ytdlp() {
  local config_file="/etc/yt-dlp.conf"

  log "Configuring yt-dlp..."
  {
    echo "--js-runtimes node"
    if [[ -f "${YTDLP_COOKIES_FILE}" ]]; then
      echo "--cookies ${YTDLP_COOKIES_FILE}"
    fi
  } | sudo tee "${config_file}" >/dev/null
}

export_youtube_cookies() {
  require_command yt-dlp

  mkdir -p "$(dirname "${YTDLP_COOKIES_FILE}")"

  if [[ -f "${YTDLP_COOKIES_FILE}" ]]; then
    log "Refreshing YouTube cookies at ${YTDLP_COOKIES_FILE}..."
  else
    log "Exporting YouTube cookies to ${YTDLP_COOKIES_FILE}..."
  fi

  if yt-dlp --cookies-from-browser "${YTDLP_COOKIES_FROM_BROWSER}" \
    --cookies "${YTDLP_COOKIES_FILE}" \
    --skip-download "https://www.youtube.com"; then
    chmod 600 "${YTDLP_COOKIES_FILE}"
    log "YouTube cookies saved to ${YTDLP_COOKIES_FILE}"
    return
  fi

  cat >&2 <<EOF
Error: Could not export cookies from ${YTDLP_COOKIES_FROM_BROWSER}.

On a machine with a browser:
  1. Sign in to youtube.com
  2. Run: YTDLP_COOKIES_FROM_BROWSER=chrome ./yt-dlp-setup.sh cookies

On this server, export cookies locally and upload them:
  1. Install a browser extension such as "Get cookies.txt LOCALLY"
  2. Visit youtube.com while signed in
  3. Export cookies for youtube.com
  4. Upload the file to: ${YTDLP_COOKIES_FILE}
  5. Run: chmod 600 ${YTDLP_COOKIES_FILE}
EOF
  exit 1
}

print_cookie_env_hint() {
  if [[ -f "${YTDLP_COOKIES_FILE}" ]]; then
    log "Add this to your .env file if it is not already set:"
    echo "YTDLP_COOKIES_FILE=${YTDLP_COOKIES_FILE}"
  fi
}

verify_installation() {
  log "Verifying installation..."
  yt-dlp --version
  ffmpeg -version | head -n1
  node --version
  env -i PATH="${YTDLP_INSTALL_DIR}:/usr/bin:/bin" yt-dlp --verbose --version 2>&1 | grep -F "JS runtimes: node" >/dev/null
  log "yt-dlp can access Node.js from a minimal PATH."
  if [[ -f "${YTDLP_COOKIES_FILE}" ]]; then
    log "YouTube cookies configured at ${YTDLP_COOKIES_FILE}"
  else
    log "YouTube cookies not found. Run ./yt-dlp-setup.sh cookies after exporting them."
  fi
  print_cookie_env_hint
  log "yt-dlp setup complete."
}

main() {
  if [[ "${1:-}" == "cookies" ]]; then
    export_youtube_cookies
    configure_ytdlp
    print_cookie_env_hint
    return
  fi

  install_ffmpeg
  install_ytdlp
  install_node_symlinks
  configure_ytdlp
  verify_installation
}

main "$@"
