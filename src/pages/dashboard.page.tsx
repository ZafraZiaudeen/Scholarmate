import { BookOpen, Brain, CheckCircle, Clock, TrendingUp, Zap, Play, Plus, Video, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useAuth, useUser } from "@clerk/clerk-react"
import { useEffect } from "react"
import { useGetUserProgressQuery } from "@/lib/api"
import { useNavigate } from "react-router-dom"

export default function DashboardPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  // Fetch user progress from the API
  const { data: progressResponse, isLoading, error } = useGetUserProgressQuery(undefined, {
    skip: !user?.id, // Skip the query if user ID is not available
  });

  const progress = progressResponse?.data;

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleNavigateToAI = () => {
    navigate("/ai");
  };

  const handleNavigateToPapers = () => {
    navigate("/past-papers");
  };

  const handleStartTask = (taskId: string) => {
    navigate(`/questions-for-task/${taskId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading dashboard. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
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
                  <p className="text-2xl font-bold text-slate-900">
                    {progress?.overview.studyStreak || 0} days
                  </p>
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
                  <p className="text-2xl font-bold text-slate-900">
                    {progress?.overview.questionsSolved || 0}
                  </p>
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
                  <p className="text-2xl font-bold text-slate-900">
                    {progress?.overview.accuracyRate || 0}%
                  </p>
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
                  <p className="text-2xl font-bold text-slate-900">
                    {progress?.overview.studyTime || 0}h
                  </p>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    className="h-20 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
                    onClick={handleNavigateToAI}
                  >
                    <div className="text-center">
                      <Brain className="h-6 w-6 mx-auto mb-2" />
                      <span className="block text-sm font-medium">AI Tutor</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 border-2 border-orange-200 hover:bg-orange-50 bg-transparent"
                    onClick={handleNavigateToPapers}
                  >
                    <div className="text-center">
                      <BookOpen className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <span className="block text-sm font-medium text-orange-600">Past Papers</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 border-2 border-red-200 hover:bg-red-50 bg-transparent"
                    onClick={() => navigate('/videos')}
                  >
                    <div className="text-center">
                      <Video className="h-6 w-6 mx-auto mb-2 text-red-600" />
                      <span className="block text-sm font-medium text-red-600">Video Learning</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 border-2 border-yellow-200 hover:bg-yellow-50 bg-transparent"
                    onClick={() => navigate('/achievements')}
                  >
                    <div className="text-center">
                      <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                      <span className="block text-sm font-medium text-yellow-600">Achievements</span>
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
                {progress?.progressBySection && progress.progressBySection.length > 0 ? (
                  progress.progressBySection.map((section) => (
                    <div key={section.section}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">{section.section}</span>
                        <span className="text-sm text-slate-500">{section.progress}%</span>
                      </div>
                      <Progress value={section.progress} className="h-2" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No progress data yet</p>
                    <Button onClick={handleNavigateToAI} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Practice */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended for You</CardTitle>
                <CardDescription>Based on your learning patterns and progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progress?.recommendedTasks && progress.recommendedTasks.length > 0 ? (
                    progress.recommendedTasks.map((task) => (
                      <div key={task._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-slate-900">{task.title}</h4>
                          <p className="text-sm text-slate-600">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {task.section}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                task.priority === 'high' ? 'border-red-200 text-red-700' :
                                task.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {task.priority} priority
                            </Badge>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => handleStartTask(task._id)}>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No recommendations yet</p>
                      <Button onClick={handleNavigateToAI} className="bg-cyan-600 hover:bg-cyan-700">
                        Create Your First Task
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                <CardDescription>Your achievements today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Tasks Completed</span>
                    <span className="text-lg font-bold text-slate-900">
                      {progress?.progress.completedTasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total Points</span>
                    <span className="text-lg font-bold text-slate-900">
                      {progress?.progress.totalPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Overall Progress</span>
                    <span className="text-lg font-bold text-slate-900">
                      {progress?.progress.overallProgress || 0}%
                    </span>
                  </div>
                  <Progress value={progress?.progress.overallProgress || 0} className="h-2" />
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
                  {progress?.recentActivity && progress.recentActivity.length > 0 ? (
                    progress.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === 'task' ? 'bg-cyan-500' : 'bg-orange-500'
                        }`}></div>
                        <div>
                          <p className="text-sm text-slate-900">{activity.description}</p>
                          <p className="text-xs text-slate-500">{formatTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
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
                  "Ready to help you understand any topic or solve practice questions!"
                </p>
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-600 hover:to-orange-600"
                  onClick={handleNavigateToAI}
                >
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
