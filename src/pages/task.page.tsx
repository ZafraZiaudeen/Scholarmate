import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Star, BookOpen, Play, Plus, Zap } from "lucide-react";
import { useGetTasksQuery } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function TasksPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Fetch tasks from the API
  const { data: tasksResponse, isLoading, error } = useGetTasksQuery(user?.id || "", {
    skip: !user?.id, // Skip the query if user ID is not available
  });

  // Extract tasks from the API response
  const tasks = tasksResponse?.data || [];

  // Calculate progress metrics
  const completedTasks = tasks.filter((task) => task.progress?.completed).length;
  const totalTasks = tasks.length;
  const totalPoints = tasks
    .filter((task) => task.progress?.completed)
    .reduce((sum, task) => sum + (task.progress?.pointsEarned || 0), 0);
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // const getDifficultyColor = (priority: string) => {
  //   switch (priority?.toLowerCase()) {
  //     case "low":
  //       return "bg-green-100 text-green-800";
  //     case "medium":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "high":
  //       return "bg-red-100 text-red-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };
  const handleStartTask = (taskId: string) => {
navigate(`/task/${taskId}`);
  };

  const handleCreateTask = () => {
    navigate("/ai");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your tasks...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center text-red-600">
        <p className="mb-4">Error loading tasks. Please try again later.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Learning Tasks</h1>
                <p className="text-gray-600">Master web design through structured practice</p>
              </div>
            </div>
            <Button onClick={handleCreateTask} className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Task
            </Button>
          </div>

          {/* Progress Overview */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-600">{completedTasks}</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{totalTasks - completedTasks}</div>
                  <div className="text-sm text-gray-600">Tasks Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.round(progressPercentage)}%</div>
                  <div className="text-sm text-gray-600">Overall Progress</div>
                </div>
              </div>
              <div className="mt-4">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-4">Start by creating your first learning task</p>
              <Button onClick={handleCreateTask} className="bg-cyan-600 hover:bg-cyan-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {tasks.map((task) => (
              <Card
                key={task._id}
                className={`transition-all hover:shadow-md ${task.progress?.completed ? "bg-green-50 border-green-200" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {task.progress?.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${task.progress?.completed ? "line-through text-gray-600" : ""}`}>
                          {task.title}
                        </CardTitle>
                        <CardDescription className="mt-1">{task.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                     
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        {task.progress?.pointsEarned || 0}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                      </div>
                      {task.section && (
                        <div className="text-xs">Section: {task.section}</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={task.progress?.completed ? "outline" : "default"}
                      className="flex items-center gap-2"
                      onClick={() => handleStartTask(task._id)}
                    >
                      <Play className="h-4 w-4" />
                      {task.progress?.completed ? "Review" : "Start Task"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Assistant Prompt */}
        <Card className="mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500 rounded-full">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Need Help with a Task?</h3>
                <p className="text-gray-600">
                  Get instant AI assistance, explanations, and personalized guidance for any task.
                </p>
              </div>
              <Button
                onClick={() => navigate("/ai")}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Ask AI Tutor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}