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
// Add to TAGS
export const TAGS = {
  BOOKS: 'Books',
  MCQS: 'MCQs',
  TASKS: 'Tasks',
  CHATS: 'Chats'
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
  
  tagTypes: [TAGS.BOOKS, TAGS.MCQS, TAGS.TASKS, TAGS.CHATS],
  
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
        url: `tasks/chat/${chatId}/save-as-task`,
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
    getTasks: builder.query<ApiResponse<Task[]>, void>({
      query: () => "tasks",
      transformResponse: (response: ApiResponse<Task[]>) => response,
      providesTags: [TAGS.TASKS],
    }),

    getTaskById: builder.query<ApiResponse<Task>, string>({
      query: (id) => `tasks/${id}`,
      transformResponse: (response: ApiResponse<Task>) => response,
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

    // Task generation
   generateTask: builder.mutation<GenerateTaskResponse, { query: string; section?: string; maxBooks?: number; maxQuestions?: number }>({
  query: (body) => ({
    url: "task/generate",
    method: "POST",
    body,
  }),
  invalidatesTags: [TAGS.TASKS],
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
} = api;