"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Youtube, History, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { APP_NAME } from "@/lib/config"

export function Navbar() {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Youtube className="w-8 h-8" />
          <span>{APP_NAME}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/history" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <History className="w-4 h-4" />
            History
          </Link>
          <Link href="/how-to-use" className="hover:text-primary transition-colors">
            How to Use?
          </Link>
          <Link href="/about" className="hover:text-primary transition-colors">
            About
          </Link>
          <Link href="/privacy-policy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/history" className="flex items-center gap-2 cursor-pointer">
                  <History className="w-4 h-4" />
                  History
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/how-to-use" className="cursor-pointer">
                  How to Use?
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/about" className="cursor-pointer">
                  About
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/privacy-policy" className="cursor-pointer">
                  Privacy
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact" className="cursor-pointer">
                  Contact
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}
