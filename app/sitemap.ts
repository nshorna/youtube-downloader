import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/config"

/**
 * Sitemap generation
 * This works alongside next-sitemap to provide programmatic sitemap generation
 * next-sitemap will generate the static sitemap.xml, but this provides Next.js native support
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL

  // Static pages with their priorities and change frequencies
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-to-use`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ]

  return routes
}

