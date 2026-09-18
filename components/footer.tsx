import Link from "next/link"
import { Youtube } from "lucide-react"
import { APP_NAME } from "@/lib/config"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-primary mb-6">
              <Youtube className="w-8 h-8" />
              <span>{APP_NAME}</span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-pretty">
              The fastest and most reliable way to download YouTube videos for offline viewing. Dedicated to quality,
              speed, and simplicity.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>
                <Link href="/how-to-use" className="hover:text-primary transition-colors">
                  How to Use?
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-lg">Legal</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li>
                <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-muted/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p>Made for content owners and authorized users.</p>
        </div>
      </div>
    </footer>
  )
}
