import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CirclePlay as PlayCircle, FileText, CircleCheck as CheckCircle, Clock, Star, MessageSquare, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

const CourseOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [reviewsData, setReviewsData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };

                const [courseRes, lessonsRes, reviewsRes] = await Promise.all([
                    fetch(`/api/learner/courses/${id}`, { headers }),
                    fetch(`/api/learner/courses/${id}/lessons`, { headers }),
                    fetch(`/api/learner/courses/${id}/reviews`, { headers })
                ]);

                if (courseRes.ok && lessonsRes.ok) {
                    setCourse(await courseRes.json());
                    setLessons(await lessonsRes.json());
                }
                if (reviewsRes.ok) {
                    setReviewsData(await reviewsRes.json());
                }
            } catch (error) {
                console.error('Error fetching course data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleStartLesson = (lessonId) => {
        navigate(`/course/${id}/lesson/${lessonId}`);
    };

    if (loading) return <div className="p-8 text-center">Loading course data...</div>;
    if (!course) return <div className="p-8 text-center text-red-500">Course not found</div>;

    const completedLessons = lessons.filter(l => l.completed).length;
    // Calculate progress if not provided by backend course detail (backend usually provides static course data, not user progress, unless we join it. 
    // EnrollmentController provided progress. CourseController.getCourseDetails currently does not user-specific progress.
    // Let's use local calculation based on lessons fetch which HAS user progress.
    const progress = Math.round((completedLessons / lessons.length) * 100) || 0;

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Hero Header */}
            <div className="relative rounded-3xl overflow-hidden bg-neutral-900 text-white min-h-[300px] flex items-end">
                {course.image_url && (
                    <>
                        <div className="absolute inset-0 bg-black/60 z-10" />
                        <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                    </>
                )}

                <div className="relative z-20 p-8 w-full max-w-4xl">
                    <Badge className="mb-4 bg-primary text-white border-none">
                        {course.visibility === 'EVERYONE' ? 'Public Course' : 'Private'}
                    </Badge>
                    <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                    <div className="flex flex-wrap gap-6 text-sm text-neutral-300 mb-6">
                        <span className="flex items-center gap-2">
                            <img src={`https://ui-avatars.com/api/?name=${course.instructor_name || 'Instructor'}&background=random`} alt="Instructor" className="w-6 h-6 rounded-full" />
                            {course.instructor_name || 'Instructor'}
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" /> {lessons.length} Lessons
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {Math.round(lessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60)}h Content
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-current" /> 4.8 (120 reviews)
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                            <div className="flex justify-between text-xs mb-1">
                                <span>{progress}% Completed</span>
                                <span>{completedLessons}/{lessons.length}</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tab Buttons */}
                    <div className="flex gap-4 border-b border-neutral-200 pb-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Course Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('reviews')}
                            className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Ratings & Reviews
                        </button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="prose max-w-none text-neutral-600 bg-white p-6 rounded-2xl shadow-sm border border-neutral-100">
                                <h3 className="text-xl font-bold mb-4">About this Course</h3>
                                <p className="leading-relaxed">{course.description || "No description available."}</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                                <div className="p-6 border-b border-neutral-100">
                                    <h3 className="text-xl font-bold">Course Content</h3>
                                    <p className="text-sm text-neutral-500 mt-1">{lessons.length} lessons • {Math.round(lessons.reduce((acc, l) => acc + (l.duration || 0), 0) / 60)}h total length</p>
                                </div>
                                <div className="divide-y divide-neutral-100">
                                    {lessons.map((lesson, index) => (
                                        <div
                                            key={lesson.id}
                                            className={`group p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer ${lesson.completed ? 'bg-neutral-50/50' : ''}`}
                                            onClick={() => handleStartLesson(lesson.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${lesson.completed ? 'bg-green-100 text-green-600' : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    {lesson.completed ? <CheckCircle className="h-5 w-5" /> : index + 1}
                                                </div>
                                                <div>
                                                    <h4 className={`font-medium text-base ${lesson.completed ? 'text-neutral-500' : 'text-neutral-900 group-hover:text-primary'}`}>
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            {lesson.type === 'VIDEO' && <PlayCircle className="h-3 w-3" />}
                                                            {lesson.type === 'DOCUMENT' && <FileText className="h-3 w-3" />}
                                                            {lesson.type}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{lesson.duration ? `${lesson.duration} min` : '5 min'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant={lesson.completed ? "ghost" : "secondary"} size="sm" className={lesson.completed ? "text-green-600 hover:text-green-700 hover:bg-green-50" : ""}>
                                                {lesson.completed ? 'Completed' : 'Start'}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {/* Write Review Form */}
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg">Write a Review</CardTitle>
                                    <CardDescription>Share your experience with other students</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const rating = e.target.rating.value;
                                        const review = e.target.review.value;
                                        try {
                                            const token = localStorage.getItem('token');
                                            const res = await fetch(`/api/learner/courses/${id}/reviews`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ rating, review })
                                            });
                                            if (res.ok) {
                                                alert('Review submitted!');
                                                window.location.reload(); // Refresh to show new review
                                            }
                                        } catch (err) {
                                            console.error(err);
                                        }
                                    }} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Rating</label>
                                            <select name="rating" className="w-full p-2 rounded-lg border border-neutral-200 bg-white">
                                                <option value="5">5 - Excellent</option>
                                                <option value="4">4 - Very Good</option>
                                                <option value="3">3 - Good</option>
                                                <option value="2">2 - Fair</option>
                                                <option value="1">1 - Poor</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Your Review</label>
                                            <textarea
                                                name="review"
                                                className="w-full p-3 rounded-xl border border-neutral-200 bg-white min-h-[100px]"
                                                placeholder="What did you like or dislike about this course?"
                                            />
                                        </div>
                                        <Button type="submit" className="w-full">Submit Review</Button>
                                    </form>
                                </CardContent>
                            </Card>

                            {reviewsData ? (
                                <>
                                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 flex flex-col md:flex-row items-center gap-8">
                                        <div className="text-center md:text-left min-w-[200px]">
                                            <div className="text-5xl font-extrabold text-neutral-900 mb-2">{reviewsData.stats.average}</div>
                                            <div className="flex justify-center md:justify-start text-yellow-400 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(reviewsData.stats.average) ? 'fill-current' : 'text-neutral-200'}`} />
                                                ))}
                                            </div>
                                            <div className="text-sm font-medium text-neutral-500">{reviewsData.stats.total} Ratings</div>
                                        </div>

                                        <div className="flex-1 w-full space-y-2 border-l border-neutral-100 pl-0 md:pl-8">
                                            <div className="space-y-2">
                                                {[5, 4, 3, 2, 1].map((stars) => {
                                                    const count = reviewsData.reviews.filter(r => Math.round(r.rating) === stars).length;
                                                    const percent = reviewsData.stats.total ? Math.round((count / reviewsData.stats.total) * 100) : 0;
                                                    return (
                                                        <div key={stars} className="flex items-center gap-3 text-sm">
                                                            <div className="flex items-center gap-1 w-12 text-neutral-600 font-medium">
                                                                {stars} <Star className="h-3 w-3 text-neutral-400" />
                                                            </div>
                                                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }}></div>
                                                            </div>
                                                            <div className="w-10 text-right text-neutral-400">{percent}%</div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-neutral-900">Student Feedback</h3>
                                        {reviewsData.reviews.length > 0 ? (
                                            <div className="grid gap-4">
                                                {reviewsData.reviews.map((review, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-shadow">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                                                    {review.full_name ? review.full_name[0] : 'U'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-neutral-900">{review.full_name}</div>
                                                                    <div className="text-xs text-neutral-500">
                                                                        {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex text-yellow-400 bg-yellow-50 px-2 py-1 rounded-lg">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <Star key={star} className={`h-3 w-3 ${star <= review.rating ? 'fill-current' : 'text-transparent'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className="text-neutral-600 leading-relaxed text-sm">
                                                            {review.review}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                                <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                                                <p className="text-neutral-500 font-medium">No reviews yet.</p>
                                                <p className="text-sm text-neutral-400">Be the first to review this course!</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">Loading reviews...</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle>Course Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center py-4">
                                <div className="text-3xl font-bold text-primary mb-1">{progress}%</div>
                                <div className="text-sm text-neutral-500">Completed</div>
                            </div>
                            {progress < 100 ? (
                                <Button className="w-full" onClick={() => {
                                    const nextLesson = lessons.find(l => !l.completed) || lessons[0];
                                    if (nextLesson) handleStartLesson(nextLesson.id);
                                }}>
                                    Continue Learning
                                </Button>
                            ) : (
                        <Button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white border-none shadow-md"
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetch('/api/certificates/generate', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ courseId: id })
                                    });

                                    if (res.ok) {
                                        const data = await res.json();
                                        window.open(data.pdf_url, '_blank');
                                    } else {
                                        alert('Error generating certificate');
                                    }
                                } catch (err) {
                                    console.error('Cert Error:', err);
                                }
                            }}
                        >
                            Download Certificate <Trophy className="ml-2 h-4 w-4" />
                        </Button>
                            )}
                    </CardContent>
                </Card>
            </div>
        </div>
        </div >
    );
};

export default CourseOverview;
