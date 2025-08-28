import { BookOpen, Brain, CheckCircle, Clock, TrendingUp, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@clerk/clerk-react"
import { useEffect } from "react"

export default function DashboardPage() {
  const { getToken } = useAuth()

  useEffect(() => {
    const logToken = async () => {
      try {
        const token = await getToken()
        console.log("Bearer Token:", token)
      } catch (error) {
        console.error("Error getting token:", error)
      }
    }

    logToken()
  }, [getToken])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-cyan-600" />
                <span className="text-xl font-bold text-slate-900">LearnIT</span>
              </div>
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Zap className="h-4 w-4 mr-2" />
                Ask AI
              </Button>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Sarah! 👋</h1>
          <p className="text-slate-600">
            Ready to continue your O/L IT Web Design journey? You're making great progress!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Study Streak</p>
                  <p className="text-2xl font-bold text-slate-900">12 days</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Questions Solved</p>
                  <p className="text-2xl font-bold text-slate-900">247</p>
                </div>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-cyan-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Accuracy Rate</p>
                  <p className="text-2xl font-bold text-slate-900">87%</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Study Time</p>
                  <p className="text-2xl font-bold text-slate-900">24h</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your learning activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700">
                    <div className="text-center">
                      <Brain className="h-6 w-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">AI Tutor</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 border-2 border-orange-200 hover:bg-orange-50 bg-transparent"
                  >
                    <div className="text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <span className="block text-sm font-medium text-orange-600">Past Papers</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Current Progress</CardTitle>
                <CardDescription>Your learning journey across different topics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">HTML & CSS Basics</span>
                    <span className="text-sm text-slate-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">JavaScript Fundamentals</span>
                    <span className="text-sm text-slate-500">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Multimedia Integration</span>
                    <span className="text-sm text-slate-500">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Web Design Principles</span>
                    <span className="text-sm text-slate-500">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Recommended Practice */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your learning patterns and weak areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">CSS Flexbox Practice</h4>
                      <p className="text-sm text-slate-600">15 questions • Estimated 20 min</p>
                    </div>
                    <Button size="sm">Start</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-900">2019 Past Paper - Section A</h4>
                      <p className="text-sm text-slate-600">25 questions • Estimated 30 min</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Practice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
                <CardDescription>Your learning goals for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600 line-through">Complete HTML basics quiz</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600 line-through">Review CSS selectors</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 border-2 border-slate-300 rounded-full"></div>
                    <span className="text-sm text-slate-900">Practice JavaScript functions</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-5 w-5 border-2 border-slate-300 rounded-full"></div>
                    <span className="text-sm text-slate-900">Study multimedia formats</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-slate-900">Completed CSS Grid quiz</p>
                      <p className="text-xs text-slate-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-slate-900">Asked AI about responsive design</p>
                      <p className="text-xs text-slate-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-slate-900">Solved 2018 past paper</p>
                      <p className="text-xs text-slate-500">Yesterday</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Assistant */}
            <Card className="bg-gradient-to-br from-cyan-50 to-orange-50 border-cyan-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-cyan-600" />
                  <span>AI Assistant</span>
                </CardTitle>
                <CardDescription>Get instant help with your studies</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">
                  "I noticed you're struggling with CSS positioning. Would you like me to explain it with examples?"
                </p>
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600">
                  Chat with AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
