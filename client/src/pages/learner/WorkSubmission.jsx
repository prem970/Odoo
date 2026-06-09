import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UploadCloud, CheckCircle, FileText, Calendar, Briefcase } from 'lucide-react';

const WorkSubmission = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assignments', { // Updated API endpoint
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAssignments(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [selectedAssign, setSelectedAssign] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ text_content: '', file_url: '' });

    const handleUploadClick = (assign) => {
        setSelectedAssign(assign);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/assignments/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assignmentId: selectedAssign.id,
                    textContent: formData.text_content,
                    fileUrl: formData.file_url
                })
            });

            if (res.ok) {
                alert("Work submitted successfully!");
                setSelectedAssign(null);
                setFormData({ text_content: '', file_url: '' });
                fetchAssignments();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to submit work.");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during submission.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-neutral-500 animate-pulse">Loading assignments...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in pb-20 relative">
            {/* Hero Section */}
            <div className="relative rounded-[2rem] overflow-hidden bg-primary p-8 md:p-12 text-white shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                    <Briefcase className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 space-y-6 max-w-2xl">
                    <Badge variant="secondary" className="bg-white/20 text-white border-none italic font-medium px-4 py-1">
                        Hands-on Learning
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Transform Your <span className="text-amber-300">Skillset</span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-100 font-medium leading-relaxed">
                        Apply your knowledge through real-world projects, submit your work, and interact in <span className="text-white font-bold italic">Live</span> review sessions.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button onClick={() => navigate('/courses/explore')} className="rounded-full h-14 px-8 bg-white text-primary hover:bg-neutral-100 border-none font-bold text-lg shadow-lg">
                            Explore More Courses
                        </Button>
                        <Button onClick={() => navigate('/live-classes')} variant="outline" className="rounded-full h-14 px-8 border-white/30 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm">
                            Experience Live Learning
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {assignments.map(assign => (
                    <Card key={assign.id} className="bg-white border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-start justify-between pb-4">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="mb-2">{assign.course_title}</Badge>
                                <CardTitle className="text-2xl font-bold text-neutral-900">{assign.title}</CardTitle>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${assign.status === 'SUBMITTED' ? 'bg-green-100 text-green-700' :
                                'bg-accent-mustard/10 text-yellow-700'
                                }`}>
                                {assign.status || 'PENDING'}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4 border-t border-neutral-50">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2 text-sm font-bold text-neutral-500">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        Due Date: {assign.due_date ? new Date(assign.due_date).toLocaleDateString() : 'No Due Date'}
                                    </div>
                                    <p className="text-neutral-600 text-sm leading-relaxed max-w-2xl">{assign.description}</p>
                                </div>
                                <Button
                                    onClick={() => handleUploadClick(assign)}
                                    disabled={assign.status === 'SUBMITTED'}
                                    className={assign.status === 'SUBMITTED' ? 'bg-neutral-100 text-neutral-400 border-none' : 'min-w-[160px] h-12'}
                                    variant={assign.status === 'SUBMITTED' ? 'outline' : 'default'}
                                >
                                    {assign.status === 'SUBMITTED' ? (
                                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Submitted</span>
                                    ) : (
                                        <span className="flex items-center gap-2"><UploadCloud className="w-4 h-4" /> Upload Work</span>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {assignments.length === 0 && (
                    <div className="text-center py-24 text-neutral-400 bg-neutral-50/50 rounded-3xl border-2 border-dashed border-neutral-200">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 opacity-20" />
                        </div>
                        <p className="text-xl font-bold text-neutral-500">No active assignments</p>
                        <p className="text-sm">You are all caught up for now!</p>
                    </div>
                )}
            </div>

            {/* Submission Modal */}
            {selectedAssign && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-xl bg-white shadow-2xl animate-in zoom-in-95 duration-200 border-none overflow-hidden rounded-3xl">
                        <CardHeader className="bg-primary text-primary-foreground p-8">
                            <CardTitle className="text-2xl font-black mb-1">Upload Work</CardTitle>
                            <CardDescription className="text-primary-foreground/80 font-medium">
                                {selectedAssign.title} • {selectedAssign.course_title}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Submission Notes (Optional)</label>
                                    <textarea
                                        className="w-full min-h-[120px] p-4 rounded-2xl border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm"
                                        placeholder="Describe your work or add any comments for the instructor..."
                                        value={formData.text_content}
                                        onChange={(e) => setFormData({ ...formData, text_content: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-neutral-700 ml-1">Work Link (URL)</label>
                                    <div className="relative">
                                        <UploadCloud className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                                        <input
                                            type="url"
                                            className="w-full h-12 pl-12 pr-4 rounded-full border border-neutral-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                                            placeholder="Paste your link here (e.g. GitHub, Google Drive)"
                                            value={formData.file_url}
                                            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-12 rounded-full border-neutral-200 hover:bg-neutral-50"
                                        onClick={() => setSelectedAssign(null)}
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-12 rounded-full shadow-lg shadow-primary/20"
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Submitting...' : 'Confirm Submission'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default WorkSubmission;
