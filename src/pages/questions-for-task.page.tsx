"use client";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Lightbulb,
  MessageCircle,
  Clock,
  Star,
  ChevronRight,
  Code,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useGetTaskByIdQuery, useUpdateTaskProgressMutation } from "@/lib/api";

interface Step {
  id: string;
  type: "content" | "mcq" | "coding" | "theory";
  points: number;
  title?: string;
  content?: string;
  chapter?: string;
  pageNumber?: string;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  mcqId?: string;
  codeTemplate?: string;
  expectedOutput?: string;
}

interface TaskDetail {
  _id: string;
  title: string;
  description: string;
  priority?: "low" | "medium" | "high";
  section?: string;
  content: {
    bookContent?: {
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
      completed: boolean;
      explanation: string;
    }>;
  };
  progress: {
    completed: boolean;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
  };
  dueDate?: string;
}

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { data: taskResponse, isLoading, error } = useGetTaskByIdQuery(taskId || "");
  const [updateTaskProgress] = useUpdateTaskProgressMutation();
  const task = taskResponse?.data as TaskDetail | undefined;

  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isQuestionsListOpen, setIsQuestionsListOpen] = useState(false);

  useEffect(() => {
    if (task) {
      const newSteps: Step[] = [];
      if (task.content.bookContent) {
        newSteps.push({
          id: "content",
          type: "content",
          title: task.content.bookContent.title || "Study Material",
          content: task.content.bookContent.content,
          chapter: task.content.bookContent.chapter,
          pageNumber: task.content.bookContent.pageNumber,
          points: 0,
        });
      }
      task.content.questions.forEach((q, index) => {
        newSteps.push({
          id: `q${index + 1}`,
          type: "mcq",
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          mcqId: q.mcqId,
          points: 10,
        });
      });
      setSteps(newSteps);
      setTaskCompleted(task.progress.completed);
      setScore(task.progress.score);
      console.log("Task Questions:", task.content.questions); // Debug task data
    }
  }, [task]);

  useEffect(() => {
    if (!taskId || error) {
      navigate("/task");
      return;
    }

    const timer = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [taskId, error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !task || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading task. Please try again later.</p>
          <Button onClick={() => navigate("/task")}>Back to Tasks</Button>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;
  const difficulty = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "Medium";
  const estimatedTime = `${steps.length * 5} min`;
  const totalPoints = task.progress.totalQuestions * 10;

  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: value,
    }));
  };

  const handleSubmitAnswer = async () => {
    if (currentStep.type === "mcq") {
      const selected = answers[currentStep.id]?.toString().trim();
      // Remove parentheses and trim the correctAnswer
      const correctAnswer = currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim();
      
      // Debugging logs
      console.log("Selected Answer:", selected, typeof selected);
      console.log("Correct Answer (normalized):", correctAnswer, typeof correctAnswer);
      
      if (!selected || !correctAnswer) {
        console.error("Answer or correctAnswer is undefined:", { selected, correctAnswer });
        setShowFeedback(true);
        return;
      }

      const isCorrect = selected === correctAnswer;
      console.log("Is Correct:", isCorrect);

      if (isCorrect) {
        setScore((prev) => prev + currentStep.points);
      }
      await updateTaskProgress({
        taskId: task._id,
        questionId: currentStep.mcqId || currentStep.id,
        isCorrect,
      });
    }
    setShowFeedback(true);
  };

  const handleTryAgain = () => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep.id]: undefined,
    }));
    setShowFeedback(false);
  };

  const handleNextStep = async () => {
    if (isLastStep) {
      await updateTaskProgress({
        taskId: task._id,
        completed: true,
      });
      setTaskCompleted(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
      setShowFeedback(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Convert number to letter for display
  const numberToLetter = (index: number) => String.fromCharCode(65 + index); // 0 -> A, 1 -> B, etc.

  if (taskCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Completed!</h1>
                <p className="text-gray-600">Congratulations on completing "{task.title}"</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={() => navigate("/task")} className="w-full">
                  Back to Tasks
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Review Answers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/task")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center gap-4 mt-1">
              <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                {formatTime(timeSpent)} / {estimatedTime}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Star className="h-4 w-4" />
                {score} / {totalPoints} points
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* All Questions List */}
        <Card className="mb-6">
          <Collapsible open={isQuestionsListOpen} onOpenChange={setIsQuestionsListOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
              <span className="text-lg font-medium">All Questions</span>
              {isQuestionsListOpen ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4">
              <div className="space-y-4">
                {steps
                  .filter((step) => step.type === "mcq")
                  .map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-3 rounded-lg border ${
                        step.id === currentStep.id
                          ? "bg-cyan-50 border-cyan-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900">
                        Question {index + 1}: {step.question}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Status: {answers[step.id] ? "Answered" : "Not Answered"}
                      </p>
                      {answers[step.id] && (
                        <p className="text-xs text-gray-600">
                          Your Answer: {numberToLetter(parseInt(answers[step.id]) - 1)} ({answers[step.id]})
                          {answers[step.id].toString().trim() === step.correctAnswer?.toString().replace(/[()]/g, "").trim() ? (
                            <span className="text-green-600 ml-2">✓ Correct</span>
                          ) : (
                            <span className="text-red-600 ml-2">✗ Incorrect</span>
                          )}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              {currentStep.type === "content" && <BookOpen className="h-5 w-5 text-blue-500" />}
              {currentStep.type === "mcq" && <Lightbulb className="h-5 w-5 text-yellow-500" />}
              {currentStep.type === "coding" && <Code className="h-5 w-5 text-green-500" />}
              {currentStep.type === "theory" && <Lightbulb className="h-5 w-5 text-yellow-500" />}
              <Badge variant="outline">{currentStep.type.toUpperCase()}</Badge>
              <Badge variant="secondary">{currentStep.points} points</Badge>
            </div>
            <CardTitle className="text-lg">
              {currentStep.type === "content" ? currentStep.title : currentStep.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Content Step */}
            {currentStep.type === "content" && (
              <div className="prose max-w-none text-gray-700">
                {currentStep.chapter && (
                  <p>
                    <strong>Chapter:</strong> {currentStep.chapter}
                  </p>
                )}
                {currentStep.pageNumber && (
                  <p>
                    <strong>Page:</strong> {currentStep.pageNumber}
                  </p>
                )}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="mt-4 prose prose-slate max-w-none"
                  components={{
                    p: ({ children }) => <p className="mb-3 text-gray-700">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3">{children}</ul>,
                    li: ({ children }) => <li className="mb-1 text-gray-700">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-3 text-gray-900">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mt-4 mb-2 text-gray-800">{children}</h2>,
                  }}
                >
                  {currentStep.content}
                </ReactMarkdown>
              </div>
            )}

            {/* MCQ Step */}
            {currentStep.type === "mcq" && currentStep.options && (
              <RadioGroup
                value={answers[currentStep.id] || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
                disabled={showFeedback}
              >
                {currentStep.options.map((option, index) => {
                  const value = (index + 1).toString(); // Use 1, 2, 3, 4
                  const letter = numberToLetter(index); // Display A, B, C, D
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={`option-${value}`} />
                      <Label htmlFor={`option-${value}`} className="flex-1 cursor-pointer">
                        {letter}. {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}

            {/* Theory Step */}
            {currentStep.type === "theory" && (
              <Textarea
                placeholder="Type your answer here..."
                value={answers[currentStep.id] || ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="min-h-32"
                disabled={showFeedback}
              />
            )}

            {/* Coding Step */}
            {currentStep.type === "coding" && (
              <div className="space-y-4">
                <Textarea
                  placeholder="Write your code here..."
                  value={answers[currentStep.id] || currentStep.codeTemplate || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="min-h-48 font-mono text-sm"
                  disabled={showFeedback}
                />
                {currentStep.expectedOutput && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Expected Output:</p>
                    <p className="text-sm text-gray-600">{currentStep.expectedOutput}</p>
                  </div>
                )}
              </div>
            )}

            {/* Feedback */}
            {showFeedback && currentStep.type === "mcq" && (
              <div className="mt-4 p-4 rounded-lg border bg-white">
                <div className="flex items-center gap-2 mb-2">
                  {answers[currentStep.id]?.toString().trim() ===
                  currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="font-medium text-green-700">Correct! Well done!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="font-medium text-red-700">Incorrect, but let's learn from this!</span>
                    </>
                  )}
                </div>
                {currentStep.explanation && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-slate text-sm max-w-none text-gray-600"
                    components={{
                      p: ({ children }) => <p className="mb-3 text-gray-600">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3">{children}</ul>,
                      li: ({ children }) => <li className="mb-1 text-gray-600">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                    }}
                  >
                    {currentStep.explanation}
                  </ReactMarkdown>
                )}
                {answers[currentStep.id]?.toString().trim() !==
                  currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>
                      <strong>Tip:</strong> Review the related content in{' '}
                      {task.content.bookContent ? (
                        <span>
                          Chapter "{task.content.bookContent.chapter}" on page {task.content.bookContent.pageNumber}
                        </span>
                      ) : (
                        "the study material"
                      )}{" "}
                      to better understand this concept.
                    </p>
                    <p className="mt-2">
                      Need more help?{" "}
                      <button
                        className="text-cyan-600 hover:underline"
                        onClick={() => navigate("/ai")}
                      >
                        Ask the AI Tutor
                      </button>{" "}
                      for a detailed explanation.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={handleTryAgain}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}

            {showFeedback && currentStep.type !== "mcq" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-blue-700">Answer Submitted!</span>
                </div>
                <p className="text-sm text-blue-600">
                  Your answer has been recorded. You can review and improve it anytime.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleTryAgain}
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <MessageCircle className="h-4 w-4" />
            Ask AI Tutor
          </Button>

          <div className="flex items-center gap-3">
            {currentStep.type === "content" ? (
              <Button onClick={handleNextStep} className="flex items-center gap-2">
                Continue to Questions
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : !showFeedback ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answers[currentStep.id]}
                className="flex items-center gap-2"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextStep} className="flex items-center gap-2">
                {isLastStep ? "Complete Task" : "Next Step"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* AI Assistant */}
        <Card className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-full">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Need help with this step?</p>
                <p className="text-xs text-gray-600">
                  Get hints, explanations, or step-by-step guidance from your AI tutor.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Get Help
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}