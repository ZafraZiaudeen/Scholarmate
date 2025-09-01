import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  Download,
  Filter,
  BarChart3,
  Target,
  Clock,
  Award,
  CheckCircle
} from "lucide-react"
import { useGetAdminAnalyticsQuery, useGetUsersQuery, useGetPapersQuery } from "@/lib/api"
import { useState } from "react"

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  
  const { data: analyticsResponse, isLoading: analyticsLoading } = useGetAdminAnalyticsQuery()
  const { data: usersResponse } = useGetUsersQuery({ page: 1, limit: 100 })
  const { data: papersResponse } = useGetPapersQuery({})

  const analytics = analyticsResponse?.data
  const users = usersResponse?.data || []
  const papers = papersResponse?.data || []

  // Calculate additional metrics
  const activeUsers = users.filter(user => {
    const lastSignIn = user.lastSignInAt
    if (!lastSignIn) return false
    const daysSinceLastSignIn = Math.floor((Date.now() - lastSignIn) / (1000 * 60 * 60 * 24))
    return daysSinceLastSignIn <= 7
  }).length

  const publishedPapers = papers.filter(paper => paper.status === 'Published').length
  const draftPapers = papers.filter(paper => paper.status === 'Draft').length


  const exportData = () => {
    const data = {
      users: analytics?.users,
      tasks: analytics?.tasks,
      topStudents: analytics?.topStudents,
      tasksBySection: analytics?.tasksBySection,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (analyticsLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Loading comprehensive analytics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | '1y')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.users.total || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics?.users.growth || 0}% from last month
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {activeUsers} active this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.tasks.completionRate || 0}%</div>
            <Progress value={analytics?.tasks.completionRate || 0} className="mt-2" />
            <div className="mt-2 text-xs text-gray-500">
              {analytics?.tasks.completed || 0} of {analytics?.tasks.total || 0} tasks completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Library</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                {publishedPapers} Published
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                {draftPapers} Draft
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Operational</span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Uptime</span>
                <span className="text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Response Time</span>
                <span className="text-green-600">120ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of user roles and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Students</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{analytics?.users.students || 0}</div>
                      <div className="text-xs text-gray-500">
                        {analytics?.users.total ? Math.round((analytics.users.students / analytics.users.total) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Administrators</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{analytics?.users.admins || 0}</div>
                      <div className="text-xs text-gray-500">
                        {analytics?.users.total ? Math.round((analytics.users.admins / analytics.users.total) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Active This Week</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{activeUsers}</div>
                      <div className="text-xs text-gray-500">
                        {analytics?.users.total ? Math.round((activeUsers / analytics.users.total) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Students</CardTitle>
                <CardDescription>Students with highest completion rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topStudents?.slice(0, 5).map((student, index) => (
                    <div key={student.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{student.userName}</div>
                          <div className="text-xs text-gray-500">{student.completedTasks} tasks</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{student.totalScore} pts</div>
                        <div className="text-xs text-gray-500">{student.averageScore}% avg</div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">No student data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Performance by Section</CardTitle>
                <CardDescription>Completion rates across different topics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.tasksBySection?.map((section) => (
                    <div key={section._id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{section._id}</span>
                        <div className="text-xs text-gray-500">
                          {section.completed}/{section.count} ({Math.round((section.completed / section.count) * 100)}%)
                        </div>
                      </div>
                      <Progress 
                        value={section.count > 0 ? (section.completed / section.count) * 100 : 0} 
                        className="h-2"
                      />
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-4">No task data available</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Average Completion Rate</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {analytics?.tasks.completionRate || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Tasks Completed</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {analytics?.tasks.completed || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium">Active Tasks</span>
                    </div>
                    <span className="text-lg font-bold text-orange-600">
                      {analytics?.tasks.active || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content Statistics</CardTitle>
                <CardDescription>Overview of learning materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Papers</span>
                    <span className="text-lg font-semibold">{papers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Published Papers</span>
                    <span className="text-lg font-semibold text-green-600">{publishedPapers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Draft Papers</span>
                    <span className="text-lg font-semibold text-yellow-600">{draftPapers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Tasks</span>
                    <span className="text-lg font-semibold">{analytics?.tasks.total || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Health</CardTitle>
                <CardDescription>Quality and usage metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Publication Rate</span>
                    <Badge variant="outline" className="text-green-700 border-green-200">
                      {papers.length > 0 ? Math.round((publishedPapers / papers.length) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Content Utilization</span>
                    <Badge variant="outline" className="text-blue-700 border-blue-200">
                      High
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Update Frequency</span>
                    <Badge variant="outline" className="text-purple-700 border-purple-200">
                      Weekly
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity Feed</CardTitle>
              <CardDescription>Latest user interactions and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analytics?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-cyan-700">
                        {activity.userName.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        activity.type === 'task' ? 'border-blue-200 text-blue-700' : 'border-orange-200 text-orange-700'
                      }`}
                    >
                      {activity.type}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-8">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}