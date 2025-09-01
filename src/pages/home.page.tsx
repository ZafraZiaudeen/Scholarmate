import Header from "@/components/Header"
import { HeroSection } from "@/components/Hero-section"
import { FeaturesSection } from "@/components/Features-section"
import { ProgressSection } from "@/components/Progress-section"
import { TestimonialsSection } from "@/components/Testimonials-section"
import { Footer } from "@/components/Footer"
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProgressSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  )
}
