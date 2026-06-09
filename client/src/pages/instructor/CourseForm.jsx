import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Save, Eye, MoreVertical, Plus, Video, FileText, Image as ImageIcon, HelpCircle, X, ChevronDown, Trash2, Edit2, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { courseAPI, lessonAPI, quizAPI, userAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const CourseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isAdminMode = location.pathname.startsWith('/admin');
    const [instructors, setInstructors] = useState([]);
    const [activeTab, setActiveTab] = useState('content');
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [course, setCourse] = useState({
        title: '',
        description: '',
        tags: [],
        published: false,
        image_url: ''
    });
    const [lessons, setLessons] = useState([]);
    const [showContentModal, setShowContentModal] = useState(false);
    const [newContent, setNewContent] = useState({ type: 'VIDEO', title: '', url: '' });
    const [attendees, setAttendees] = useState([]);
    const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);
    const [showAttendeeModal, setShowAttendeeModal] = useState(false);
    const [eligibleLearners, setEligibleLearners] = useState([]);
    const [isEligibleLoading, setIsEligibleLoading] = useState(false);
    const [learnerSearchTerm, setLearnerSearchTerm] = useState('');
    const [isAddingAttendee, setIsAddingAttendee] = useState(false);

    useEffect(() => {
        console.log('CourseForm mounted. ID:', id, 'User:', user);
        if (id) {
            fetchCourseData();
        }
        if (user && user.role === 'admin') {
            fetchInstructors();
        }
    }, [id, user]);

    const fetchInstructors = async () => {
        try {
            const data = await userAPI.getInstructors();
            setInstructors(data);
        } catch (error) {
            console.error('Failed to fetch instructors:', error);
        }
    };

    const fetchCourseData = async () => {
        console.log('Fetching course data for ID:', id);
        try {
            const courseData = await courseAPI.getById(id);
            setCourse(courseData);
            const lessonsData = await lessonAPI.getByCourse(id);
            setLessons(lessonsData);
        } catch (error) {
            console.error('Failed to load course:', error);
            setHasError(true);
            setErrorMessage(error.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendees = async () => {
        try {
            setIsAttendeesLoading(true);
            const data = await courseAPI.getAttendees(id);
            setAttendees(data);
        } catch (error) {
            console.error('Failed to fetch attendees:', error);
        } finally {
            setIsAttendeesLoading(false);
        }
    };

    const fetchEligibleLearners = async () => {
        try {
            setIsEligibleLoading(true);
            const data = await courseAPI.getEligibleLearners(id);
            setEligibleLearners(data);
        } catch (error) {
            console.error('Failed to fetch eligible learners:', error);
        } finally {
            setIsEligibleLoading(false);
        }
    };

    useEffect(() => {
        if (id && activeTab === 'attendees') {
            fetchAttendees();
        }
    }, [id, activeTab]);

    useEffect(() => {
        if (showAttendeeModal) {
            fetchEligibleLearners();
        }
    }, [showAttendeeModal]);

    const handleAddAttendee = async (email) => {
        try {
            setIsAddingAttendee(true);
            const attendee = await courseAPI.addAttendee(id, email);
            setAttendees([attendee, ...attendees]);
            setShowAttendeeModal(false);
            setLearnerSearchTerm('');
            alert('Attendee added successfully!');
        } catch (error) {
            alert(error.message || 'Failed to add attendee');
        } finally {
            setIsAddingAttendee(false);
        }
    };

    const handleSave = async () => {
        try {
            await courseAPI.update(id, course);
            // Show toast/notification
        } catch (error) {
            console.error('Failed to save course:', error);
        }
    };

    const handlePublishToggle = async () => {
        try {
            await courseAPI.togglePublish(id, !course.published);
            setCourse(prev => ({ ...prev, published: !prev.published }));
        } catch (error) {
            console.error('Failed to toggle publish:', error);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (!window.confirm('Are you sure you want to delete this content?')) return;
        try {
            await lessonAPI.delete(lessonId);
            setLessons(lessons.filter(l => l.id !== lessonId));
        } catch (error) {
            console.error('Failed to delete lesson:', error);
            alert('Failed to delete content');
        }
    };

    const [editingLessonId, setEditingLessonId] = useState(null);

    const handleAddContent = async () => {
        try {
            if (editingLessonId) {
                // Update existing lesson
                const updated = await lessonAPI.update(editingLessonId, {
                    title: newContent.title,
                    type: newContent.type,
                    content_url: newContent.url,
                    // keep other fields like duration/order for now or update if we had inputs
                });
                setLessons(lessons.map(l => l.id === editingLessonId ? updated : l));
            } else {
                // Create new lesson
                const lesson = await lessonAPI.create({
                    courseId: id,
                    title: newContent.title,
                    type: newContent.type,
                    content_url: newContent.url,
                    lesson_order: lessons.length + 1
                });
                setLessons([...lessons, lesson]);
            }
            setShowContentModal(false);
            setNewContent({ type: 'VIDEO', title: '', url: '' });
            setEditingLessonId(null);
        } catch (error) {
            console.error('Failed to save content:', error);
            alert('Failed to save content');
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = (e, index) => {
        e.dataTransfer.setData('dragIndex', index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = Number(e.dataTransfer.getData('dragIndex'));
        if (dragIndex === dropIndex) return;

        const newLessons = [...lessons];
        const [movedItem] = newLessons.splice(dragIndex, 1);
        newLessons.splice(dropIndex, 0, movedItem);

        // Optimistic update
        setLessons(newLessons);

        // Prepare data for backend
        const reorderedData = newLessons.map((l, i) => ({
            id: l.id,
            lesson_order: i + 1
        }));

        try {
            await lessonAPI.reorder(reorderedData);
        } catch (error) {
            console.error('Failed to reorder lessons:', error);
            // Revert on error if needed, or just alert
            alert('Failed to save new order.');
            fetchCourseData(); // Revert to server state
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-500">Loading course editor...</p>
            </div>
        </div>
    );

    if (hasError) return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
                <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full inline-block">
                    <X className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Something went wrong</h2>
                <p className="text-neutral-600 mb-6">{errorMessage}</p>
                <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                        Go to Dashboard
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                </div>
            </div>
        </div>
    );

    // Determine back path and label based on role
    const backPath = user?.role === 'admin' ? '/admin/dashboard' : '/instructor/dashboard';
    const backLabel = user?.role === 'admin' ? 'Admin Dashboard' : 'Courses';

    return (
        <div className="min-h-screen bg-neutral-50 pb-20">
            {/* Top Toolbar */}
            <div className="bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-10 px-6 py-3 flex justify-between items-center shadow-sm transition-all duration-200">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
                        &larr; {backLabel}
                    </Button>
                    <div className="h-6 w-px bg-neutral-300 mx-2"></div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white border border-neutral-300 shadow-sm hover:bg-neutral-50 px-4"
                        onClick={async () => {
                            if (window.confirm('Create a new course? Unsaved changes will be lost.')) {
                                try {
                                    const newCourse = await courseAPI.create({
                                        title: 'New Course',
                                        description: '',
                                        status: 'DRAFT'
                                    });
                                    navigate(`/instructor/course/${newCourse.id}/edit`);
                                    // Window reload might be needed to refresh state cleanly if navigate doesn't unmount
                                    window.location.reload();
                                } catch (error) {
                                    console.error('Failed to create course:', error);
                                }
                            }
                        }}
                    >
                        New
                    </Button>
                    <div className="flex flex-col ml-2 truncate max-w-md">
                        <h1 className="text-xl font-bold text-primary">{course.title || 'Untitled Course'}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4 bg-white border border-neutral-200 rounded-lg px-3 py-1.5 shadow-sm">
                        <div className="flex flex-col items-start leading-none mr-2">
                            <span className="text-xs font-semibold text-neutral-800">Publish on website</span>
                            <span className="text-[10px] text-neutral-500">Share on web</span>
                        </div>
                        <button
                            onClick={handlePublishToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative ${course.published ? 'bg-green-500' : 'bg-neutral-300'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${course.published ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={() => {
                        if (lessons.length > 0) {
                            navigate(`/course/${id}/lesson/${lessons[0].id}`);
                        } else {
                            alert('Add lessons to preview the course.');
                        }
                    }}>
                        <Eye className="h-4 w-4" /> Preview
                    </Button>
                    <Button onClick={async () => {
                        await handleSave();
                        alert('Course saved successfully!');
                    }} className="gap-2 bg-primary hover:bg-primary/90">
                        <Save className="h-4 w-4" /> Save
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-8 px-6 space-y-6">
                {/* Action Bar - Admin Only */}
                {isAdminMode && (
                    <div className="flex gap-2">
                        <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                            onClick={() => setActiveTab('attendees')}>
                            Contact Attendees
                        </Button>
                        <Button variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-sm"
                            onClick={() => {
                                setActiveTab('attendees');
                                setShowAttendeeModal(true);
                            }}>
                            Add Attendees
                        </Button>
                    </div>
                )}

                {/* Course Title & High-level info */}
                <div className="flex gap-6 items-start">
                    <div className="flex-1 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-blue-600 mb-1">Course Title</label>
                                <Input
                                    value={course.title}
                                    onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                    className="text-2xl font-bold border-b border-t-0 border-l-0 border-r-0 rounded-none border-neutral-300 focus:border-primary px-0 h-auto py-2 bg-transparent"
                                    placeholder="e.g: Basics of Odoo CRM"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-neutral-500 w-24">Tags:</label>
                                <div className="flex-1 flex flex-wrap gap-2">
                                    {(course.tags || []).map(tag => (
                                        <Badge key={tag} className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-3 py-1 flex items-center gap-1 group">
                                            {tag}
                                            <button
                                                onClick={() => {
                                                    const newTags = course.tags.filter(t => t !== tag);
                                                    setCourse({ ...course, tags: newTags });
                                                }}
                                                className="ml-1 opacity-50 group-hover:opacity-100 hover:text-red-500"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newTag = prompt("Enter new tag:");
                                            if (newTag && newTag.trim()) {
                                                const normalizedTag = newTag.trim();
                                                if (!course.tags.includes(normalizedTag)) {
                                                    setCourse({ ...course, tags: [...(course.tags || []), normalizedTag] });
                                                }
                                            }
                                        }}
                                        className="text-neutral-400 hover:text-primary text-sm flex items-center gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Add Tag
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-2">
                                <label className="text-sm font-medium text-neutral-500 w-24">Responsible:</label>
                                <div className="flex-1 border-b border-neutral-300 pb-1 text-neutral-800 font-medium">
                                    {course.responsible_name || 'Me'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Course Image Box */}
                    <div className="w-64 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-2">
                        <div
                            className="aspect-square bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-colors relative overflow-hidden group"
                            onClick={() => {
                                const url = prompt('Enter Image URL:', course.image_url || '');
                                if (url !== null) setCourse({ ...course, image_url: url });
                            }}
                        >
                            {course.image_url ? (
                                <>
                                    <img src={course.image_url} alt="Course" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs">
                                        Change Image
                                    </div>
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-8 w-8 text-neutral-400 mb-2" />
                                    <span className="text-xs text-neutral-500 text-center px-4">Add a course image to show on website</span>
                                    <div className="absolute top-2 right-2">
                                        <Edit2 className="h-3 w-3 text-neutral-400" />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="text-neutral-400 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCourse({ ...course, image_url: '' });
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content Area */}
                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm min-h-[500px] flex flex-col">
                    {/* Tabs Header */}
                    <div className="flex border-b border-neutral-200 px-6">
                        {['Content', 'Description', 'Attendees', 'Options', 'Quiz']
                            .filter(tab => tab !== 'Options' || isAdminMode)
                            .map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.toLowerCase()
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="p-6 flex-1">
                        {activeTab === 'content' && (
                            <div className="space-y-6">
                                {/* Lessons List */}
                                <div className="space-y-3">
                                    {lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, index)}
                                            className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200 group hover:shadow-md transition-all cursor-move active:bg-neutral-100"
                                        >
                                            <div className="flex items-center gap-4 pointer-events-none"> {/* Disable pointer events on children to prevent interference */}
                                                <div className="text-neutral-400 hover:text-neutral-600">
                                                    <MoreVertical className="h-5 w-5" />
                                                </div>
                                                <div className={`p-2 rounded-lg ${lesson.type === 'VIDEO' ? 'bg-red-100 text-red-600' :
                                                    lesson.type === 'DOCUMENT' ? 'bg-blue-100 text-blue-600' :
                                                        lesson.type === 'QUIZ' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-green-100 text-green-600'
                                                    }`}>
                                                    {lesson.type === 'VIDEO' && <Video className="h-5 w-5" />}
                                                    {lesson.type === 'DOCUMENT' && <FileText className="h-5 w-5" />}
                                                    {lesson.type === 'QUIZ' && <HelpCircle className="h-5 w-5" />}
                                                    {lesson.type === 'IMAGE' && <ImageIcon className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-neutral-800">{lesson.title}</h4>
                                                    <p className="text-xs text-neutral-500">{lesson.duration || '0'} mins • {lesson.type}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-primary"
                                                    onClick={() => {
                                                        setEditingLessonId(lesson.id);
                                                        setNewContent({
                                                            type: lesson.type,
                                                            title: lesson.title,
                                                            url: lesson.content_url || ''
                                                        });
                                                        setShowContentModal(true);
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Content Button */}
                                <div className="flex justify-center pt-4">
                                    <Button onClick={() => {
                                        setNewContent({ type: 'VIDEO', title: '', url: '' });
                                        setEditingLessonId(null);
                                        setShowContentModal(true);
                                    }} className="gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary">
                                        <Plus className="h-4 w-4" /> Add Content
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'description' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-neutral-700">Course Description</label>
                                <textarea
                                    className="w-full h-64 p-4 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none font-sans text-neutral-700"
                                    placeholder="Write a detailed description of your course..."
                                    value={course.description || ''}
                                    onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                ></textarea>
                            </div>
                        )}

                        {/* Quiz Tab */}
                        {activeTab === 'quiz' && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    {lessons.filter(l => l.type === 'QUIZ').length === 0 ? (
                                        <div className="text-center py-10 text-neutral-400">
                                            <HelpCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p>No quizzes added yet.</p>
                                        </div>
                                    ) : (
                                        lessons.filter(l => l.type === 'QUIZ').map(lesson => (
                                            <div key={lesson.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-neutral-200 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                                        <HelpCircle className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-neutral-800">{lesson.title}</h4>
                                                        <p className="text-xs text-neutral-500">Quiz • {lesson.duration || '0'} mins</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                                    onClick={() => {
                                                        // Assuming content_url holds the quiz_id for QUIZ type lessons, 
                                                        // or we need to fetch the quiz associated with this lesson. 
                                                        // For simplicity in this flow, let's assume content_url stores the quiz GUID.
                                                        if (lesson.content_url) {
                                                            navigate(`/instructor/course/${id}/quiz/${lesson.content_url}/edit`);
                                                        }
                                                    }}
                                                >
                                                    <Edit2 className="h-4 w-4" /> Edit Quiz
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button onClick={() => {
                                        setNewContent({ type: 'QUIZ', title: '', url: '' });
                                        setEditingLessonId(null);
                                        setShowContentModal(true);
                                    }} className="gap-2 bg-primary text-white hover:bg-primary/90">
                                        <Plus className="h-4 w-4" /> Add Quiz
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'attendees' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-neutral-800">Course Attendees</h3>
                                    <Button onClick={() => setShowAttendeeModal(true)} className="gap-2 bg-primary">
                                        <Plus className="h-4 w-4" /> Add Attendee
                                    </Button>
                                </div>

                                <Card>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-neutral-500 font-semibold border-b border-neutral-200 bg-neutral-50/50">
                                                    <tr>
                                                        <th className="px-6 py-4">Name</th>
                                                        <th className="px-6 py-4">Email</th>
                                                        <th className="px-6 py-4">Enrolled Date</th>
                                                        <th className="px-6 py-4">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-100">
                                                    {isAttendeesLoading ? (
                                                        <tr><td colSpan="4" className="p-8 text-center text-neutral-500">Loading attendees...</td></tr>
                                                    ) : attendees.length === 0 ? (
                                                        <tr><td colSpan="4" className="p-8 text-center text-neutral-500">No attendees yet.</td></tr>
                                                    ) : (
                                                        attendees.map((attendee) => (
                                                            <tr key={attendee.id} className="hover:bg-neutral-50/50 transition-colors">
                                                                <td className="px-6 py-4 font-medium text-neutral-900">{attendee.full_name}</td>
                                                                <td className="px-6 py-4 text-neutral-600">{attendee.email}</td>
                                                                <td className="px-6 py-4 text-neutral-500">
                                                                    {new Date(attendee.enrolled_at).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <Badge className={attendee.invited ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                                                                        {attendee.invited ? 'Invited' : 'Self-Enrolled'}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Options Tab */}
                        {(activeTab === 'options') && (
                            <div className="space-y-8 max-w-2xl">
                                {/* Visibility Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Visibility</h3>
                                    <div className="grid gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="visibility_public"
                                                    name="visibility"
                                                    type="radio"
                                                    checked={!course.visibility || course.visibility === 'EVERYONE'}
                                                    onChange={() => setCourse({ ...course, visibility: 'EVERYONE' })}
                                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <label htmlFor="visibility_public" className="font-medium text-gray-700">Public</label>
                                                <p className="text-gray-500">Anyone can see this course</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5">
                                                <input
                                                    id="visibility_signin"
                                                    name="visibility"
                                                    type="radio"
                                                    checked={course.visibility === 'SIGNED_IN'}
                                                    onChange={() => setCourse({ ...course, visibility: 'SIGNED_IN' })}
                                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                                />
                                            </div>
                                            <div className="text-sm">
                                                <label htmlFor="visibility_signin" className="font-medium text-gray-700">Signed In Users</label>
                                                <p className="text-gray-500">Only signed in users can see this course</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Access Rules Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Access Rules</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="access_open"
                                                name="access_rule"
                                                type="radio"
                                                checked={!course.access_rule || course.access_rule === 'OPEN'}
                                                onChange={() => setCourse({ ...course, access_rule: 'OPEN' })}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                            />
                                            <label htmlFor="access_open" className="text-sm font-medium text-gray-700">Open (Free)</label>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                id="access_invitation"
                                                name="access_rule"
                                                type="radio"
                                                checked={course.access_rule === 'INVITATION'}
                                                onChange={() => setCourse({ ...course, access_rule: 'INVITATION' })}
                                                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                            />
                                            <label htmlFor="access_invitation" className="text-sm font-medium text-gray-700">On Invitation</label>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="flex items-center h-5 mt-1">
                                                <input
                                                    id="access_payment"
                                                    name="access_rule"
                                                    type="radio"
                                                    checked={course.access_rule === 'PAYMENT'}
                                                    onChange={() => setCourse({ ...course, access_rule: 'PAYMENT' })}
                                                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="access_payment" className="text-sm font-medium text-gray-700">On Payment</label>

                                                {course.access_rule === 'PAYMENT' && (
                                                    <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                                        <span className="text-sm text-gray-500">Price:</span>
                                                        <Input
                                                            type="number"
                                                            value={course.price || ''}
                                                            onChange={(e) => setCourse({ ...course, price: e.target.value })}
                                                            placeholder="0.00"
                                                            className="w-32"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Responsible Section - Admin Only */}
                                {user?.role === 'admin' && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Responsible</h3>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-gray-700">Course Admin</label>
                                            <div className="relative">
                                                <select
                                                    value={course.course_admin || ''}
                                                    onChange={(e) => {
                                                        const selectedAdminId = e.target.value;
                                                        const selectedAdmin = instructors.find(i => i.id === selectedAdminId);
                                                        setCourse({
                                                            ...course,
                                                            course_admin: selectedAdminId,
                                                            responsible_name: selectedAdmin ? selectedAdmin.full_name : course.responsible_name
                                                        });
                                                    }}
                                                    className="w-full p-2 border border-neutral-300 rounded-md bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none"
                                                >
                                                    <option value="" disabled>Select a responsible user</option>
                                                    {instructors.map(instructor => (
                                                        <option key={instructor.id} value={instructor.id}>
                                                            {instructor.full_name} ({instructor.role_id === 1 ? 'Admin' : 'Instructor'})
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Select the user legally responsible for this course content.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                </div>
            </div >

            {/* Content Modal */}
            {
                showContentModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-lift">
                            <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                                <h3 className="text-xl font-bold text-primary">
                                    {newContent.type === 'QUIZ' ? 'Create New Quiz' : 'Add New Content'}
                                </h3>
                                <button onClick={() => setShowContentModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                {activeTab !== 'quiz' && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">Content Type</label>
                                        <div className="grid grid-cols-4 gap-4">
                                            {['VIDEO', 'DOCUMENT', 'IMAGE', 'QUIZ'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewContent({ ...newContent, type })}
                                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${newContent.type === type
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-500'
                                                        }`}
                                                >
                                                    {type === 'VIDEO' && <Video className={`h-6 w-6 mb-2 ${newContent.type === type ? 'text-primary' : 'text-neutral-400'}`} />}
                                                    {type === 'DOCUMENT' && <FileText className={`h-6 w-6 mb-2 ${newContent.type === type ? 'text-primary' : 'text-neutral-400'}`} />}
                                                    {type === 'IMAGE' && <ImageIcon className={`h-6 w-6 mb-2 ${newContent.type === type ? 'text-primary' : 'text-neutral-400'}`} />}
                                                    {type === 'QUIZ' && <HelpCircle className={`h-6 w-6 mb-2 ${newContent.type === type ? 'text-primary' : 'text-neutral-400'}`} />}
                                                    <span className="text-xs font-semibold">{type}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                                            {newContent.type === 'QUIZ' ? 'Quiz Title' : 'Content Title'}
                                        </label>
                                        <Input
                                            value={newContent.title}
                                            onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                            placeholder={newContent.type === 'QUIZ' ? "e.g: Chapter 1 Assessment" : "e.g: Introduction to sales"}
                                        />
                                    </div>

                                    {newContent.type !== 'QUIZ' && (
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                                {newContent.type === 'VIDEO' ? 'Video Link (YouTube/Vimeo)' : 'File URL'}
                                            </label>
                                            <Input
                                                value={newContent.url}
                                                onChange={(e) => setNewContent({ ...newContent, url: e.target.value })}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowContentModal(false)}>Cancel</Button>
                                <Button onClick={async () => {
                                    if (newContent.type === 'QUIZ') {
                                        try {
                                            // 1. Create Quiz Record
                                            const quiz = await quizAPI.create({ title: newContent.title, course_id: id });
                                            // 2. Create Lesson Record linked to Quiz
                                            const lesson = await lessonAPI.create({
                                                courseId: id,
                                                title: newContent.title,
                                                type: 'QUIZ',
                                                content_url: quiz.id, // Storing quiz ID in content_url
                                                lesson_order: lessons.length + 1
                                            });
                                            setLessons([...lessons, lesson]);
                                            setShowContentModal(false);
                                            // Redirect to builder
                                            navigate(`/instructor/course/${id}/quiz/${quiz.id}/edit`);
                                        } catch (error) {
                                            console.error('Failed to create quiz:', error);
                                            alert('Failed to create quiz. Please check if you are logged in.');
                                        }
                                    } else {
                                        handleAddContent();
                                    }
                                }} disabled={!newContent.title}>
                                    {newContent.type === 'QUIZ' ? 'Create & Build Quiz' : 'Add Content'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Add Attendee Modal */}
            {showAttendeeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-lift flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-6 border-b border-neutral-100">
                            <div>
                                <h3 className="text-xl font-bold text-primary">Add Attendee</h3>
                                <p className="text-xs text-neutral-500 mt-1">Select a learner to enroll in this course</p>
                            </div>
                            <button onClick={() => setShowAttendeeModal(false)} className="text-neutral-400 hover:text-neutral-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-neutral-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                                <Input
                                    className="pl-9"
                                    placeholder="Search by name or email..."
                                    value={learnerSearchTerm}
                                    onChange={(e) => setLearnerSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {isEligibleLoading ? (
                                <div className="p-8 text-center text-neutral-500">Loading learners...</div>
                            ) : eligibleLearners.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">No eligible learners found.</div>
                            ) : (
                                <div className="space-y-1">
                                    {eligibleLearners
                                        .filter(l =>
                                            l.full_name?.toLowerCase().includes(learnerSearchTerm.toLowerCase()) ||
                                            l.email?.toLowerCase().includes(learnerSearchTerm.toLowerCase())
                                        )
                                        .map((learner) => (
                                            <button
                                                key={learner.id}
                                                onClick={() => handleAddAttendee(learner.email)}
                                                disabled={isAddingAttendee}
                                                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 text-left transition-colors group"
                                            >
                                                <div>
                                                    <div className="font-medium text-neutral-900">{learner.full_name}</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-neutral-500">{learner.email}</span>
                                                        {learner.role_name?.toLowerCase() !== 'learner' && (
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded uppercase font-bold">
                                                                {learner.role_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button size="sm" className="h-8 py-0 px-3 text-xs bg-primary">
                                                        Enroll
                                                    </Button>
                                                </div>
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
                            <Button variant="ghost" onClick={() => setShowAttendeeModal(false)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default CourseForm;
