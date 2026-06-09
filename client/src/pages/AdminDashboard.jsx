import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Clock, PlayCircle, CheckCircle, Search, Filter, Columns } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalParticipants: 0,
        yetToStart: 0,
        inProgress: 0,
        completed: 0
    });
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'YET_TO_START', 'IN_PROGRESS', 'COMPLETED'

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        sNo: true,
        courseName: true,
        participantName: true,
        enrolledDate: true,
        startDate: true,
        timeSpent: true,
        completionPercentage: true,
        completedDate: true,
        status: true
    });
    const [showColumnPicker, setShowColumnPicker] = useState(false);

    useEffect(() => {
        console.log("AdminDashboard V2 Loaded - Force Refresh if you don't see this");
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [statsRes, enrollmentsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers }),
                fetch('/api/admin/enrollments', { headers })
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (enrollmentsRes.ok) {
                const enrollmentsData = await enrollmentsRes.json();
                setEnrollments(enrollmentsData);
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeSpent = (seconds) => {
        if (!seconds) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getFilteredEnrollments = () => {
        if (activeFilter === 'ALL') return enrollments;
        return enrollments.filter(row => row.status === activeFilter);
    };

    const StatCard = ({ title, count, icon: Icon, type, filterKey }) => (
        <div
            onClick={() => setActiveFilter(filterKey)}
            className={`cursor-pointer transition-all duration-200 p-6 rounded-xl border flex flex-col items-center justify-center gap-2
                ${activeFilter === filterKey
                    ? 'bg-white border-primary shadow-md transform scale-105'
                    : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-100'
                }`}
        >
            <div className={`p-3 rounded-full ${type === 'total' ? 'bg-neutral-200 text-neutral-700' :
                type === 'yetToStart' ? 'bg-red-100 text-red-600' :
                    type === 'inProgress' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                }`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className={`text-3xl font-bold ${type === 'total' ? 'text-neutral-800' :
                type === 'yetToStart' ? 'text-red-600' :
                    type === 'inProgress' ? 'text-orange-600' :
                        'text-green-600'
                }`}>
                {count}
            </div>
            <div className="text-sm font-medium text-neutral-500">{title}</div>
        </div>
    );

    return (
        <div className="space-y-8 p-6 max-w-[1600px] mx-auto">
            {/* Header */}
            <div>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-none mb-2">Busy Bee</Badge>
                <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
                    Start-ups <span className="text-neutral-400 font-normal">/</span> Progress
                </h1>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Participants"
                    count={stats.totalParticipants}
                    icon={Users}
                    type="total"
                    filterKey="ALL"
                />
                <StatCard
                    title="Yet to Start"
                    count={stats.yetToStart}
                    icon={Clock}
                    type="yetToStart"
                    filterKey="YET_TO_START"
                />
                <StatCard
                    title="In Progress"
                    count={stats.inProgress}
                    icon={PlayCircle}
                    type="inProgress"
                    filterKey="IN_PROGRESS"
                />
                <StatCard
                    title="Completed"
                    count={stats.completed}
                    icon={CheckCircle}
                    type="completed"
                    filterKey="COMPLETED"
                />
            </div>

            {/* Table Section */}
            <div className="space-y-4">
                <div className="flex justify-between items-center bg-yellow-100/50 p-2 rounded-lg border border-yellow-200">
                    <h2 className="text-lg font-semibold text-neutral-800 px-2">Users</h2>

                    {/* Column Picker */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="bg-white border border-neutral-300 shadow-sm gap-2"
                            onClick={() => setShowColumnPicker(!showColumnPicker)}
                        >
                            <Columns className="h-4 w-4" /> Customizable table
                        </Button>

                        {showColumnPicker && (
                            <div className="absolute right-0 top-10 z-20 w-56 bg-white rounded-lg shadow-xl border border-neutral-200 p-2">
                                <div className="text-xs font-semibold text-neutral-500 mb-2 px-2">Pick which columns to show/hide</div>
                                <div className="space-y-1">
                                    {Object.keys(visibleColumns).map(key => (
                                        <label key={key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded cursor-pointer text-sm">
                                            <input
                                                type="checkbox"
                                                checked={visibleColumns[key]}
                                                onChange={() => setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }))}
                                                className="rounded border-neutral-300 text-primary focus:ring-primary"
                                            />
                                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Overlay to close picker */}
                        {showColumnPicker && (
                            <div className="fixed inset-0 z-10" onClick={() => setShowColumnPicker(false)}></div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-neutral-500 font-semibold border-b border-neutral-200 bg-neutral-50/50">
                                <tr>
                                    {visibleColumns.sNo && <th className="px-6 py-4 w-16">S.No.</th>}
                                    {visibleColumns.courseName && <th className="px-6 py-4">Course Name</th>}
                                    {visibleColumns.participantName && <th className="px-6 py-4">Participant name</th>}
                                    {visibleColumns.enrolledDate && <th className="px-6 py-4">Enrolled Date</th>}
                                    {visibleColumns.startDate && <th className="px-6 py-4">Start date</th>}
                                    {visibleColumns.timeSpent && <th className="px-6 py-4">Time spent</th>}
                                    {visibleColumns.completionPercentage && <th className="px-6 py-4 text-center">Completion percentage</th>}
                                    {visibleColumns.completedDate && <th className="px-6 py-4">Completed date</th>}
                                    {visibleColumns.status && <th className="px-6 py-4">Status</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {loading ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-neutral-500">Loading data...</td></tr>
                                ) : getFilteredEnrollments().length === 0 ? (
                                    <tr><td colSpan="9" className="p-8 text-center text-neutral-500">No records found.</td></tr>
                                ) : (
                                    getFilteredEnrollments().map((row, index) => (
                                        <tr key={`${row.user_id}-${index}`} className="hover:bg-neutral-50/50 transition-colors">
                                            {visibleColumns.sNo && <td className="px-6 py-4 text-neutral-500">{index + 1}</td>}
                                            {visibleColumns.courseName && (
                                                <td className="px-6 py-4 font-medium text-blue-600">
                                                    <a
                                                        href={`/admin/course/${row.course_id}/edit`}
                                                        className="hover:underline cursor-pointer text-blue-700 font-bold"
                                                    >
                                                        {row.course_name}
                                                    </a>
                                                </td>
                                            )}
                                            {visibleColumns.participantName && <td className="px-6 py-4 font-medium text-neutral-800">{row.participant_name}</td>}
                                            {visibleColumns.enrolledDate && <td className="px-6 py-4 text-neutral-600">{formatDate(row.enrolled_at)}</td>}
                                            {visibleColumns.startDate && <td className="px-6 py-4 text-neutral-600">{formatDate(row.started_at)}</td>}
                                            {visibleColumns.timeSpent && <td className="px-6 py-4 text-red-500 font-medium">{formatTimeSpent(row.time_spent_seconds)}</td>}
                                            {visibleColumns.completionPercentage && (
                                                <td className="px-6 py-4 text-center">
                                                    {row.status !== 'YET_TO_START' && row.started_at ? (
                                                        <span className="text-blue-600 font-semibold">{Math.round(row.completion_percentage || 0)}%</span>
                                                    ) : (
                                                        <span className="text-neutral-400">-</span>
                                                    )}
                                                </td>
                                            )}
                                            {visibleColumns.completedDate && <td className="px-6 py-4 text-blue-600">{formatDate(row.completed_at)}</td>}
                                            {visibleColumns.status && (
                                                <td className="px-6 py-4">
                                                    <span className={`text-xs font-semibold
                                                        ${row.status === 'COMPLETED' ? 'text-green-600' :
                                                            row.status === 'IN_PROGRESS' ? 'text-orange-500' :
                                                                'text-red-500'}`}>
                                                        {row.status === 'COMPLETED' ? 'Completed' :
                                                            row.status === 'IN_PROGRESS' ? 'In progress' :
                                                                'Yet to start'}
                                                    </span>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
