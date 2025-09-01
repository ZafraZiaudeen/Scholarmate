import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Flame,
  Target,
  Award,
  TrendingUp,
  Users,
  Crown,
  Calendar,
  Clock
} from "lucide-react";
import {
  useGetUserStatsQuery,
  useGetUserAchievementsQuery,
  useGetLeaderboardQuery,
  useGetUserLevelQuery
} from "@/lib/api";
import { useUser } from "@clerk/clerk-react";


const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  return date.toLocaleDateString();
};

const formatStudyTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const getLevelTitle = (level: number): string => {
  if (level >= 50) return "Grandmaster";
  if (level >= 40) return "Expert";
  if (level >= 30) return "Advanced";
  if (level >= 20) return "Proficient";
  if (level >= 10) return "Intermediate";
  if (level >= 5) return "Apprentice";
  return "Beginner";
};

const getLevelColor = (level: number): string => {
  if (level >= 50) return "bg-purple-100 text-purple-700 border-purple-200";
  if (level >= 40) return "bg-red-100 text-red-700 border-red-200";
  if (level >= 30) return "bg-orange-100 text-orange-700 border-orange-200";
  if (level >= 20) return "bg-yellow-100 text-yellow-700 border-yellow-200";
  if (level >= 10) return "bg-green-100 text-green-700 border-green-200";
  if (level >= 5) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
};

export default function AchievementsPage() {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState("overview");

  const {
    data: userStatsResponse
  } = useGetUserStatsQuery(user?.id || "", {
    skip: !user?.id
  });

  const {
    data: achievementsResponse
  } = useGetUserAchievementsQuery(user?.id || "", {
    skip: !user?.id
  });

  const {
    data: levelResponse
  } = useGetUserLevelQuery(user?.id || "", {
    skip: !user?.id
  });

  const {
    data: leaderboardResponse
  } = useGetLeaderboardQuery({ type: 'points', limit: 10 });

  const userStats = userStatsResponse?.data;
  const achievements = achievementsResponse?.data || [];
  const levelData = levelResponse?.data;
  const leaderboard = leaderboardResponse?.data || [];

  const recentAchievements = [...achievements]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 5);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
     

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            🏆 Achievements & Progress
          </h1>
          <p className="text-slate-600">
            Track your learning journey, unlock achievements, and compete with other students!
          </p>
        </div>

        {/* Level and XP Overview */}
        {levelData && (
          <Card className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Level {levelData.level}</h2>
                    <Badge className={getLevelColor(levelData.level)}>
                      {getLevelTitle(levelData.level)}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total Points</p>
                  <p className="text-2xl font-bold text-cyan-600">{levelData.totalPoints.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progress to Level {levelData.level + 1}</span>
                  <span className="text-slate-900 font-medium">
                    {levelData.experiencePoints.toLocaleString()} / {(levelData.experiencePoints + levelData.xpToNextLevel).toLocaleString()} XP
                  </span>
                </div>
                <Progress value={levelData.progressToNextLevel} className="h-3" />
                <p className="text-xs text-slate-500 text-center">
                  {levelData.xpToNextLevel.toLocaleString()} XP needed for next level
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{userStats.currentStreak}</p>
                    <p className="text-sm text-slate-600">Day Streak</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{userStats.tasksCompleted}</p>
                    <p className="text-sm text-slate-600">Tasks Done</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{userStats.averageAccuracy.toFixed(1)}%</p>
                    <p className="text-sm text-slate-600">Accuracy</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{formatStudyTime(userStats.totalStudyTime)}</p>
                    <p className="text-sm text-slate-600">Study Time</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span>Recent Achievements</span>
                </CardTitle>
                <CardDescription>Your latest unlocked achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {recentAchievements.map((achievement) => (
                      <div key={achievement._id} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                          <p className="text-sm text-slate-600">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-yellow-100 text-yellow-700">
                            +{achievement.points} pts
                          </Badge>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatTimeAgo(achievement.unlockedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No achievements yet</p>
                    <p className="text-sm text-gray-500">Complete tasks to start earning achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Progress */}
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <span>Weekly Goal</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{userStats.weeklyGoal.current} / {userStats.weeklyGoal.target} tasks</span>
                      </div>
                      <Progress 
                        value={(userStats.weeklyGoal.current / userStats.weeklyGoal.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span>Monthly Goal</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{userStats.monthlyGoal.current} / {userStats.monthlyGoal.target} tasks</span>
                      </div>
                      <Progress 
                        value={(userStats.monthlyGoal.current / userStats.monthlyGoal.target) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>All Achievements ({achievements.length})</CardTitle>
                <CardDescription>Your complete achievement collection</CardDescription>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement._id} className="p-4 border border-slate-200 rounded-lg bg-white">
                        <div className="flex items-start space-x-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{achievement.title}</h4>
                            <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-yellow-100 text-yellow-700">
                                +{achievement.points} pts
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {formatTimeAgo(achievement.unlockedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No achievements yet</h3>
                    <p className="text-gray-500 mb-4">Start learning to unlock your first achievement!</p>
                    <Button onClick={() => window.location.href = '/ai'}>
                      Start Learning
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            {userStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tasks Completed</span>
                      <span className="font-medium">{userStats.tasksCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Average Accuracy</span>
                      <span className="font-medium">{userStats.averageAccuracy.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Perfect Scores</span>
                      <span className="font-medium">{userStats.perfectScores}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Videos Watched</span>
                      <span className="font-medium">{userStats.videosWatched}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Study Time</span>
                      <span className="font-medium">{formatStudyTime(userStats.totalStudyTime)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Streak Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Current Streak</span>
                      <span className="font-medium flex items-center">
                        <Flame className="h-4 w-4 text-orange-500 mr-1" />
                        {userStats.currentStreak} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Longest Streak</span>
                      <span className="font-medium">{userStats.longestStreak} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Last Activity</span>
                      <span className="font-medium">{formatTimeAgo(userStats.lastActivityDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <span>Top Students</span>
                </CardTitle>
                <CardDescription>See how you rank against other students</CardDescription>
              </CardHeader>
              <CardContent>
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.userId} 
                        className={`flex items-center space-x-4 p-3 rounded-lg ${
                          entry.userId === user.id ? 'bg-cyan-50 border border-cyan-200' : 'bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {entry.userId === user.id ? 'You' : `Student ${entry.userId.slice(-4)}`}
                          </p>
                          <p className="text-sm text-slate-600">
                            Level {entry.level} • {entry.tasksCompleted} tasks • {entry.averageAccuracy.toFixed(1)}% accuracy
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-purple-600">{entry.totalPoints.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No leaderboard data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}