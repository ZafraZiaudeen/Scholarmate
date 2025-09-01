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
      userAnswer?: string;
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
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isQuestionsListOpen, setIsQuestionsListOpen] = useState(false);
  const [timerActive, setTimerActive] = useState(true);
  const [taskResults, setTaskResults] = useState<{
    correctAnswers: number;
    totalQuestions: number;
    answers: Record<string, { selected: string; correct: string; isCorrect: boolean; question: string; explanation?: string }>;
  }>({ correctAnswers: 0, totalQuestions: 0, answers: {} });
  const [reviewMode, setReviewMode] = useState(false);

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
      
      // Load saved answers from localStorage
      const savedAnswers = localStorage.getItem(`task-answers-${taskId}`);
      let parsedAnswers: Record<string, string | number> = {};
      if (savedAnswers) {
        try {
          parsedAnswers = JSON.parse(savedAnswers);
        } catch (error) {
          console.error("Error parsing saved answers:", error);
        }
      }

      // Load answers from task data (backend) and merge with localStorage
      const backendAnswers: Record<string, string | number> = {};
      task.content.questions.forEach((q, index) => {
        const stepId = `q${index + 1}`;
        newSteps.push({
          id: stepId,
          type: "mcq",
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          mcqId: q.mcqId,
          points: 10,
        });
        
        // If there's a saved answer in the backend, use it
        if (q.userAnswer) {
          backendAnswers[stepId] = q.userAnswer;
        }
      });
      
      // Merge answers: backend takes precedence over localStorage
      const mergedAnswers = { ...parsedAnswers, ...backendAnswers };
      setAnswers(mergedAnswers);
      
      setSteps(newSteps);
      setTaskCompleted(task.progress.completed);
      setScore(task.progress.score);
      
      // Build task results for completed tasks
      if (task.progress.completed) {
        const results = {
          correctAnswers: task.progress.correctAnswers,
          totalQuestions: task.progress.totalQuestions,
          answers: {} as Record<string, { selected: string; correct: string; isCorrect: boolean; question: string; explanation?: string }>
        };
        
        task.content.questions.forEach((q, index) => {
          const stepId = `q${index + 1}`;
          if (q.userAnswer) {
            const correctAnswer = q.correctAnswer?.toString().replace(/[()]/g, "").trim();
            const userAnswer = q.userAnswer.toString().trim();
            results.answers[stepId] = {
              selected: userAnswer,
              correct: correctAnswer || '',
              isCorrect: userAnswer === correctAnswer,
              question: q.question,
              explanation: q.explanation
            };
          }
        });
        
        setTaskResults(results);
      }
      
      console.log("Task Questions:", task.content.questions);
      console.log("Loaded answers:", mergedAnswers);
    }
  }, [task, taskId]);

  useEffect(() => {
    if (!taskId || error) {
      navigate("/task");
      return;
    }

    const timer = setInterval(() => {
      if (timerActive && !taskCompleted) {
        setTimeSpent((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [taskId, error, navigate, timerActive, taskCompleted]);

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

  const handleAnswerChange = (value: string | number) => {
    const newAnswers = {
      ...answers,
      [currentStep.id]: value,
    };
    setAnswers(newAnswers);
    
    // Save to localStorage immediately
    localStorage.setItem(`task-answers-${taskId}`, JSON.stringify(newAnswers));
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

      // Store answer result for review
      setTaskResults(prev => ({
        ...prev,
        answers: {
          ...prev.answers,
          [currentStep.id]: {
            selected,
            correct: correctAnswer,
            isCorrect,
            question: currentStep.question || '',
            explanation: currentStep.explanation
          }
        }
      }));

      if (isCorrect) {
        setScore((prev) => prev + currentStep.points);
        setTaskResults(prev => ({ ...prev, correctAnswers: prev.correctAnswers + 1 }));
      }
      
      // Save answer to backend with userAnswer field
      await updateTaskProgress({
        taskId: task._id,
        questionId: currentStep.mcqId || currentStep.id,
        isCorrect,
        userAnswer: selected, // Save the user's answer
      });
    }
    setShowFeedback(true);
  };

  const handleTryAgain = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentStep.id];
    setAnswers(newAnswers);
    
    // Update localStorage
    localStorage.setItem(`task-answers-${taskId}`, JSON.stringify(newAnswers));
    setShowFeedback(false);
  };

  const handleNextStep = async () => {
    if (isLastStep) {
      // Stop the timer
      setTimerActive(false);
      
      // Calculate final results
      const totalQuestions = steps.filter(step => step.type === 'mcq').length;
      setTaskResults(prev => ({ ...prev, totalQuestions }));
      
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

  const handleReviewAnswers = () => {
    setReviewMode(true);
    setCurrentStepIndex(0);
    setTaskCompleted(false);
    setShowFeedback(false);
  };


  if (taskCompleted && !reviewMode) {
    const accuracy = taskResults.totalQuestions > 0 ? Math.round((taskResults.correctAnswers / taskResults.totalQuestions) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Completed!</h1>
                <p className="text-gray-600">Congratulations on completing "{task.title}"</p>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{score}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{formatTime(timeSpent)}</div>
                  <div className="text-sm text-gray-600">Time Spent</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{taskResults.correctAnswers}/{taskResults.totalQuestions}</div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>

              {/* Detailed Results */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Answer Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(taskResults.answers).map(([stepId, result], index) => (
                      <div key={stepId} className={`p-4 rounded-lg border ${result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Question {index + 1}</p>
                            <p className="text-sm text-gray-700 mb-2">{result.question}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {result.isCorrect ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            <Badge className={result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {result.isCorrect ? 'Correct' : 'Incorrect'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Your Answer:</strong> {numberToLetter(parseInt(result.selected) - 1)} ({result.selected})</p>
                          {!result.isCorrect && (
                            <p><strong>Correct Answer:</strong> {numberToLetter(parseInt(result.correct) - 1)} ({result.correct})</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={() => navigate("/task")} className="flex-1">
                  Back to Tasks
                </Button>
                <Button variant="outline" onClick={handleReviewAnswers} className="flex-1">
                  Review Questions Again
                </Button>
                <Button variant="outline" onClick={() => navigate("/ai")} className="flex-1">
                  Ask AI Tutor
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
          <Button variant="ghost" size="sm" onClick={() => reviewMode ? setTaskCompleted(true) : navigate("/task")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {reviewMode ? "Back to Results" : "Back to Tasks"}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {reviewMode ? `Review: ${task.title}` : task.title}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <Badge className={getDifficultyColor(difficulty)}>{difficulty}</Badge>
              {reviewMode && <Badge variant="outline" className="bg-blue-50 text-blue-700">Review Mode</Badge>}
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
                          Your Answer: {numberToLetter(parseInt(answers[step.id].toString()) - 1)} ({answers[step.id]})
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
                value={answers[currentStep.id]?.toString() || ""}
                onValueChange={handleAnswerChange}
                className="space-y-3"
                disabled={showFeedback || reviewMode}
              >
                {currentStep.options.map((option, index) => {
                  const value = (index + 1).toString(); // Use 1, 2, 3, 4
                  const letter = numberToLetter(index); // Display A, B, C, D
                  const isSelected = answers[currentStep.id]?.toString() === value;
                  const isCorrect = value === currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim();
                  
                  let optionClass = "flex items-center space-x-2";
                  if (reviewMode) {
                    if (isSelected && isCorrect) {
                      optionClass += " bg-green-50 border border-green-200 rounded p-2";
                    } else if (isSelected && !isCorrect) {
                      optionClass += " bg-red-50 border border-red-200 rounded p-2";
                    } else if (!isSelected && isCorrect) {
                      optionClass += " bg-blue-50 border border-blue-200 rounded p-2";
                    }
                  }
                  
                  return (
                    <div key={index} className={optionClass}>
                      <RadioGroupItem value={value} id={`option-${value}`} />
                      <Label htmlFor={`option-${value}`} className="flex-1 cursor-pointer flex items-center justify-between">
                        <span>{letter}. {option}</span>
                        {reviewMode && (
                          <div className="flex items-center gap-2">
                            {isSelected && isCorrect && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-500" />}
                            {!isSelected && isCorrect && <span className="text-xs text-blue-600 font-medium">Correct Answer</span>}
                            {isSelected && !isCorrect && <span className="text-xs text-red-600 font-medium">Your Answer</span>}
                          </div>
                        )}
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

            {/* Review Mode Feedback */}
            {reviewMode && currentStep.type === "mcq" && answers[currentStep.id] && (
              <div className="mt-4 p-4 rounded-lg border bg-slate-50">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {answers[currentStep.id]?.toString().trim() ===
                    currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-700">You answered this correctly!</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-700">You answered this incorrectly</span>
                      </>
                    )}
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <p><strong>Your Answer:</strong> {numberToLetter(parseInt(answers[currentStep.id].toString()) - 1)} - {currentStep.options?.[parseInt(answers[currentStep.id].toString()) - 1]}</p>
                    {answers[currentStep.id]?.toString().trim() !== currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() && (
                      <p><strong>Correct Answer:</strong> {numberToLetter(parseInt(currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() || "1") - 1)} - {currentStep.options?.[parseInt(currentStep.correctAnswer?.toString().replace(/[()]/g, "").trim() || "1") - 1]}</p>
                    )}
                  </div>

                  {/* Show explanation for incorrect answers or always in review mode */}
                  {currentStep.explanation && (
                    <div className="mt-3">
                      <p className="font-medium text-gray-900 mb-2">Explanation:</p>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        className="prose prose-slate text-sm max-w-none text-gray-700"
                        components={{
                          p: ({ children }) => <p className="mb-3 text-gray-700">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-3">{children}</ul>,
                          li: ({ children }) => <li className="mb-1 text-gray-700">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                        }}
                      >
                        {currentStep.explanation}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
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
            ) : reviewMode ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </Button>
                <Button onClick={() => {
                  if (isLastStep) {
                    setTaskCompleted(true);
                    setReviewMode(false);
                  } else {
                    setCurrentStepIndex(prev => prev + 1);
                  }
                }} className="flex items-center gap-2">
                  {isLastStep ? "Back to Results" : "Next Question"}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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