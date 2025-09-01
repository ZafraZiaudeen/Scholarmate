import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, BookOpen, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useGetAdminAnalyticsQuery, useGetPapersQuery } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboard() {
  const { data: analyticsResponse, isLoading: analyticsLoading, error: analyticsError } = useGetAdminAnalyticsQuery();
  const { data: papersResponse } = useGetPapersQuery({});

  const analytics = analyticsResponse?.data;
  const papers = papersResponse?.data || [];

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'offline':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'healthy':
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (analyticsLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-red-600">Error loading dashboard data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your learning platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.users.students || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics?.users.growth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Papers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{papers.length}</div>
            <p className="text-xs text-muted-foreground">
              {papers.filter(p => p.status === 'Published').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.tasks.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.tasks.total || 0} total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.tasks.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.tasks.completed || 0} completed tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Student Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-cyan-700">
                      {activity.userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.systemStatus && Object.entries(analytics.systemStatus).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <Badge className={`${getStatusColor(status)} flex items-center gap-1`}>
                    {getStatusIcon(status)}
                    <span className="capitalize">{status}</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Students and Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.topStudents?.map((student, index) => (
                <div key={student.userId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-orange-500 flex items-center justify-center text-white text-xs font-medium">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.userName}</p>
                      <p className="text-xs text-gray-500">
                        {student.completedTasks} tasks completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{student.totalScore} pts</p>
                    <p className="text-xs text-gray-500">{student.averageScore}% avg</p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No student data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.tasksBySection?.map((section) => (
                <div key={section._id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-900">{section._id}</span>
                    <span className="text-xs text-gray-500">
                      {section.completed}/{section.count} completed
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-cyan-600 h-2 rounded-full"
                      style={{
                        width: `${section.count > 0 ? (section.completed / section.count) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No task data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
