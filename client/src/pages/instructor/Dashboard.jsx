import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List as ListIcon, Plus, Eye, BookOpen, Clock, Share2, Edit2, MoreVertical, Trash2, Users, Star } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { courseAPI } from '../../services/api';

const CoursesDashboard = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            // Use the instructor endpoint to get ALL courses (draft & published)
            const data = await courseAPI.getForInstructor();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        // Create a draft course and redirect to edit
        try {
            const newCourse = await courseAPI.create({
                title: 'New Course',
                description: '',
                status: 'DRAFT',
                visibility: 'EVERYONE'
            });
            navigate(`/instructor/course/${newCourse.id}/edit`);
        } catch (error) {
            console.error('Failed to create course:', error);
        }
    };

    const handleDeleteCourse = async (e, courseId) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await courseAPI.delete(courseId);
                // Refresh list
                setCourses(courses.filter(c => c.id !== courseId));
            } catch (error) {
                console.error('Failed to delete course:', error);
                alert('Failed to delete course');
            }
        }
    };

    const filteredCourses = courses.filter(course => {
        const query = searchQuery.toLowerCase();
        return (
            course.title?.toLowerCase().includes(query) ||
            course.description?.toLowerCase().includes(query) ||
            (Array.isArray(course.tags) && course.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Odoo" className="h-8 w-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
                    <h1 className="text-xl font-bold text-primary">eLearning</h1>
                </div>

                <div className="flex flex-1 max-w-md mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-10 bg-neutral-50 border-neutral-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-neutral-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <ListIcon className="h-4 w-4" />
                        </button>
                    </div>
                    <Button onClick={handleCreateCourse} className="gap-2 bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> New Course
                    </Button>
                </div>
            </div>

            {/* Course Grid/List */}
            {loading ? (
                <div className="text-center py-20 text-neutral-500">Loading courses...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                    <p className="text-neutral-500">No courses found. Create your first course!</p>
                </div>
            ) : (
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {filteredCourses.map(course => (
                        <Card key={course.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border-neutral-200">
                            {/* Card Header & Status */}
                            <div className="relative h-2 bg-primary/10">
                                <div className={`absolute right-4 top-4 px-3 py-1 rounded-full text-xs font-semibold ${course.published
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
                                    }`}>
                                    {course.published ? 'Published' : 'Draft'}
                                </div>
                            </div>

                            <CardContent className="pt-8 pb-6 px-6">
                                {/* Title & Actions */}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-neutral-800 line-clamp-1 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h3>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-500" title="Delete" onClick={(e) => handleDeleteCourse(e, course.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => navigate(`/instructor/course/${course.id}/edit`)}
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4 text-primary" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 my-6">
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span><span className="font-semibold text-neutral-900">{course.student_count || 0}</span> Students</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <Star className="h-4 w-4 text-amber-500 fill-current" />
                                        <span><span className="font-semibold text-neutral-900">{parseFloat(course.average_rating || 0).toFixed(1)}</span> Rating</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                                        <BookOpen className="h-4 w-4 text-accent-sky" />
                                        <span><span className="font-semibold text-neutral-900">{course.lesson_count || 0}</span> Contents</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-neutral-600 col-span-2">
                                        <Clock className="h-4 w-4 text-accent-teal" />
                                        <span>
                                            {(() => {
                                                const mins = parseInt(course.total_duration || 0);
                                                const h = Math.floor(mins / 60);
                                                const m = mins % 60;
                                                return h > 0 ? `${h}h ${m}m` : `${m}m`;
                                            })()} Duration
                                        </span>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-neutral-100">
                                    {['Sale', 'Graph'].map(tag => (
                                        <Badge key={tag} variant="secondary" className="bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-normal">
                                            {tag} <span className="ml-1 text-neutral-400 cursor-pointer hover:text-red-500">×</span>
                                        </Badge>
                                    ))}
                                    <button className="text-neutral-400 hover:text-primary transition-colors">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesDashboard;
