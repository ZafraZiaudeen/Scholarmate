import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sahan Perera",
    grade: "Grade 11 Student",
    content:
      "The AI tutor helped me understand networking concepts that I struggled with for months. My grades improved from C to A in just 6 weeks!",
    rating: 5,
    avatar: "/student-avatar.png",
  },
  {
    name: "Nimali Fernando",
    grade: "O/L Graduate",
    content:
      "The past paper practice was incredibly helpful. The AI explanations made complex ICT topics simple to understand. Highly recommend!",
    rating: 5,
    avatar: "/female-student-avatar.png",
  },
  {
    name: "Kasun Silva",
    grade: "Grade 10 Student",
    content:
      "I love how the platform tracks my progress and suggests what to study next. It's like having a personal ICT tutor available 24/7.",
    rating: 5,
    avatar: "/young-student-avatar.png",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl text-foreground mb-4">What Students Say</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who have transformed their learning experience and achieved academic success with
            our AI-powered platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>

                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-muted-foreground/20" />
                  <p className="text-muted-foreground italic leading-relaxed pl-6">"{testimonial.content}"</p>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.grade}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
