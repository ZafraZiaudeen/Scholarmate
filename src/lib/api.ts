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

// Add to TAGS
export const TAGS = {
  BOOKS: 'Books',
  MCQS: 'MCQs',
  TASKS: 'Tasks',
  CHATS: 'Chats',
  PAPERS: 'Papers',
  USERS: 'Users'
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
  
  tagTypes: [TAGS.BOOKS, TAGS.MCQS, TAGS.TASKS, TAGS.CHATS, TAGS.PAPERS, TAGS.USERS],
  
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

updateTaskProgress: builder.mutation<ApiResponse<Task>, { taskId: string; questionId?: string; isCorrect?: boolean; completed?: boolean }>({
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
} = api;