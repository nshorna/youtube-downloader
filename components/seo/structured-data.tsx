import { APP_NAME, SITE_URL } from "@/lib/config"

/**
 * Organization Schema for JSON-LD structured data
 */
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_NAME,
    url: SITE_URL,
    description: "Fast and simple YouTube video downloader",
    sameAs: [], // Add social media links if available
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * WebApplication Schema for JSON-LD structured data
 */
export function WebApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: SITE_URL,
    description:
      "Download YouTube videos in high quality for offline viewing. Simple, fast, and free.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Download YouTube videos",
      "Multiple format support (MP4, WebM, etc.)",
      "High quality downloads",
      "No registration required",
      "Free to use",
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

/**
 * FAQPage Schema for JSON-LD structured data
 */
interface FAQ {
  question: string
  answer: string
}

export function FAQPageSchema({ faqs }: { faqs: readonly FAQ[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

