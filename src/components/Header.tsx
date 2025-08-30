import { Button } from "@/components/ui/button"
import { Brain, Menu, MessageSquare } from "lucide-react"
import { Link } from "react-router-dom"
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-space-grotesk font-bold text-xl text-foreground">Scholarmate</span>
        </div>

        <div className="flex items-center gap-4">
          <SignedIn>
            <UserButton />
            <Link to="/contact">
              <Button variant="outline" className="hidden sm:inline-flex bg-transparent">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" className="hidden sm:inline-flex bg-transparent">
                Dashboard
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <Button variant="outline" className="hidden sm:inline-flex bg-transparent" asChild>
              <Link to="/sign-in">Login</Link>
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link to="/sign-up">Get Started</Link>
            </Button>
          </SignedOut>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
