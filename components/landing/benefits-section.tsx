import { Card, CardContent } from "@/components/ui/card"
import { Download, Zap, ShieldCheck } from "lucide-react"
import { APP_NAME } from "@/lib/config"

/**
 * Benefits Section Component
 * Displays key features and benefits of the service
 * Widgetized component - no padding/margin applied here
 */
export function BenefitsSection() {
  const benefits = [
    {
      icon: <Zap className="text-primary w-8 h-8" />,
      title: "Lightning Fast",
      description: "Our servers process your requests instantly, giving you download links in seconds.",
    },
    {
      icon: <Download className="text-primary w-8 h-8" />,
      title: "High Quality",
      description: "Download videos in various resolutions, including 720p, 1080p, and 4K when available.",
    },
    {
      icon: <ShieldCheck className="text-primary w-8 h-8" />,
      title: "No Registration",
      description: "We value your privacy. Download as much as you want without creating an account.",
    },
  ]

  return (
    <section className="bg-secondary/50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose {APP_NAME}?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-none shadow-sm bg-card/50 backdrop-blur">
              <CardContent className="pt-8 text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

