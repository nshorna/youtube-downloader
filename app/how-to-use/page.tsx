import type { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, ClipboardType, CheckCircle2, Download } from "lucide-react"
import { APP_NAME, SITE_URL } from "@/lib/config"

export const metadata: Metadata = {
  title: `How to Use ${APP_NAME}`,
  description: `Step-by-step guide on how to download YouTube videos using ${APP_NAME}. Learn how to copy links, select formats, and download videos in just 4 simple steps.`,
  openGraph: {
    title: `How to Use ${APP_NAME} - Step by Step Guide`,
    description: `Step-by-step guide on how to download YouTube videos using ${APP_NAME}. Learn how to copy links, select formats, and download videos in just 4 simple steps.`,
    url: `${SITE_URL}/how-to-use`,
  },
  twitter: {
    title: `How to Use ${APP_NAME}`,
    description: `Step-by-step guide on how to download YouTube videos using ${APP_NAME}.`,
  },
}

/**
 * How to Use Page
 * Server-side page component that displays step-by-step instructions
 * Shows users how to use the YouTube downloader service
 */
export default function HowToUse() {
  /**
   * Step-by-step instructions for using the service
   * Each step includes an icon, title, and description
   */
  const steps = [
    {
      icon: <Copy className="w-10 h-10 text-primary" />,
      title: "1. Copy YouTube Link",
      description:
        "Go to YouTube, find the video you want to download, and copy its URL from the browser's address bar.",
    },
    {
      icon: <ClipboardType className="w-10 h-10 text-primary" />,
      title: "2. Paste the Link",
      description: `Return to ${APP_NAME} and paste the copied link into the input field on the homepage.`,
    },
    {
      icon: <CheckCircle2 className="w-10 h-10 text-primary" />,
      title: "3. Acknowledge Notice",
      description: "Check the copyright acknowledgement box to confirm you have permission to download the content.",
    },
    {
      icon: <Download className="w-10 h-10 text-primary" />,
      title: "4. Select & Download",
      description: "Choose your preferred resolution and format from the list, and click the download button.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-20 max-w-4xl">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">How to Use {APP_NAME}</h1>
      <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
        Following these simple steps will have your videos ready for offline viewing in no time.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, index) => (
          <Card key={index} className="border-none shadow-lg bg-card overflow-hidden">
            <CardContent className="p-8">
              <div className="bg-primary/5 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
