import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, BookOpen,  MessageCircle,  Play, Trophy, Mail } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Tutoring",
    description: "Get personalized explanations and guidance tailored to your learning style and pace.",
    color: "text-primary",
  },
  {
    icon: BookOpen,
    title: "Past Paper Practice",
    description: "Access thousands of past exam questions with answersheet.",
    color: "text-accent",
  },
  {
    icon: MessageCircle,
    title: "On-Demand Support",
    description: "Ask AI anytime for instant help with concepts, questions, or explanations.",
    color: "text-chart-2",
  },
  {
    icon: Play,
    title: "Video Learning",
    description: "Watch curated video tutorials covering key ICT topics and concepts.",
    color: "text-red-500",
  },
  {
    icon: Trophy,
    title: "Achievements & Gamification",
    description: "Earn badges, unlock achievements, and stay motivated with gamified learning.",
    color: "text-yellow-500",
  },
  {
    icon: Mail,
    title: "Contact Support",
    description: "Get help from our support team for any questions or technical issues.",
    color: "text-blue-500",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl text-foreground mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform combines AI intelligence with proven learning methodologies to help you master
            ICT concepts effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-background flex items-center justify-center mb-4 ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-space-grotesk">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
