import { useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, BookOpen, Code, Lightbulb, MessageCircle, Sparkles, Clock, Save } from "lucide-react";
import { useGenerateTaskMutation, useSaveChatAsTaskMutation, Chat } from "@/lib/api";
import "@/components/markdown-styles.css";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface QuickTopic {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface ChatMessage {
  type: "user" | "ai";
  message?: string;
  timestamp: string;
  chatId?: string;
  isTask?: boolean;
  savedAsTask?: boolean;
  taskContent?: {
    bookContent?: {
      title: string;
      pageNumber: string;
      content: string;
      chapter: string;
    };
    questions?: Array<{
      mcqId?: string;
      question: string;
      options: string[];
      correctAnswer?: string; // Kept for internal use but not displayed
      explanation?: string;   // Kept for internal use but not displayed
      completed: boolean;
    }>;
  };
}

const quickTopics: QuickTopic[] = [
  { icon: Code, title: "HTML Basics", description: "Tags, attributes, semantic elements" },
  { icon: Sparkles, title: "CSS Styling", description: "Selectors, properties, layouts" },
  { icon: Brain, title: "JavaScript", description: "Variables, functions, DOM manipulation" },
  { icon: BookOpen, title: "Past Papers", description: "2018-2023 questions explained" },
];

export default function AITutorPage() {
  const [message, setMessage] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      type: "ai",
      message:
        "Hello! I'm your AI tutor for O/L IT Web Design. I can help you with HTML, CSS, JavaScript, multimedia integration, and past paper questions. What would you like to learn today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Markdown rendering components
  type CodePropsLike = React.HTMLAttributes<HTMLElement> & {
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
  };

  const markdownComponents: Components = {
    code(rawProps: CodePropsLike) {
      const { inline, className, children, ...props } = rawProps;
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match) {
        return (
          <pre className="bg-slate-100 p-3 rounded-md overflow-x-auto my-2">
            <code className="text-sm font-mono text-slate-800">{String(children).replace(/\n$/, "")}</code>
          </pre>
        );
      }
      return (
        <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-slate-800" {...props}>
          {children}
        </code>
      );
    },
    ul({ children }) {
      return <ul className="list-disc pl-5 space-y-1 mb-3">{children}</ul>;
    },
    ol({ children }) {
      return <ol className="list-decimal pl-5 space-y-1 mb-3">{children}</ol>;
    },
    li({ children }) {
      return <li className="mb-1 text-slate-700">{children}</li>;
    },
    blockquote({ children }) {
      return (
        <blockquote className="border-l-4 border-slate-300 pl-4 my-3 italic bg-slate-50 py-2 rounded-r-md text-slate-700">
          {children}
        </blockquote>
      );
    },
    h1({ children }) {
      return <h1 className="text-2xl font-bold mt-4 mb-3 text-slate-900">{children}</h1>;
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold mt-4 mb-2 text-slate-800">{children}</h2>;
    },
    h3({ children }) {
      return <h3 className="text-lg font-semibold mt-3 mb-2 text-slate-700">{children}</h3>;
    },
    p({ children }) {
      return <p className="mb-3 leading-relaxed text-slate-700">{children}</p>;
    },
    strong({ children }) {
      return <strong className="font-semibold text-slate-800">{children}</strong>;
    },
    em({ children }) {
      return <em className="italic text-slate-600">{children}</em>;
    },
    hr() {
      return <hr className="my-4 border-t-2 border-slate-200" />;
    },
  };

  // RTK Query hooks
  const [generateTask, { isLoading: isGeneratingTask }] = useGenerateTaskMutation();
  const [saveChatAsTask] = useSaveChatAsTaskMutation();

  // Handle message submission
  const handleSendMessage = async (): Promise<void> => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      type: "user",
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await generateTask({
        query: message,
        section: "Web Development",
        maxBooks: 3,
        maxQuestions: 5,
      }).unwrap();

      const task: Chat = response.task;

      // Use only contentExplanation for the message, avoiding task content duplication
      const aiMessageContent = response.contentExplanation || "Here's your personalized learning task!";

      const aiMessage: ChatMessage = {
        type: "ai",
        message: aiMessageContent,
        timestamp: new Date().toLocaleTimeString(),
        chatId: task._id,
        isTask: task.isTask,
        savedAsTask: task.savedAsTask,
        taskContent: {
          bookContent: task.content?.bookContent
            ? {
                title: task.content.bookContent.title,
                pageNumber: task.content.bookContent.pageNumber,
                content: task.content.bookContent.content,
                chapter: task.content.bookContent.chapter,
              }
            : undefined,
          questions: task.content?.questions
            ? task.content.questions.map((q) => ({
                mcqId: q.mcqId,
                question: q.question,
                options: q.options,
                completed: q.completed,
              }))
            : undefined,
        },
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error generating task:", error);
      let errorMessageText = "Sorry, something went wrong. Please try again.";
      if ((error as FetchBaseQueryError).status) {
        const fetchError = error as FetchBaseQueryError;
        if (fetchError.data && typeof fetchError.data === "object" && "error" in fetchError.data) {
          errorMessageText = (fetchError.data as { error: string }).error;
        }
      }
      const errorMessage: ChatMessage = {
        type: "ai",
        message: errorMessageText,
        timestamp: new Date().toLocaleTimeString(),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle saving chat as task
  const handleSaveChatAsTask = async (chatId: string): Promise<void> => {
    try {
      await saveChatAsTask(chatId).unwrap();
      setChatHistory((prev) =>
        prev.map((chat) => (chat.chatId === chatId ? { ...chat, savedAsTask: true } : chat))
      );
      alert("Chat successfully saved as task!");
    } catch (error) {
      console.error("Error saving chat as task:", error);
      alert("Failed to save chat as task. Please try again.");
    }
  };

  // Handle quick topic selection
  const handleQuickTopic = (topic: string): void => {
    setMessage(topic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section remains unchanged */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-cyan-600" />
                <span className="text-xl font-bold text-slate-900">AI Tutor</span>
              </div>
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                Online
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Study Materials
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Session History
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar: Quick Topics and Study Tips remain unchanged */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Topics</CardTitle>
                <CardDescription>Jump into specific areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickTopics.map((topic, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-slate-50"
                    onClick={() => handleQuickTopic(topic.title)}
                  >
                    <div className="flex items-start space-x-3">
                      <topic.icon className="h-5 w-5 text-cyan-600 mt-0.5" />
                      <div className="text-left">
                        <div className="font-medium text-sm">{topic.title}</div>
                        <div className="text-xs text-slate-500">{topic.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Study Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5" />
                    <p className="text-slate-600">Ask specific questions for better explanations</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5" />
                    <p className="text-slate-600">Request code examples when learning concepts</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-orange-500 mt-0.5" />
                    <p className="text-slate-600">Practice with past paper questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Chat Interface */}
          <section className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900">Chat with AI Tutor</CardTitle>
                <CardDescription className="text-slate-600">
                  Get instant help with your O/L IT Web Design questions
                </CardDescription>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-24rem)] px-6">
                <div className="space-y-6 py-4">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`${
                          chat.type === "user"
                            ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white"
                            : "bg-white border border-slate-200"
                        } rounded-lg p-4 max-w-[80%]`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {chat.type === "ai" ? (
                            <>
                              <Brain className="h-4 w-4 text-cyan-600" />
                              <span className="text-sm font-medium text-cyan-600">AI Tutor</span>
                            </>
                          ) : (
                            <>
                              <MessageCircle className="h-4 w-4 text-white" />
                              <span className="text-sm font-medium text-white">You</span>
                            </>
                          )}
                        </div>
                        {chat.type === "ai" && chat.message ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            className="prose prose-slate text-sm max-w-none"
                            components={markdownComponents}
                          >
                            {chat.message}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm">{chat.message}</p>
                        )}
                        {chat.isTask && chat.taskContent && (
                          <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                            <Badge variant="outline" className="mb-2">Learning Task</Badge>
                            {chat.taskContent.bookContent && (
                              <div className="mb-4">
                                <h4 className="font-medium text-sm text-slate-800">Book Content:</h4>
                                <p className="text-sm text-slate-600">
                                  <strong>{chat.taskContent.bookContent.title}</strong> (Chapter: {chat.taskContent.bookContent.chapter}, Page: {chat.taskContent.bookContent.pageNumber})
                                </p>
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  className="prose prose-slate text-sm max-w-none mt-2"
                                  components={markdownComponents}
                                >
                                  {chat.taskContent.bookContent.content}
                                </ReactMarkdown>
                              </div>
                            )}
                            {chat.taskContent.questions && chat.taskContent.questions.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm text-slate-800">Questions:</h4>
                                {chat.taskContent.questions.map((q, qIndex) => (
                                  <div key={qIndex} className="mt-4">
                                    <p className="text-sm font-medium text-slate-700">{q.question}</p>
                                    <ul className="list-decimal pl-6 mt-2 text-sm text-slate-600">
                                      {q.options.map((option, oIndex) => (
                                        <li key={oIndex} className="ml-2">
                                          {option.replace(/^\(\d+\)\s/, "")}
                                        </li>
                                      ))}
                                    </ul>
                                    {q.completed && (
                                      <Badge variant="outline" className="mt-1">Completed</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {chat.chatId && !chat.savedAsTask && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => handleSaveChatAsTask(chat.chatId!)}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save as Task
                              </Button>
                            )}
                          </div>
                        )}
                        <div
                          className={`text-xs mt-2 ${
                            chat.type === "user" ? "text-cyan-100" : "text-slate-500"
                          }`}
                        >
                          {chat.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(isTyping || isGeneratingTask) && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 rounded-lg p-4 max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-2">
                          <Brain className="h-4 w-4 text-cyan-600" />
                          <span className="text-sm font-medium text-cyan-600">AI Tutor</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>

            {/* Message Input Area remains unchanged */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about O/L IT Web Design..."
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isGeneratingTask}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => handleQuickTopic("Explain CSS Grid")}
                  >
                    Explain CSS Grid
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => handleQuickTopic("JavaScript functions")}
                  >
                    JavaScript functions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => handleQuickTopic("2022 past paper Q5")}
                  >
                    2022 past paper Q5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs bg-transparent"
                    onClick={() => handleQuickTopic("HTML semantic tags")}
                  >
                    HTML semantic tags
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}