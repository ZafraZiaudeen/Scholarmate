import { Button } from "@/components/ui/button"
import { ArrowRight} from "lucide-react"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            AI-Powered Learning Platform
          </div>

          <h1 className="font-space-grotesk font-bold text-4xl md:text-6xl lg:text-7xl text-foreground mb-6 leading-tight">
            Your AI-Powered Learning Assistant for <span className="text-primary">Web Design</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Master O/L IT Web Design with personalized AI tutoring, comprehensive past paper practice, and intelligent
            progress tracking. Transform your exam preparation with cutting-edge technology.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 text-lg">
               <Link to="/sign-up">Start Learning Now</Link>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* <Button variant="outline" size="lg" className="px-8 py-3 text-lg bg-transparent">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Past Paper Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Student Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">AI Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
