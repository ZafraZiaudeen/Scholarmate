import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Declare Clerk on Window interface
declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

const Backend_URL = "http://localhost:8000";

// Define TypeScript interfaces for our data structures
export interface Book {
  _id: string;
  title: string;
  content: string;
  embeddings?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface MCQ {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  bookId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  type: 'learning' | 'practice' | 'assessment';
  section: string;
  content: {
    bookContent?: {
      bookId: string;
      title: string;
      pageNumber: string;
      content: string;
      chapter: string;
    };
    questions: Array<{
      mcqId?: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      completed: boolean;
      userAnswer?: string;
    }>;
  };
  progress: {
    completed: boolean;
    completedAt?: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
export interface GenerateTaskResponse {
  message: string;
  task: Chat;  // It's actually a Chat object from backend
  contentExplanation?: string; // Rich markdown content from backend
  searchResults?: {
    bookResults: Book[];
    mcqResults: MCQ[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
export interface Chat {
  _id: string;
  userId: string;
  query: string;
  response: string;
  timestamp: string;
  savedAsTask: boolean;
  taskId: string | null;
  isTask: boolean;
  content?: {
    bookContent?: {
      bookId: string;
      title: string;
      pageNumber: string;
      content: string;
      chapter: string;
    };
    questions?: Array<{
      mcqId?: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
      completed: boolean;
      userAnswer?: string;
    }>;
  };
}

export interface PastPaper {
  _id: string;
  title: string;
  year: number;
  type: 'part 1' | 'part 2' | 'both';
  paperType: 'model paper' | 'past paper';
  duration?: number;
  description?: string;
  paperFileId: string;
  answerSheetFileId?: string;
  status: 'Draft' | 'Published';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'user' | 'admin';
  createdAt: number;
  lastSignInAt?: number;
  imageUrl?: string;
  banned: boolean;
  locked: boolean;
}

export interface UserListResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminAnalytics {
  users: {
    total: number;
    students: number;
    admins: number;
    growth: number;
  };
  tasks: {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
  };
  recentActivity: Array<{
    type: 'task' | 'chat';
    userName: string;
    action: string;
    time: string;
    userId: string;
  }>;
  topStudents: Array<{
    userId: string;
    userName: string;
    completedTasks: number;
    averageScore: number;
    totalScore: number;
  }>;
  tasksBySection: Array<{
    _id: string;
    count: number;
    completed: number;
  }>;
  systemStatus: {
    aiTutor: string;
    database: string;
    fileStorage: string;
    emailService: string;
  };
}

export interface UserProgress {
  overview: {
    studyStreak: number;
    questionsSolved: number;
    accuracyRate: number;
    studyTime: number;
  };
  progress: {
    totalTasks: number;
    completedTasks: number;
    overallProgress: number;
    totalPoints: number;
  };
  progressBySection: Array<{
    section: string;
    total: number;
    completed: number;
    progress: number;
    averageScore: number;
  }>;
  recentActivity: Array<{
    type: 'task' | 'chat';
    description: string;
    time: string;
  }>;
  recommendedTasks: Array<{
    _id: string;
    title: string;
    description: string;
    priority: string;
    section: string;
  }>;
}

export interface UserTaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  averageScore: number;
  totalQuestions: number;
  correctAnswers: number;
  tasksByType: Record<string, number>;
  tasksByPriority: Record<string, number>;
  recentChats: number;
  lastActivity: string | null;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  adminEmail: string;
  supportEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  systemNotifications: boolean;
  backupFrequency: string;
  sessionTimeout: number;
  openRouterApiKey: string;
  maxTasksPerUser: number;
  defaultTaskDifficulty: string;
  autoBackupEnabled: boolean;
  debugMode: boolean;
  rateLimitPerHour: number;
  maxConcurrentUsers: number;
}

export interface SystemHealth {
  database: {
    status: string;
    responseTime: string;
    connections: number;
    maxConnections: number;
  };
  aiService: {
    status: string;
    responseTime: string;
    requestsToday: number;
    rateLimitRemaining: number;
  };
  fileStorage: {
    status: string;
    usedSpace: string;
    totalSpace: string;
    usagePercentage: number;
  };
  emailService: {
    status: string;
    lastEmailSent: string;
    emailsToday: number;
  };
  system: {
    uptime: string;
    cpuUsage: string;
    memoryUsage: string;
    activeUsers: number;
    maxUsers: number;
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  url: string;
  embedUrl?: string;
}

export interface YouTubeSearchResponse {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}

export interface Achievement {
  _id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  unlockedAt: string;
  progress?: {
    current: number;
    target: number;
  };
  metadata?: any;
}

export interface UserStats {
  _id: string;
  userId: string;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
  averageAccuracy: number;
  totalStudyTime: number;
  videosWatched: number;
  perfectScores: number;
  lastActivityDate: string;
  weeklyGoal: {
    target: number;
    current: number;
    weekStart: string;
  };
  monthlyGoal: {
    target: number;
    current: number;
    monthStart: string;
  };
  badges: string[];
  level: number;
  experiencePoints: number;
  progressToNextLevel?: number;
  xpToNextLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalPoints: number;
  currentStreak: number;
  level: number;
  tasksCompleted: number;
  averageAccuracy: number;
}

export interface VideoCategory {
  _id: string;
  name: string;
  description: string;
  searchQuery: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CuratedVideo {
  _id: string;
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  url: string;
  categoryId: VideoCategory | string;
  isActive: boolean;
  order: number;
  tags: string[];
  adminNotes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Add to TAGS
export const TAGS = {
  BOOKS: 'Books',
  MCQS: 'MCQs',
  TASKS: 'Tasks',
  CHATS: 'Chats',
  PAPERS: 'Papers',
  USERS: 'Users',
  ANALYTICS: 'Analytics',
  SETTINGS: 'Settings',
  YOUTUBE: 'YouTube',
  GAMIFICATION: 'Gamification',
  VIDEO_CATEGORIES: 'VideoCategories',
  CURATED_VIDEOS: 'CuratedVideos'
} as const;

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${Backend_URL}/api/`,
    prepareHeaders: async (headers) => {
      const token = await window?.Clerk?.session?.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  
  tagTypes: [TAGS.BOOKS, TAGS.MCQS, TAGS.TASKS, TAGS.CHATS, TAGS.PAPERS, TAGS.USERS, TAGS.ANALYTICS, TAGS.SETTINGS, TAGS.YOUTUBE, TAGS.GAMIFICATION, TAGS.VIDEO_CATEGORIES, TAGS.CURATED_VIDEOS],
  
  endpoints: (builder) => ({
    // Chat related endpoints
    getChats: builder.query<ApiResponse<Chat[]>, string>({
      query: (userId) => `tasks/chat/user/${userId}`,
      transformResponse: (response: ApiResponse<Chat[]>) => response,
      providesTags: [TAGS.CHATS],
    }),

    getChatById: builder.query<ApiResponse<Chat>, string>({
      query: (chatId) => `tasks/chat/${chatId}`,
      transformResponse: (response: ApiResponse<Chat>) => response,
      providesTags: (result, err, id) => [{ type: TAGS.CHATS, id }],
    }),

    postChat: builder.mutation<ApiResponse<Chat>, { query: string }>({
      query: (body) => ({
        url: "tasks/chat",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.CHATS],
    }),

    saveChatAsTask: builder.mutation<ApiResponse<Task>, string>({
      query: (chatId) => ({
        url: `task/chat/${chatId}/save-as-task`,
        method: "POST",
      }),
      invalidatesTags: [TAGS.TASKS, TAGS.CHATS],
    }),
    // Book related endpoints
    getBooks: builder.query<ApiResponse<Book[]>, void>({
      query: () => "books",
      transformResponse: (response: ApiResponse<Book[]>) => response,
      providesTags: [TAGS.BOOKS],
    }),

    getBookById: builder.query<ApiResponse<Book>, string>({
      query: (id) => `books/${id}`,
      transformResponse: (response: ApiResponse<Book>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.BOOKS, id }],
    }),

    addBookFromPDF: builder.mutation<ApiResponse<Task>, FormData>({
      query: (formData) => ({
        url: "books/pdf",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.BOOKS],
    }),

    // MCQ related endpoints
    getMCQs: builder.query<ApiResponse<MCQ[]>, { bookId?: string }>({
      query: ({ bookId }) => bookId ? `questions?bookId=${bookId}` : 'questions',
      transformResponse: (response: ApiResponse<MCQ[]>) => response,
      providesTags: [TAGS.MCQS],
    }),

    getMCQById: builder.query<ApiResponse<MCQ>, string>({
      query: (id) => `questions/${id}`,
      transformResponse: (response: ApiResponse<MCQ>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.MCQS, id }],
    }),

    addMCQsFromPDF: builder.mutation<ApiResponse<Task>, FormData>({
      query: (formData) => ({
        url: "questions/pdf",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.MCQS],
    }),

    // Task related endpoints
    getTasks: builder.query<ApiResponse<Task[]>, string>({
  query: (userId) => `task/user/${userId}`,
  transformResponse: (response: { tasks: Task[] } | ApiResponse<Task[]>) => {
    // Handle both possible response formats
    if ('success' in response && 'data' in response) {
      return response; // Already in ApiResponse format
    }
    // Convert { tasks: Task[] } to ApiResponse<Task[]>
    return {
      success: true,
      data: response.tasks || [],
      message: response.tasks ? 'Tasks fetched successfully' : 'No tasks found',
    };
  },
  providesTags: [TAGS.TASKS],
}),

   getTaskById: builder.query<ApiResponse<Task>, string>({
  query: (id) => `task/${id}`,
  transformResponse: (response: { task: Task } | ApiResponse<Task>) => {
    if ('success' in response) return response;
    return { success: true, data: response.task, message: "Task fetched successfully" };
  },
  providesTags: (_result, _err, id) => [{ type: TAGS.TASKS, id }],
}),
    // Book embeddings
    generateBookEmbeddings: builder.mutation<ApiResponse<Task>, string>({
      query: (bookId) => ({
        url: `books/${bookId}/embeddings`,
        method: "POST",
      }),
      invalidatesTags: [TAGS.BOOKS],
    }),

updateTaskProgress: builder.mutation<ApiResponse<Task>, { taskId: string; questionId?: string; isCorrect?: boolean; completed?: boolean; userAnswer?: string }>({
  query: (body) => ({
    url: "task/progress",
    method: "PATCH",
    body,
  }),
  invalidatesTags: [TAGS.TASKS],
}),
    // Task generation
   generateTask: builder.mutation<GenerateTaskResponse, { query: string; section?: string; maxBooks?: number; maxQuestions?: number }>({
  query: (body) => ({
    url: "task/generate",
    method: "POST",
    body,
  }),
  invalidatesTags: [TAGS.TASKS],
}),

    // Paper related endpoints
    getPapers: builder.query<ApiResponse<PastPaper[]>, { year?: string; type?: string; paperType?: string; status?: string }>({
      query: ({ year, type, paperType, status }) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (type) params.append('type', type);
        if (paperType) params.append('paperType', paperType);
        if (status) params.append('status', status);
        return `paper?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<PastPaper[]>) => response,
      providesTags: [TAGS.PAPERS],
    }),

    getPaperById: builder.query<ApiResponse<PastPaper>, string>({
      query: (id) => `paper/${id}`,
      transformResponse: (response: ApiResponse<PastPaper>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.PAPERS, id }],
    }),

    uploadPaper: builder.mutation<ApiResponse<PastPaper>, FormData>({
      query: (formData) => ({
        url: "paper/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [TAGS.PAPERS],
    }),

    updatePaper: builder.mutation<ApiResponse<PastPaper>, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `paper/${id}`,
        method: "PATCH",
        body: formData,
      }),
      invalidatesTags: [TAGS.PAPERS],
    }),

    deletePaper: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `paper/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.PAPERS],
    }),

    downloadPaperFile: builder.query<Blob, string>({
      query: (fileId) => ({
        url: `paper/download/${fileId}`,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // User management endpoints
    getUsers: builder.query<UserListResponse, { page?: number; limit?: number; search?: string }>({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        return `user?${params.toString()}`;
      },
      transformResponse: (response: UserListResponse) => response,
      providesTags: [TAGS.USERS],
    }),

    getUserById: builder.query<ApiResponse<User>, string>({
      query: (userId) => `user/${userId}`,
      transformResponse: (response: ApiResponse<User>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.USERS, id }],
    }),

    updateUserRole: builder.mutation<ApiResponse<User>, { userId: string; role: 'user' | 'admin' }>({
      query: ({ userId, role }) => ({
        url: `user/${userId}/role`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: [TAGS.USERS],
    }),

    toggleUserBan: builder.mutation<ApiResponse<User>, string>({
      query: (userId) => ({
        url: `user/${userId}/ban`,
        method: "PATCH",
      }),
      invalidatesTags: [TAGS.USERS],
    }),

    deleteUser: builder.mutation<ApiResponse<void>, string>({
      query: (userId) => ({
        url: `user/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.USERS],
    }),

    // Analytics endpoints
    getAdminAnalytics: builder.query<ApiResponse<AdminAnalytics>, void>({
      query: () => "analytics/admin",
      transformResponse: (response: ApiResponse<AdminAnalytics>) => response,
      providesTags: [TAGS.ANALYTICS],
    }),

    getUserProgress: builder.query<ApiResponse<UserProgress>, void>({
      query: () => "analytics/user/progress",
      transformResponse: (response: ApiResponse<UserProgress>) => response,
      providesTags: [TAGS.ANALYTICS],
    }),

    getUserTaskAnalytics: builder.query<ApiResponse<UserTaskAnalytics>, string>({
      query: (userId) => `analytics/user/${userId}/tasks`,
      transformResponse: (response: ApiResponse<UserTaskAnalytics>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.ANALYTICS, id }],
    }),

    // Settings endpoints
    getSystemSettings: builder.query<ApiResponse<SystemSettings>, void>({
      query: () => "settings",
      transformResponse: (response: ApiResponse<SystemSettings>) => response,
      providesTags: [TAGS.SETTINGS],
    }),

    updateSystemSettings: builder.mutation<ApiResponse<SystemSettings>, Partial<SystemSettings>>({
      query: (settings) => ({
        url: "settings",
        method: "PUT",
        body: settings,
      }),
      invalidatesTags: [TAGS.SETTINGS],
    }),

    resetSystemSettings: builder.mutation<ApiResponse<SystemSettings>, void>({
      query: () => ({
        url: "settings/reset",
        method: "POST",
      }),
      invalidatesTags: [TAGS.SETTINGS],
    }),

    testEmailConfiguration: builder.mutation<ApiResponse<{ message: string }>, { testEmail: string }>({
      query: (body) => ({
        url: "settings/test-email",
        method: "POST",
        body,
      }),
    }),

    createSystemBackup: builder.mutation<ApiResponse<{ backupId: string; createdAt: string; size: string; status: string }>, void>({
      query: () => ({
        url: "settings/backup",
        method: "POST",
      }),
    }),

    clearSystemCache: builder.mutation<ApiResponse<{ message: string }>, void>({
      query: () => ({
        url: "settings/clear-cache",
        method: "POST",
      }),
    }),

    getSystemHealth: builder.query<ApiResponse<SystemHealth>, void>({
      query: () => "settings/health",
      transformResponse: (response: ApiResponse<SystemHealth>) => response,
    }),

    // YouTube API endpoints
    searchYouTubeVideos: builder.query<ApiResponse<YouTubeSearchResponse>, {
      query?: string;
      maxResults?: number;
      pageToken?: string;
      channelId?: string;
      order?: string
    }>({
      query: ({ query = "HTML CSS JavaScript tutorial", maxResults = 12, pageToken, channelId, order = "relevance" }) => {
        const params = new URLSearchParams();
        params.append('query', query);
        params.append('maxResults', maxResults.toString());
        params.append('order', order);
        if (pageToken) params.append('pageToken', pageToken);
        if (channelId) params.append('channelId', channelId);
        return `youtube/search?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<YouTubeSearchResponse>) => response,
      providesTags: [TAGS.YOUTUBE],
    }),

    getYouTubeVideoDetails: builder.query<ApiResponse<YouTubeVideo>, string>({
      query: (videoId) => `youtube/video/${videoId}`,
      transformResponse: (response: ApiResponse<YouTubeVideo>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.YOUTUBE, id }],
    }),

    getYouTubePlaylistVideos: builder.query<ApiResponse<YouTubeSearchResponse>, {
      playlistId: string;
      maxResults?: number;
      pageToken?: string
    }>({
      query: ({ playlistId, maxResults = 20, pageToken }) => {
        const params = new URLSearchParams();
        params.append('maxResults', maxResults.toString());
        if (pageToken) params.append('pageToken', pageToken);
        return `youtube/playlist/${playlistId}?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<YouTubeSearchResponse>) => response,
      providesTags: [TAGS.YOUTUBE],
    }),

    getYouTubeRecommendations: builder.query<ApiResponse<YouTubeSearchResponse>, string>({
      query: (topic) => `youtube/recommendations/${topic}`,
      transformResponse: (response: ApiResponse<YouTubeSearchResponse>) => response,
      providesTags: [TAGS.YOUTUBE],
    }),

    // Gamification API endpoints
    getUserStats: builder.query<ApiResponse<UserStats>, string>({
      query: (userId) => `gamification/stats/${userId}`,
      transformResponse: (response: ApiResponse<UserStats>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.GAMIFICATION, id }],
    }),

    getUserAchievements: builder.query<ApiResponse<Achievement[]>, string>({
      query: (userId) => `gamification/achievements/${userId}`,
      transformResponse: (response: ApiResponse<Achievement[]>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.GAMIFICATION, id }],
    }),

    updateUserStats: builder.mutation<ApiResponse<UserStats>, {
      userId: string;
      tasksCompleted?: number;
      accuracy?: number;
      studyTime?: number;
      videosWatched?: number;
      perfectScore?: boolean;
    }>({
      query: (body) => ({
        url: "gamification/stats/update",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.GAMIFICATION],
    }),

    checkAndUnlockAchievements: builder.mutation<ApiResponse<{ newAchievements: Achievement[]; count: number }>, string>({
      query: (userId) => ({
        url: "gamification/achievements/check",
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: [TAGS.GAMIFICATION],
    }),

    getLeaderboard: builder.query<ApiResponse<LeaderboardEntry[]>, { type?: string; limit?: number }>({
      query: ({ type = 'points', limit = 10 }) => {
        const params = new URLSearchParams();
        params.append('type', type);
        params.append('limit', limit.toString());
        return `gamification/leaderboard?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<LeaderboardEntry[]>) => response,
      providesTags: [TAGS.GAMIFICATION],
    }),

    getUserLevel: builder.query<ApiResponse<{
      level: number;
      experiencePoints: number;
      progressToNextLevel: number;
      xpToNextLevel: number;
      totalPoints: number;
    }>, string>({
      query: (userId) => `gamification/level/${userId}`,
      transformResponse: (response: ApiResponse<any>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.GAMIFICATION, id }],
    }),

    awardPoints: builder.mutation<ApiResponse<{
      totalPoints: number;
      experiencePoints: number;
      level: number;
      pointsAwarded: number;
      reason: string;
    }>, { userId: string; points: number; reason: string }>({
      query: (body) => ({
        url: "gamification/points/award",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.GAMIFICATION],
    }),

    // Video Management API endpoints
    // Video Categories
    getVideoCategories: builder.query<ApiResponse<VideoCategory[]>, { includeInactive?: boolean }>({
      query: ({ includeInactive = false }) => {
        const params = new URLSearchParams();
        if (includeInactive) params.append('includeInactive', 'true');
        return `video-management/categories?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<VideoCategory[]>) => response,
      providesTags: [TAGS.VIDEO_CATEGORIES],
    }),

    getVideoCategoryById: builder.query<ApiResponse<VideoCategory>, string>({
      query: (id) => `video-management/categories/${id}`,
      transformResponse: (response: ApiResponse<VideoCategory>) => response,
      providesTags: (_result, _err, id) => [{ type: TAGS.VIDEO_CATEGORIES, id }],
    }),

    createVideoCategory: builder.mutation<ApiResponse<VideoCategory>, {
      name: string;
      description: string;
      searchQuery: string;
      icon?: string;
      color?: string;
      order?: number;
    }>({
      query: (body) => ({
        url: "video-management/categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.VIDEO_CATEGORIES],
    }),

    updateVideoCategory: builder.mutation<ApiResponse<VideoCategory>, {
      id: string;
      name?: string;
      description?: string;
      searchQuery?: string;
      icon?: string;
      color?: string;
      order?: number;
      isActive?: boolean;
    }>({
      query: ({ id, ...body }) => ({
        url: `video-management/categories/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TAGS.VIDEO_CATEGORIES],
    }),

    deleteVideoCategory: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `video-management/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.VIDEO_CATEGORIES],
    }),

    // Curated Videos
    getCuratedVideos: builder.query<ApiResponse<CuratedVideo[]>, {
      categoryId?: string;
      includeInactive?: boolean;
      tags?: string;
    }>({
      query: ({ categoryId, includeInactive = false, tags }) => {
        const params = new URLSearchParams();
        if (categoryId) params.append('categoryId', categoryId);
        if (includeInactive) params.append('includeInactive', 'true');
        if (tags) params.append('tags', tags);
        return `video-management/videos?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<CuratedVideo[]>) => response,
      providesTags: [TAGS.CURATED_VIDEOS],
    }),

    getCuratedVideosByCategory: builder.query<ApiResponse<CuratedVideo[]>, {
      categoryId: string;
      includeInactive?: boolean;
    }>({
      query: ({ categoryId, includeInactive = false }) => {
        const params = new URLSearchParams();
        if (includeInactive) params.append('includeInactive', 'true');
        return `video-management/videos/category/${categoryId}?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<CuratedVideo[]>) => response,
      providesTags: [TAGS.CURATED_VIDEOS],
    }),

    addCuratedVideo: builder.mutation<ApiResponse<CuratedVideo>, {
      videoId: string;
      categoryId: string;
      order?: number;
      tags?: string[];
      adminNotes?: string;
      title?: string;
      description?: string;
      thumbnail?: string;
      channelTitle?: string;
      publishedAt?: string;
      duration?: string;
      viewCount?: string;
      likeCount?: string;
    }>({
      query: (body) => ({
        url: "video-management/videos",
        method: "POST",
        body,
      }),
      invalidatesTags: [TAGS.CURATED_VIDEOS],
    }),

    updateCuratedVideo: builder.mutation<ApiResponse<CuratedVideo>, {
      id: string;
      categoryId?: string;
      order?: number;
      tags?: string[];
      adminNotes?: string;
      isActive?: boolean;
      title?: string;
      description?: string;
    }>({
      query: ({ id, ...body }) => ({
        url: `video-management/videos/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [TAGS.CURATED_VIDEOS],
    }),

    deleteCuratedVideo: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `video-management/videos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [TAGS.CURATED_VIDEOS],
    }),

    searchYouTubeForCuration: builder.query<ApiResponse<{
      videos: YouTubeVideo[];
      totalResults: number;
    }>, {
      query: string;
      maxResults?: number;
    }>({
      query: ({ query, maxResults = 20 }) => {
        const params = new URLSearchParams();
        params.append('query', query);
        params.append('maxResults', maxResults.toString());
        return `video-management/search-youtube?${params.toString()}`;
      },
      transformResponse: (response: ApiResponse<any>) => response,
    }),
  }),
});

export const {
  useGetBooksQuery,
  useGetBookByIdQuery,
  useAddBookFromPDFMutation,
  useGetMCQsQuery,
  useGetMCQByIdQuery,
  useAddMCQsFromPDFMutation,
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useGenerateBookEmbeddingsMutation,
  useGenerateTaskMutation,
  useGetChatsQuery,
  useGetChatByIdQuery,
  usePostChatMutation,
  useSaveChatAsTaskMutation,
  useUpdateTaskProgressMutation,
  useGetPapersQuery,
  useGetPaperByIdQuery,
  useUploadPaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useDownloadPaperFileQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useToggleUserBanMutation,
  useDeleteUserMutation,
  useGetAdminAnalyticsQuery,
  useGetUserProgressQuery,
  useGetUserTaskAnalyticsQuery,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useResetSystemSettingsMutation,
  useTestEmailConfigurationMutation,
  useCreateSystemBackupMutation,
  useClearSystemCacheMutation,
  useGetSystemHealthQuery,
  useSearchYouTubeVideosQuery,
  useGetYouTubeVideoDetailsQuery,
  useGetYouTubePlaylistVideosQuery,
  useGetYouTubeRecommendationsQuery,
  useGetUserStatsQuery,
  useGetUserAchievementsQuery,
  useUpdateUserStatsMutation,
  useCheckAndUnlockAchievementsMutation,
  useGetLeaderboardQuery,
  useGetUserLevelQuery,
  useAwardPointsMutation,
  // Video Management hooks
  useGetVideoCategoriesQuery,
  useGetVideoCategoryByIdQuery,
  useCreateVideoCategoryMutation,
  useUpdateVideoCategoryMutation,
  useDeleteVideoCategoryMutation,
  useGetCuratedVideosQuery,
  useGetCuratedVideosByCategoryQuery,
  useAddCuratedVideoMutation,
  useUpdateCuratedVideoMutation,
  useDeleteCuratedVideoMutation,
  useSearchYouTubeForCurationQuery,
} = api;