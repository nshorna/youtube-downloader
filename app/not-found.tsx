import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion, Home } from "lucide-react"
import { APP_NAME } from "@/lib/config"

/**
 * 404 Not Found Page
 * Displays when a user navigates to a page that doesn't exist
 */
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="flex flex-col items-center justify-center text-center space-y-8">
        <div className="bg-primary/5 w-32 h-32 rounded-full flex items-center justify-center">
          <FileQuestion className="w-16 h-16 text-primary" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/how-to-use">How to Use {APP_NAME}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

