import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"
import { APP_NAME } from "@/lib/config"

/**
 * FAQ data exported for use in structured data
 */
export const FAQ_DATA = [
    {
      question: "Is it legal to download YouTube videos?",
      answer:
        "Downloading videos for personal use is generally considered a gray area, but it violates YouTube's Terms of Service. We encourage using this tool only for content you own, have permission for, or is in the public domain.",
    },
    {
      question: "What video formats are supported?",
      answer: `${APP_NAME} supports standard formats like MP4 and WebM. MP4 is recommended for most devices due to its high compatibility and quality.`,
    },
    {
      question: "Do I need to pay for this service?",
      answer: `No, ${APP_NAME} is completely free to use. We don't require any payments or subscriptions.`,
    },
    {
      question: "Is there a limit on the number of downloads?",
      answer:
        "Currently, there are no limits. You can use our tool as many times as you need for your personal projects.",
    },
  ] as const

/**
 * FAQ Section Component
 * Displays frequently asked questions in an accordion format
 * Widgetized component - no padding/margin applied here
 */
export function FAQSection() {
  const faqs = FAQ_DATA

  return (
    <section className="container mx-auto px-4 max-w-3xl">
      <div className="flex items-center justify-center gap-3 mb-8">
        <HelpCircle className="text-primary w-8 h-8" />
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

