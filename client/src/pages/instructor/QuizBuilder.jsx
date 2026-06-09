import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, ArrowLeft, CheckSquare, Square, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { quizAPI } from '../../services/api';

const QuizBuilder = () => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [activeQuestionId, setActiveQuestionId] = useState(null);
    const [showRewards, setShowRewards] = useState(false);

    // Form States
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState([{ option_text: '', is_correct: false }]);
    const [rewards, setRewards] = useState({ first_try: 10, second_try: 7, third_try: 5, fourth_plus: 2 });

    useEffect(() => {
        if (quizId) fetchQuizData();
    }, [quizId]);

    useEffect(() => {
        if (activeQuestionId && quiz) {
            const q = quiz.questions.find(q => q.id === activeQuestionId);
            if (q) {
                setQuestionText(q.question);
                setOptions(q.options.length ? q.options : [{ option_text: '', is_correct: false }]);
                setShowRewards(false);
            }
        }
    }, [activeQuestionId, quiz]);

    const fetchQuizData = async () => {
        try {
            const data = await quizAPI.getById(quizId);
            setQuiz(data);
            setRewards(data.rewards || { first_try: 10, second_try: 7, third_try: 5, fourth_plus: 2 });
            if (data.questions.length > 0) {
                setActiveQuestionId(data.questions[0].id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to load quiz:', error);
            setLoading(false);
        }
    };

    const handleAddQuestion = async () => {
        try {
            const newQ = await quizAPI.addQuestion(quizId, {
                question: 'New Question',
                options: []
            });
            const updatedQuestions = [...(quiz.questions || []), newQ];
            setQuiz({ ...quiz, questions: updatedQuestions });
            setActiveQuestionId(newQ.id);
            setShowRewards(false);
        } catch (error) {
            console.error('Failed to add question:', error);
        }
    };

    const handleDeleteQuestion = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure?')) return;
        try {
            await quizAPI.deleteQuestion(id);
            const updatedQuestions = quiz.questions.filter(q => q.id !== id);
            setQuiz({ ...quiz, questions: updatedQuestions });
            if (activeQuestionId === id) {
                setActiveQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].id : null);
            }
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const handleSaveQuestion = async () => {
        if (!activeQuestionId) return;
        try {
            const updatedQ = await quizAPI.updateQuestion(activeQuestionId, {
                question: questionText,
                options
            });
            const updatedQuestions = quiz.questions.map(q => q.id === activeQuestionId ? updatedQ : q);
            setQuiz({ ...quiz, questions: updatedQuestions });
        } catch (error) {
            console.error('Failed to save question:', error);
        }
    };

    const handleSaveRewards = async () => {
        try {
            await quizAPI.updateRewards(quizId, rewards);
        } catch (error) {
            console.error('Failed to save rewards:', error);
        }
    };

    const handleOptionChange = (idx, field, value) => {
        const newOptions = [...options];
        newOptions[idx][field] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { option_text: '', is_correct: false }]);
    };

    const removeOption = (idx) => {
        const newOptions = options.filter((_, i) => i !== idx);
        setOptions(newOptions);
    };

    if (loading) return <div className="p-10 text-center">Loading quiz builder...</div>;

    return (
        <div className="flex h-screen bg-white overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r border-neutral-200 flex flex-col bg-white">
                <div className="p-4 border-b border-neutral-200">
                    <Button variant="ghost" size="sm" className="-ml-2 mb-2 text-neutral-500 hover:text-neutral-800" onClick={() => navigate(`/instructor/course/${courseId}/edit`)}>
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                    <h2 className="font-bold text-lg text-neutral-800 truncate" title={quiz?.title}>{quiz?.title}</h2>
                    <p className="text-xs text-neutral-500 mt-1">Question List</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {quiz?.questions?.map((q, idx) => (
                        <div
                            key={q.id}
                            onClick={() => { setActiveQuestionId(q.id); setShowRewards(false); }}
                            className={`p-3 rounded-lg cursor-pointer text-sm flex justify-between items-center group transition-colors ${activeQuestionId === q.id && !showRewards
                                ? 'bg-neutral-100 text-neutral-900 font-medium'
                                : 'hover:bg-neutral-50 text-neutral-600'
                                }`}
                        >
                            <span className="truncate flex-1">
                                {idx + 1}. {q.question || 'New Question'}
                            </span>
                            <button
                                onClick={(e) => handleDeleteQuestion(e, q.id)}
                                className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 space-y-3 border-t border-neutral-200 bg-neutral-50">
                    <button
                        onClick={handleAddQuestion}
                        className="w-full py-2.5 flex items-center justify-center gap-2 bg-[#8B5CF6] text-white hover:bg-[#7C3AED] rounded-lg font-medium transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" /> Add Question
                    </button>
                    <button
                        onClick={() => { setShowRewards(true); setActiveQuestionId(null); }}
                        className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-lg font-medium transition-colors border ${showRewards
                            ? 'bg-[#8B5CF6] text-white border-[#8B5CF6]'
                            : 'bg-white text-[#8B5CF6] border-[#8B5CF6] hover:bg-neutral-50'
                            }`}
                    >
                        <Award className="h-4 w-4" /> Rewards
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-white p-12">
                {showRewards ? (
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8 border-b border-neutral-200 pb-4">
                            <h1 className="text-2xl font-bold text-neutral-800">Rewards</h1>
                        </div>

                        <div className="bg-white p-8 space-y-6">
                            {/* Wireframe-style Rewards */}
                            {[
                                { label: 'First try', key: 'first_try' },
                                { label: 'Second try', key: 'second_try' },
                                { label: 'Third try', key: 'third_try' },
                                { label: 'Fourth Try and more', key: 'fourth_plus' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center gap-4">
                                    <label className="w-48 text-lg text-neutral-600 font-handwriting">{item.label} :</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={rewards[item.key]}
                                            onChange={(e) => setRewards({ ...rewards, [item.key]: parseInt(e.target.value) || 0 })}
                                            className="w-24 px-1 py-1 border-b-2 border-orange-300 focus:border-orange-500 outline-none text-center text-lg text-neutral-800 bg-transparent"
                                        />
                                        <span className="text-orange-400 font-medium">points</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleSaveRewards} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8">
                                Save Rewards
                            </Button>
                        </div>
                    </div>
                ) : activeQuestionId ? (
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-start gap-4 mb-10">
                            <span className="text-2xl font-bold text-neutral-800 mt-2">{quiz?.questions?.findIndex(q => q.id === activeQuestionId) + 1}.</span>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="w-full text-xl font-medium text-neutral-800 border-b-2 border-neutral-300 focus:border-orange-400 outline-none py-2 bg-transparent placeholder-neutral-300"
                                    placeholder="Write your question here"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between text-sm font-semibold text-neutral-500 pb-2 border-b border-neutral-200">
                                <span>Choices</span>
                                <span className="mr-8">Correct</span>
                            </div>

                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-6 group">
                                    <input
                                        type="text"
                                        value={opt.option_text}
                                        onChange={(e) => handleOptionChange(idx, 'option_text', e.target.value)}
                                        className="flex-1 px-4 py-3 bg-transparent border-b border-neutral-200 focus:border-neutral-400 outline-none transition-all text-neutral-700"
                                        placeholder={`Answer ${idx + 1}`}
                                    />
                                    <div className="w-20 flex justify-center">
                                        <button
                                            onClick={() => handleOptionChange(idx, 'is_correct', !opt.is_correct)}
                                            className={`p-1 rounded transition-colors ${opt.is_correct ? 'text-green-500' : 'text-neutral-300 hover:text-neutral-400'}`}
                                        >
                                            {/* Matching wireframe checkbox style */}
                                            {opt.is_correct ? (
                                                <div className="h-6 w-6 bg-green-500 border-2 border-green-500 rounded text-white flex items-center justify-center">
                                                    <CheckSquare className="h-4 w-4" />
                                                </div>
                                            ) : (
                                                <div className="h-6 w-6 border-2 border-neutral-300 rounded hover:border-neutral-400"></div>
                                            )}
                                        </button>
                                    </div>
                                    <button onClick={() => removeOption(idx)} className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 transition-opacity">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}

                            <button onClick={addOption} className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1 mt-4">
                                Add choice
                            </button>
                        </div>

                        <div className="mt-12 flex justify-end">
                            <Button onClick={handleSaveQuestion} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 gap-2">
                                <Save className="h-4 w-4" /> Save Question
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <CheckSquare className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a question to edit or add a new one.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizBuilder;
