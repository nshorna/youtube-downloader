"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Clipboard } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { youtubeUrlSchema } from "@/lib/validations"
import { z } from "zod"
import { trackEvent, trackError, claritySet } from "@/lib/analytics"
import { cn } from "@/lib/utils"

/**
 * Form schema combining URL validation and acknowledgment
 */
const formSchema = z.object({
  url: youtubeUrlSchema,
  acknowledged: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge the terms to continue",
  }),
})

type FormData = z.infer<typeof formSchema>

/**
 * URL Form Component
 * Handles YouTube URL input, validation, and submission
 * Widgetized component - no padding/margin applied here
 */
export function UrlForm() {
  const [acknowledged, setAcknowledged] = useState(false)
  const [highlightCheckbox, setHighlightCheckbox] = useState(false)
  const checkboxRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: "",
      acknowledged: false,
    },
  })

  const urlValue = watch("url")

  /**
   * Handle paste button click - reads from clipboard
   */
  const handlePaste = async () => {
    console.log("📋 [FRONTEND] Paste button clicked")
    try {
      const text = await navigator.clipboard.readText()
      console.log("📋 [FRONTEND] Clipboard content:", text.substring(0, 50) + "...")

      if (text) {
        setValue("url", text, { shouldValidate: true })
        console.log("✅ [FRONTEND] URL pasted successfully")
        
        // Track paste event
        trackEvent("url_pasted", {
          url_length: text.length,
          url_preview: text.substring(0, 50),
        })
        
        toast({
          title: "URL Pasted",
          description: "URL has been pasted from clipboard",
        })
      }
    } catch (err: any) {
      console.error("❌ [FRONTEND] Paste error:", err.message)
      
      // Track paste error
      trackError(err instanceof Error ? err : new Error(err.message || "Paste failed"), false)
      
      toast({
        title: "Paste Failed",
        description: "Could not read from clipboard. Please paste manually.",
        variant: "destructive",
      })
    }
  }

  /**
   * Handle form submission - navigate to download page with URL
   */
  const onSubmit = (data: FormData) => {
    console.log("🚀 [FRONTEND] User submitted URL:", data.url)
    console.log("✅ [FRONTEND] Form validation passed")
    
    // Track URL submission event
    trackEvent("url_submitted", {
      url_length: data.url.length,
      url_preview: data.url.substring(0, 50),
      has_acknowledgment: true,
    })
    
    // Set Clarity state for URL context
    claritySet('current_url', data.url.substring(0, 100)) // Limit length for Clarity
    
    router.push(`/download?url=${encodeURIComponent(data.url)}`)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // If button is disabled (checkbox not checked or no URL), highlight checkbox
    if (!acknowledged || !urlValue) {
      setHighlightCheckbox(true)
      // Scroll checkbox into view if needed
      checkboxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      // Remove highlight after animation
      setTimeout(() => setHighlightCheckbox(false), 2000)
      return
    }
    
    handleSubmit(
      onSubmit,
      (errors) => {
        // Track validation errors
        console.log("❌ [FRONTEND] Form validation failed:", errors)
        trackEvent("url_validation_error", {
          errors: Object.keys(errors),
          error_count: Object.keys(errors).length,
        })
      }
    )()
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 max-w-2xl mx-auto bg-card p-6 md:p-8 rounded-2xl shadow-xl border border-border/50">
      <div>
        <InputGroup className="h-12">
          <InputGroupInput
            type="text"
            placeholder="Paste YouTube video URL here..."
            className="h-12 text-lg"
            aria-invalid={errors.url ? "true" : "false"}
            {...register("url")}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              onClick={handlePaste}
              title="Paste from clipboard"
              size="sm"
            >
              <Clipboard className="w-4 h-4" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {errors.url && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {errors.url.message}
          </p>
        )}
      </div>

      <div 
        className={cn(
          "flex items-start space-x-3 text-left p-4 rounded-lg border-2 transition-all duration-300",
          highlightCheckbox 
            ? "border-primary bg-primary/10 shadow-lg ring-4 ring-primary/20" 
            : "border-border bg-muted/30"
        )}
        ref={checkboxRef}
      >
        <Checkbox
          id="copyright"
          checked={acknowledged}
          onCheckedChange={(checked) => {
            const isChecked = checked as boolean
            setAcknowledged(isChecked)
            setValue("acknowledged", isChecked, { shouldValidate: true })
            console.log("📋 [FRONTEND] Acknowledgment changed:", isChecked)
            // Remove highlight when checkbox is checked
            if (isChecked) {
              setHighlightCheckbox(false)
            }
          }}
          className={cn(
            "mt-1 transition-all duration-300",
            highlightCheckbox && "scale-110"
          )}
        />
        <Label htmlFor="copyright" className="text-sm font-semibold leading-tight cursor-pointer flex-1">
          I acknowledge that I will not download copyrighted content and will only use this tool for content I own
          or have permission to use.
        </Label>
      </div>
      {errors.acknowledged && (
        <p className="text-sm text-destructive" role="alert">
          {errors.acknowledged.message}
        </p>
      )}
      
      <Button
        type="submit"
        size="lg"
        disabled={!acknowledged || !urlValue}
        className="w-full h-12 px-8 font-bold text-lg"
      >
        Download
      </Button>
    </form>
  )
}

