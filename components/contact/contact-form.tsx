"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import { trackEvent, trackError } from "@/lib/analytics"

/**
 * Contact Form Component
 * Handles contact form submission
 * Widgetized component - no padding/margin applied here
 */
export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 [FRONTEND] Contact form submitted")
    setIsSubmitting(true)

    // Get form data for tracking
    const form = e.target as HTMLFormElement
    const nameInput = form.querySelector('#name') as HTMLInputElement
    const emailInput = form.querySelector('#email') as HTMLInputElement
    const messageInput = form.querySelector('#message') as HTMLTextAreaElement
    const name = nameInput?.value || ''
    const email = emailInput?.value || ''
    const message = messageInput?.value || ''

    // Track contact form submission
    trackEvent("contact_form_submitted", {
      has_name: !!name,
      has_email: !!email,
      message_length: message?.length || 0,
    })

    // Simulate API call
    setTimeout(() => {
      try {
        console.log("✅ [FRONTEND] Contact form submission successful")
        toast({
          title: "Message Sent!",
          description: "We've received your message and will get back to you soon.",
        })
        form.reset()
        console.log("✅ [FRONTEND] Form reset")
      } catch (err: any) {
        console.error("❌ [FRONTEND] Contact form error:", err.message)
        trackError(err instanceof Error ? err : new Error(err.message || "Contact form submission failed"), false)
        trackEvent("contact_form_error", {
          error_message: err.message || "Unknown error",
        })
      } finally {
        setIsSubmitting(false)
      }
    }, 1500)
  }

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john@example.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="How can we help you?"
              className="min-h-[150px] resize-none"
              required
            />
          </div>

          <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

