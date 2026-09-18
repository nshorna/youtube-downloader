import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config"

/**
 * Robots.txt configuration
 * This works alongside next-sitemap but provides Next.js native robots.txt generation
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/download/", "/history"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

