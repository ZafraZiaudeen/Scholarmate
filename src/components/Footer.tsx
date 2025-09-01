import { Button } from "@/components/ui/button"
import { Brain, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-space-grotesk font-bold text-xl text-foreground">Scholarmate</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Empowering O/L IT students with AI-powered learning tools, comprehensive resources, and personalized learning experiences.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Learning Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/ai" className="hover:text-foreground transition-colors">
                  AI Tutor
                </Link>
              </li>
              <li>
                <Link to="/past-papers" className="hover:text-foreground transition-colors">
                  Past Papers
                </Link>
              </li>
              <li>
                <Link to="/task" className="hover:text-foreground transition-colors">
                  Learning Tasks
                </Link>
              </li>
              <li>
                <Link to="/videos" className="hover:text-foreground transition-colors">
                  Video Learning
                </Link>
              </li>
              <li>
                <Link to="/achievements" className="hover:text-foreground transition-colors">
                  Achievements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/sign-up" className="hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/sign-in" className="hover:text-foreground transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

  <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">© 2024 Scholarmate. All rights reserved.</p>
         
        </div>
      </div>
    </footer>
  )
}
