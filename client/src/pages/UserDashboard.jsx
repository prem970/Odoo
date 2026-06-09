import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Trophy, Clock, CircleCheck as CheckCircle, CirclePlay as PlayCircle, ArrowRight, CircleHelp as HelpCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    console.log('UserDashboard: Rendering...');
    const { user } = useAuth();
    console.log('UserDashboard: User:', user);
    const navigate = useNavigate();
    const role = (user?.role || '').toString().trim().toUpperCase();
    const isInstructor = role === 'INSTRUCTOR' || role === 'MENTOR' || role === 'TEACHER';
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                // Fetch Courses
                const coursesUrl = isInstructor ? '/api/courses/instructor' : '/api/learner/my-courses';
                const coursesRes = await fetch(coursesUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (coursesRes.ok) {
                    const data = await coursesRes.json();
                    setCourses(data);
                }

                // Fetch Quizzes
                const quizzesRes = await fetch('/api/learner/my-quizzes', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (quizzesRes.ok) {
                    const data = await quizzesRes.json();
                    setQuizzes(data);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isInstructor]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'IN_PROGRESS': return 'default';
            case 'YET_TO_START': return 'secondary';
            default: return 'outline';
        }
    };

    const handleResume = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            {/* Header Section */}
            <div className="relative rounded-[2rem] overflow-hidden bg-primary p-8 md:p-12 text-white shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    {isInstructor ? <Users className="w-48 h-48 text-white" /> : <Trophy className="w-48 h-48 text-white" />}
                </div>
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none italic font-medium px-4 py-1">
                        {isInstructor ? 'Instructor Hub' : 'Personal Learning Dashboard'}
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        <span className="text-white">Transform Your</span> <span className="text-amber-300">Skillset</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-100 font-medium leading-relaxed">
                        {isInstructor
                            ? 'Empower your students as a mentor. Manage your teaching portfolio and lead immersive '
                            : 'Continue your trajectory or explore interactive '
                        }
                        <span className="text-white font-bold italic">Live</span> learning sessions and master new domains.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button onClick={() => navigate(isInstructor ? '/instructor/dashboard' : '/courses/explore')} className="rounded-full h-14 px-8 bg-white text-primary hover:bg-neutral-100 border-none font-bold text-lg shadow-lg transition-transform hover:scale-105 active:scale-95">
                            {isInstructor ? 'Course Manager' : 'Explore Courses'}
                        </Button>
                        <Button onClick={() => navigate('/live-classes')} variant="outline" className="rounded-full h-14 px-8 border-white/30 bg-transparent text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm transition-transform hover:scale-105 active:scale-95">
                            <span className="text-white">Experience Live Learning</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isInstructor ? (
                    <>
                        <StatCard
                            title="Total Students"
                            value={courses.reduce((acc, c) => acc + (parseInt(c.student_count) || 0), 0).toString()}
                            icon={Users}
                            moduleColor="crm"
                        />
                        <StatCard
                            title="Active Courses"
                            value={courses.filter(c => c.published).length.toString()}
                            icon={BookOpen}
                            moduleColor="finance"
                        />
                        <StatCard
                            title="Average Rating"
                            value={(courses.length > 0 ? (courses.reduce((acc, c) => acc + (parseFloat(c.average_rating) || 0), 0) / courses.length) : 0).toFixed(1)}
                            icon={Star}
                            trend="up"
                            trendValue="+0"
                        />
                    </>
                ) : (
                    <>
                        <StatCard
                            title="Enrolled Courses"
                            value={courses.length}
                            icon={BookOpen}
                            trend="neutral"
                        />
                        <StatCard
                            title="Completed"
                            value={courses.filter(c => c && c.status === 'COMPLETED').length}
                            icon={CheckCircle}
                            moduleColor="finance"
                        />
                        <StatCard
                            title="Total Points"
                            value={user?.points || 0}
                            icon={Trophy}
                            trend="up"
                            trendValue="+0"
                            moduleColor="crm"
                        />
                    </>
                )}
            </div>

            {/* Courses Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-neutral-800">{isInstructor ? 'Instructor Portfolio' : 'My Courses'}</h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <Card key={i} className="h-64 animate-pulse bg-neutral-100 border-none rounded-3xl" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-neutral-200">
                        <div className="h-16 w-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="h-8 w-8 text-neutral-400" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900">{isInstructor ? 'No courses created' : 'No courses yet'}</h3>
                        <p className="text-neutral-500 mb-6">{isInstructor ? 'Launch your first course to start teaching.' : 'Start your learning journey by enrolling in a course.'}</p>
                        <Button onClick={() => navigate(isInstructor ? '/instructor/dashboard' : '/courses/explore')} className="rounded-2xl">
                            {isInstructor ? 'Create Course' : 'Explore Courses'}
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-neutral-200 rounded-3xl">
                                <div className="h-40 bg-neutral-100 relative overflow-hidden">
                                    {course.image_url ? (
                                        <img
                                            src={course.image_url}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                            <BookOpen className="h-12 w-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <Badge variant={isInstructor ? (course.published ? 'success' : 'secondary') : getStatusColor(course.status)} className="shadow-sm">
                                            {isInstructor ? (course.published ? 'PUBLISHED' : 'DRAFT') : (course.status || 'YET_TO_START').replace(/_/g, ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-2">
                                    <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </CardTitle>
                                    <div className="flex items-center justify-between text-sm text-neutral-500">
                                        {isInstructor ? (
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1 font-medium text-amber-600">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {parseFloat(course.average_rating || 0).toFixed(1)}
                                                </span>
                                                <span className="flex items-center gap-1 font-medium text-primary">
                                                    <Users className="h-3 w-3" />
                                                    {course.student_count || 0} Students
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="flex items-center gap-1 font-medium">
                                                <Clock className="h-3 w-3" />
                                                {course.completion_percentage}% Complete
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="w-full h-2 bg-neutral-100 rounded-full mb-6 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-1000 ${isInstructor ? (course.published ? 'bg-green-500' : 'bg-neutral-400') : (course.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary')
                                                }`}
                                            style={{ width: isInstructor ? '100%' : `${course.completion_percentage}%` }}
                                        />
                                    </div>

                                    <Button
                                        className="w-full rounded-2xl group-hover:gap-3 transition-all font-bold"
                                        onClick={() => isInstructor ? navigate(`/instructor/course/${course.id}/edit`) : handleResume(course.id)}
                                        variant={isInstructor ? "default" : (course.status === 'COMPLETED' ? "outline" : "default")}
                                    >
                                        {isInstructor ? (
                                            <>Edit Course <ArrowRight className="ml-2 h-4 w-4" /></>
                                        ) : (
                                            course.status === 'COMPLETED' ? (
                                                <>View Certificate <Trophy className="ml-2 h-4 w-4 text-yellow-500" /></>
                                            ) : (
                                                <>Resume Learning <PlayCircle className="ml-2 h-4 w-4" /></>
                                            )
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Quizzes Section - Hidden for Instructors */}
            {!isInstructor && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-neutral-800">Recent Assessments</h2>
                        <Button variant="ghost" className="text-primary hover:text-primary/80" onClick={() => navigate('/quizzes')}>
                            View All Quizzes <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-32 bg-white border border-neutral-100 animate-pulse rounded-3xl" />
                            ))}
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-neutral-200 shadow-sm">
                            <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HelpCircle className="w-8 h-8 text-neutral-300" />
                            </div>
                            <h3 className="font-semibold text-neutral-900">No quizzes available</h3>
                            <p className="text-neutral-500 text-sm">Quizzes will appear as you progress through your courses.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {quizzes.slice(0, 3).map((quiz) => (
                                <div
                                    key={quiz.id}
                                    onClick={() => {
                                        if (quiz.lesson_id) {
                                            navigate(`/course/${quiz.course_id}/lesson/${quiz.lesson_id}`);
                                        } else {
                                            navigate(`/courses/${quiz.course_id}`);
                                        }
                                    }}
                                    className="group bg-white p-6 rounded-3xl border border-neutral-200 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex items-center justify-between shadow-sm"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-neutral-50 rounded-2xl text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
                                            <HelpCircle className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900 line-clamp-1 group-hover:text-primary transition-colors">{quiz.title}</h3>
                                            <p className="text-sm text-neutral-500 font-medium">{quiz.course_title}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-6 w-6 text-neutral-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
