/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3021",
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    "/api/*",
    "/download/*",
    "/history",
    "/server-sitemap-index.xml",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/download/", "/history"],
      },
    ],
    additionalSitemaps: [],
  },
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    // Custom priority and changefreq for different pages
    const customConfig = {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }

    // Homepage gets higher priority
    if (path === "/") {
      customConfig.priority = 1.0
      customConfig.changefreq = "daily"
    }

    // Static pages get medium priority
    if (["/about", "/contact", "/how-to-use", "/privacy-policy"].includes(path)) {
      customConfig.priority = 0.8
      customConfig.changefreq = "monthly"
    }

    return customConfig
  },
}

