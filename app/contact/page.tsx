import type { Metadata } from "next"
import { APP_NAME, SITE_URL } from "@/lib/config"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata: Metadata = {
  title: `Contact ${APP_NAME}`,
  description: `Get in touch with ${APP_NAME}. Have questions or feedback? We'd love to hear from you.`,
  openGraph: {
    title: `Contact ${APP_NAME} - Get in Touch`,
    description: `Get in touch with ${APP_NAME}. Have questions or feedback? We'd love to hear from you.`,
    url: `${SITE_URL}/contact`,
  },
  twitter: {
    title: `Contact ${APP_NAME}`,
    description: `Get in touch with ${APP_NAME}. Have questions or feedback?`,
  },
}

/**
 * Contact Page
 * Server-side page component that displays the contact form
 */
export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground">Have questions or feedback? We&apos;d love to hear from you.</p>
      </div>
      <ContactForm />
    </div>
  )
}
