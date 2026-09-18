import type { Format } from "@/lib/services/download-service"

/**
 * Converts a 2-letter country code to a flag emoji
 */
export function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return ""
  
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

/**
 * Extracts country code from format note or ID
 * Common patterns: "US", "GB", "DE", etc. in the note field
 */
export function extractCountryCode(format: Format): string | null {
  if (!format.note) return null
  
  // Look for 2-letter country codes in the note (common in yt-dlp output)
  const countryCodeMatch = format.note.match(/\b([A-Z]{2})\b/)
  if (countryCodeMatch) {
    const code = countryCodeMatch[1]
    // Validate it's likely a country code (not a technical abbreviation)
    const commonCountryCodes = ["US", "GB", "DE", "FR", "JP", "KR", "CN", "IN", "BR", "CA", "AU", "MX", "ES", "IT", "NL", "SE", "NO", "DK", "FI", "PL", "RU", "TR", "SA", "AE", "SG", "MY", "TH", "VN", "PH", "ID", "NZ", "ZA", "EG", "NG", "KE", "AR", "CL", "CO", "PE", "VE", "EC", "UY", "PY", "BO", "CR", "PA", "GT", "HN", "SV", "NI", "DO", "CU", "JM", "TT", "BB", "BS", "BZ", "GY", "SR", "GF", "FK", "IE", "IS", "PT", "GR", "CH", "AT", "BE", "LU", "CZ", "SK", "HU", "RO", "BG", "HR", "SI", "EE", "LV", "LT", "MT", "CY", "IL", "JO", "LB", "SY", "IQ", "IR", "AF", "PK", "BD", "LK", "MM", "KH", "LA", "TW", "HK", "MO", "MN", "KZ", "UZ", "TJ", "TM", "KG", "GE", "AM", "AZ", "BY", "MD", "UA", "RS", "ME", "BA", "MK", "AL", "XK"]
    if (commonCountryCodes.includes(code)) {
      return code
    }
  }
  return null
}

/**
 * Extracts language code or name from format note
 * Common patterns: "en", "es", "English", "Spanish", "en-US", etc. in the note field
 */
export function extractLanguage(format: Format): string | null {
  if (!format.note) return null
  
  const note = format.note
  
  // Common ISO 639-1 language codes (2-letter lowercase)
  const commonLanguageCodes = ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh", "ar", "hi", "tr", "pl", "nl", "sv", "da", "no", "fi", "cs", "hu", "ro", "bg", "hr", "sk", "sl", "et", "lv", "lt", "el", "he", "th", "vi", "id", "ms", "tl", "sw", "af", "zu", "xh", "uk", "be", "sr", "mk", "sq", "mt", "is", "ga", "cy", "eu", "ca", "gl", "eo", "ia", "la", "yi"]
  
  // Look for language codes in patterns like "en", "en-US", "English", etc.
  // Pattern 1: 2-letter language code (ISO 639-1) - lowercase
  const langCodeMatch = note.match(/\b([a-z]{2})(?:-[A-Z]{2})?\b/)
  if (langCodeMatch) {
    const code = langCodeMatch[1].toLowerCase()
    if (commonLanguageCodes.includes(code)) {
      return code
    }
  }
  
  // Pattern 2: 3-letter language code (ISO 639-2) - lowercase
  const langCode3Match = note.match(/\b([a-z]{3})\b/)
  if (langCode3Match) {
    const code = langCode3Match[1].toLowerCase()
    // Common 3-letter codes
    const common3LetterCodes = ["eng", "spa", "fra", "deu", "ita", "por", "rus", "jpn", "kor", "zho", "ara", "hin", "tur", "pol", "nld", "swe", "dan", "nor", "fin", "ces", "hun", "ron", "bul", "hrv", "slk", "slv", "est", "lav", "lit", "ell", "heb", "tha", "vie", "ind", "msa", "tgl", "swa"]
    if (common3LetterCodes.includes(code)) {
      return code
    }
  }
  
  // Pattern 3: Full language names (case-insensitive)
  const languageNames: Record<string, string> = {
    "english": "en",
    "spanish": "es",
    "french": "fr",
    "german": "de",
    "italian": "it",
    "portuguese": "pt",
    "russian": "ru",
    "japanese": "ja",
    "korean": "ko",
    "chinese": "zh",
    "arabic": "ar",
    "hindi": "hi",
    "turkish": "tr",
    "polish": "pl",
    "dutch": "nl",
    "swedish": "sv",
    "danish": "da",
    "norwegian": "no",
    "finnish": "fi",
    "czech": "cs",
    "hungarian": "hu",
    "romanian": "ro",
    "bulgarian": "bg",
    "croatian": "hr",
    "slovak": "sk",
    "slovenian": "sl",
    "estonian": "et",
    "latvian": "lv",
    "lithuanian": "lt",
    "greek": "el",
    "hebrew": "he",
    "thai": "th",
    "vietnamese": "vi",
    "indonesian": "id",
    "malay": "ms",
    "tagalog": "tl",
    "swahili": "sw"
  }
  
  const noteLower = note.toLowerCase()
  for (const [langName, langCode] of Object.entries(languageNames)) {
    if (noteLower.includes(langName)) {
      return langCode
    }
  }
  
  return null
}

/**
 * Gets language display name from language code
 */
export function getLanguageName(langCode: string): string {
  const languageMap: Record<string, string> = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh": "Chinese",
    "ar": "Arabic",
    "hi": "Hindi",
    "tr": "Turkish",
    "pl": "Polish",
    "nl": "Dutch",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish",
    "cs": "Czech",
    "hu": "Hungarian",
    "ro": "Romanian",
    "bg": "Bulgarian",
    "hr": "Croatian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "et": "Estonian",
    "lv": "Latvian",
    "lt": "Lithuanian",
    "el": "Greek",
    "he": "Hebrew",
    "th": "Thai",
    "vi": "Vietnamese",
    "id": "Indonesian",
    "ms": "Malay",
    "tl": "Tagalog",
    "sw": "Swahili",
    "eng": "English",
    "spa": "Spanish",
    "fra": "French",
    "deu": "German",
    "ita": "Italian",
    "por": "Portuguese",
    "rus": "Russian",
    "jpn": "Japanese",
    "kor": "Korean",
    "zho": "Chinese",
    "ara": "Arabic",
    "hin": "Hindi",
    "tur": "Turkish",
    "pol": "Polish",
    "nld": "Dutch",
    "swe": "Swedish",
    "dan": "Danish",
    "nor": "Norwegian",
    "fin": "Finnish",
    "ces": "Czech",
    "hun": "Hungarian",
    "ron": "Romanian",
    "bul": "Bulgarian",
    "hrv": "Croatian",
    "slk": "Slovak",
    "slv": "Slovenian",
    "est": "Estonian",
    "lav": "Latvian",
    "lit": "Lithuanian",
    "ell": "Greek",
    "heb": "Hebrew",
    "tha": "Thai",
    "vie": "Vietnamese",
    "ind": "Indonesian",
    "msa": "Malay",
    "tgl": "Tagalog",
    "swa": "Swahili"
  }
  
  return languageMap[langCode.toLowerCase()] || langCode.toUpperCase()
}

