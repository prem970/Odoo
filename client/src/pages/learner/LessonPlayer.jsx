import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    CirclePlay as PlayCircle,
    FileText,
    Image as ImageIcon,
    CircleHelp as HelpCircle,
    CircleCheck as CheckCircle2,
    Circle,
    Menu,
    X,
    Download,
    ArrowLeft,
    MonitorPlay,
    BookOpen,
    Trophy,
    RotateCcw
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Logo } from '../../components/ui/Logo';
import ChatBot from '../../components/ui/ChatBot';

// --- Quiz Player Component ---
const QuizPlayer = ({ quizId, onComplete, lessonTitle, isCompleted }) => {
    const [quiz, setQuiz] = useState(null);
    const [step, setStep] = useState('intro'); // intro, question, result
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            console.log('Fetching Quiz ID:', quizId);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/learner/quizzes/${quizId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Quiz Data Loaded:', data);
                    setQuiz(data);
                } else {
                    console.error('Quiz fetch failed with status:', res.status);
                }
            } catch (error) {
                console.error('Quiz fetch error', error);
            } finally {
                setLoading(false);
            }
        };
        if (quizId) fetchQuiz();
    }, [quizId]);

    const handleOptionSelect = (questionId, optionId) => {
        if (submitting || (result && result.passed)) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleNext = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/learner/quizzes/${quizId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answers })
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
                setShowResultModal(true);
                if (data.passed) {
                    onComplete();
                }
            }
        } catch (error) {
            console.error('Submit error', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading Quiz...</div>;
    if (!quiz) return <div className="p-8 text-center text-white">Quiz not found.</div>;
    if (!quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-white max-w-2xl mx-auto">
                <HelpCircle className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
                <p className="text-neutral-400">This quiz doesn't have any questions yet. Please contact your instructor.</p>
                <Button className="mt-8" variant="outline" onClick={onComplete}>Skip & Continue</Button>
            </div>
        );
    }

    // Intro Screen
    if (step === 'intro') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-white max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                    <HelpCircle className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">{quiz.title}</h2>
                <p className="text-neutral-400 mb-8 text-lg">{lessonTitle} - Assessment</p>

                <div className="grid grid-cols-2 gap-6 mb-8 w-full max-w-md">
                    <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Questions</p>
                        <p className="text-2xl font-bold">{quiz.questions.length}</p>
                    </div>
                    <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                        <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mb-1">Attempts</p>
                        <p className="text-xl font-bold">Unlimited</p>
                    </div>
                </div>

                <Button size="lg" className="w-full max-w-sm h-14 text-lg" onClick={() => setStep('question')}>
                    Start Quiz
                </Button>
            </div>
        );
    }

    // Question Screen
    const currentQ = quiz.questions[currentQuestionIndex];
    const isLastQ = currentQuestionIndex === quiz.questions.length - 1;

    if (!currentQ) return <div className="p-8 text-center text-white">Question not found.</div>;

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-8 text-white relative">
            {/* Progress Header */}
            <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-medium text-neutral-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }} />
                </div>
            </div>

            {/* Question Content */}
            <div className="flex-1 overflow-y-auto">
                <h3 className="text-2xl font-bold mb-8 leading-relaxed">
                    {currentQ.question}
                </h3>

                <div className="space-y-4">
                    {currentQ.options && currentQ.options.map((opt) => (
                        <div
                            key={opt.id}
                            onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                            className={cn(
                                "p-5 rounded-xl border transition-all cursor-pointer flex items-center gap-4",
                                answers[currentQ.id] === opt.id
                                    ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                    : "bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-500",
                                (result && result.passed) && "pointer-events-none opacity-50"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                answers[currentQ.id] === opt.id ? "border-primary bg-primary text-black" : "border-neutral-500"
                            )}>
                                {answers[currentQ.id] === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <span className="text-lg">{opt.option_text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer / Navigation */}
            <div className="mt-8 flex justify-end">
                {isLastQ ? (
                    <Button
                        size="lg"
                        className="px-8 font-bold"
                        onClick={handleSubmit}
                        disabled={!answers[currentQ.id] || submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                ) : (
                    <Button
                        size="lg"
                        className="px-8"
                        onClick={handleNext}
                        disabled={!answers[currentQ.id]}
                    >
                        Next Question <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Quiz Result Modal */}
            {showResultModal && result && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-8 max-w-md w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${result.passed ? 'bg-green-500/20 text-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-red-500/20 text-red-500'}`}>
                            {result.passed ? <Trophy className="h-12 w-12" /> : <X className="h-12 w-12" />}
                        </div>

                        <h2 className="text-3xl font-bold mb-2 text-white">{result.passed ? 'Quiz Passed!' : 'Quiz Failed'}</h2>
                        <div className="flex justify-center gap-4 mb-6">
                            <div className="bg-neutral-800 rounded-xl p-3 border border-neutral-700 min-w-[100px]">
                                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter mb-1">Score</p>
                                <p className={`text-2xl font-black ${result.passed ? 'text-green-400' : 'text-red-400'}`}>{result.score}%</p>
                            </div>
                            <div className="bg-neutral-800 rounded-xl p-3 border border-neutral-700 min-w-[100px]">
                                <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter mb-1">Result</p>
                                <p className="text-2xl font-black text-white">{result.correctCount}/{result.totalQuestions}</p>
                            </div>
                        </div>

                        {result.passed ? (
                            <p className="text-neutral-400 mb-8 max-w-[280px] mx-auto text-sm">
                                Excellent work! You've successfully completed this assessment and earned points.
                            </p>
                        ) : (
                            <p className="text-neutral-400 mb-8 max-w-[280px] mx-auto text-sm">
                                Don't worry, you can try again to improve your score. Review the lessons and come back!
                            </p>
                        )}

                        <div className="space-y-3">
                            {result.passed ? (
                                <Button className="w-full h-12 text-lg shadow-[0_0_20px_rgba(var(--primary),0.3)]" onClick={() => {
                                    setShowResultModal(false);
                                    onComplete();
                                }}>
                                    Continue Learning
                                </Button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800" onClick={() => setShowResultModal(false)}>
                                        Close
                                    </Button>
                                    <Button onClick={() => {
                                        setShowResultModal(false);
                                        setStep('intro');
                                        setAnswers({});
                                        setCurrentQuestionIndex(0);
                                        setResult(null);
                                    }}>
                                        Try Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Lesson Player ---
const LessonPlayer = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Fetch Lessons
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/learner/courses/${courseId}/lessons`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLessons(data);
                }
            } catch (error) {
                console.error("Failed to fetch lessons", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [courseId]);

    const currentLessonIndex = useMemo(() =>
        lessons.findIndex(l => l.id === lessonId),
        [lessons, lessonId]);

    const currentLesson = lessons[currentLessonIndex];

    // Mark current lesson as complete (if not quiz)
    useEffect(() => {
        if (currentLesson && currentLesson.type !== 'QUIZ' && !currentLesson.completed) {
            // Mark as complete logic could be timer based, but for now let's just mark it after a few seconds or immediately?
            // "Marks lesson as: In-progress when opened... Completed when finished"
            // Video: completed when ended. Doc: when scrolled?
            // For simplicity, let's just mark it as "In Progress" at least (status update).
            // But prompt says "Sidebar updates instantly"
            // We'll leave explicit completion to the "Next" button or events.
        }
    }, [currentLesson]);

    const handleLessonChange = (newLessonId) => {
        navigate(`/course/${courseId}/lesson/${newLessonId}`);
    };

    const handleNextLesson = () => {
        if (currentLessonIndex < lessons.length - 1) {
            handleLessonChange(lessons[currentLessonIndex + 1].id);
        } else {
            // Course Complete
            navigate(`/courses/${courseId}`);
        }
    };

    const markLessonComplete = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/learner/lessons/${lessonId}/complete`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Update local state
            setLessons(prev => prev.map(l => l.id === lessonId ? { ...l, completed: true } : l));
        } catch (error) {
            console.error('Complete error', error);
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-neutral-900 text-white space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-400 animate-pulse">Loading your lesson...</p>
        </div>
    );

    if (!currentLesson) return (
        <div className="h-screen flex flex-col items-center justify-center bg-neutral-900 text-white p-8 text-center">
            <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-6">
                <X className="h-10 w-10 text-neutral-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
            <p className="text-neutral-400 mb-8 max-w-md">We couldn't find the lesson you're looking for. It might have been moved or you might not have access to it.</p>
            <Button onClick={() => navigate('/user/dashboard')}>Return to Dashboard</Button>
        </div>
    );

    const progressPercentage = Math.round((lessons.filter(l => l.completed).length / lessons.length) * 100);

    return (
        <div className="flex h-screen bg-neutral-900 text-white overflow-hidden">
            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-80 bg-neutral-900 border-r border-neutral-800 transition-transform duration-300 lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-neutral-800">
                        <div className="flex items-center justify-between mb-4">
                            <Button variant="ghost" className="p-0 hover:bg-transparent text-neutral-400 hover:text-white" onClick={() => navigate(`/courses/${courseId}`)}>
                                <ArrowLeft className="h-5 w-5 mr-2" /> Back
                            </Button>
                            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs text-neutral-400 flex justify-between">
                                <span>Progress</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {lessons.map((l, i) => (
                            <button
                                key={l.id}
                                onClick={() => handleLessonChange(l.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                    l.id === lessonId ? "bg-primary/20 text-primary border border-primary/20" : "text-neutral-400 hover:bg-neutral-800"
                                )}
                            >
                                <div className={cn("w-6 h-6 rounded flex items-center justify-center text-xs", l.id === lessonId ? "bg-primary text-black" : "bg-neutral-800")}>
                                    {l.completed ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </div>
                                <span className={cn("text-sm truncate flex-1", l.id === lessonId && "font-medium")}>{l.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full bg-black/40 relative">
                <header className="h-16 flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2">
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="text-sm font-medium text-neutral-200">{currentLesson.title}</h1>
                    </div>
                    <Badge variant="outline" className="text-xs border-neutral-700 text-neutral-400">{currentLesson.type}</Badge>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {currentLesson.type === 'QUIZ' ? (
                        <QuizPlayer
                            quizId={currentLesson.content_url} // Assuming content_url holds quizId
                            lessonTitle={currentLesson.title}
                            onComplete={() => {
                                markLessonComplete();
                                // Optional: auto advance
                            }}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
                            {/* Render different content types */}
                            {currentLesson.type === 'VIDEO' && (
                                <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800">
                                    <video className="w-full h-full" controls src={currentLesson.content_url}></video>
                                </div>
                            )}
                            {currentLesson.type === 'DOCUMENT' && (
                                <div className="w-full max-w-3xl bg-neutral-900 p-8 rounded-xl border border-neutral-800 prose prose-invert">
                                    <h2 className="mb-4">{currentLesson.title}</h2>
                                    <p>{currentLesson.content_url}</p>
                                    {/* Usually we'd fetch the doc content or standard text if not URL */}
                                </div>
                            )}
                            {currentLesson.type === 'IMAGE' && (
                                <img src={currentLesson.content_url} className="max-w-full max-h-full rounded-lg shadow-lg" alt="Lesson" />
                            )}
                        </div>
                    )}
                </div>

                <footer className="h-16 border-t border-neutral-800 bg-neutral-900 flex items-center justify-between px-6">
                    <Button variant="ghost" className="text-white hover:text-white" onClick={() => lessons[currentLessonIndex - 1] && handleLessonChange(lessons[currentLessonIndex - 1].id)} disabled={currentLessonIndex === 0}>
                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button onClick={() => {
                        markLessonComplete();
                        handleNextLesson();
                    }}>
                        Next Lesson <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </footer>

                {/* AI Tutor */}
                <ChatBot />
            </main>
        </div>
    );
};

export default LessonPlayer;
