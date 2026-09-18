import type { Metadata } from "next"
import { APP_NAME, SITE_URL } from "@/lib/config"

export const metadata: Metadata = {
  title: `Privacy Policy - ${APP_NAME}`,
  description: `Read ${APP_NAME}'s privacy policy to understand how we collect, use, and protect your data. We prioritize your privacy and don't store personal information.`,
  openGraph: {
    title: `Privacy Policy - ${APP_NAME}`,
    description: `Read ${APP_NAME}'s privacy policy to understand how we collect, use, and protect your data.`,
    url: `${SITE_URL}/privacy-policy`,
  },
  twitter: {
    title: `Privacy Policy - ${APP_NAME}`,
    description: `Read ${APP_NAME}'s privacy policy to understand how we protect your data.`,
  },
}

/**
 * Privacy Policy Page
 * Server-side page component that displays the privacy policy
 * Outlines how user data is collected, used, and protected
 */
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-lg dark:prose-invert">
        <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Information Collection</h2>
          <p>
            {APP_NAME} is designed to be as private as possible. We do not require user accounts, and we do not store any
            personal information like names or email addresses unless you contact us directly via our contact form.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">2. Video URLs</h2>
          <p>
            The YouTube URLs you paste into our service are processed temporarily in memory to generate download
            options. We do not maintain a permanent database of these URLs or the associated video content.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. Cookies</h2>
          <p>
            We may use minimal local storage or essential cookies to remember your preferences (like the copyright
            acknowledgement) to improve your user experience. These do not track you across other websites.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">4. Third-Party Links</h2>
          <p>
            Our service may contain links to YouTube. Once you leave our site, you are subject to YouTube&apos;s privacy
            policy and terms of service.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">5. Security</h2>
          <p>
            We take reasonable measures to protect the integrity of our service, but please remember that no method of
            transmission over the internet is 100% secure.
          </p>
        </section>
      </div>
    </div>
  )
}
