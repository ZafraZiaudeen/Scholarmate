import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Award } from "lucide-react"

export function ProgressSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-space-grotesk font-bold text-3xl md:text-4xl text-foreground mb-6">
              Track Your Learning Journey
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Monitor your progress with detailed analytics, identify areas for improvement, and celebrate your
              achievements as you master ICT concepts.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Performance Analytics</h3>
                  <p className="text-sm text-muted-foreground">Detailed insights into your ICT learning patterns</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Achievement Tracking</h3>
                  <p className="text-sm text-muted-foreground">Earn badges and celebrate ICT milestones</p>
                </div>
              </div>

              
            </div>

          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Learning Progress
                </CardTitle>
                <CardDescription>Your current progress across different topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>ICT Fundamentals</span>
                    <span className="text-primary font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Networking Basics</span>
                    <span className="text-primary font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Programming Concepts</span>
                    <span className="text-primary font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Database Management</span>
                    <span className="text-primary font-medium">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-1">127</div>
                  <div className="text-sm text-muted-foreground">Questions Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-accent mb-1">8.5h</div>
                  <div className="text-sm text-muted-foreground">Study Time This Week</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
