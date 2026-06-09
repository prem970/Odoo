
import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Mail, CheckCircle, X } from 'lucide-react';
import { userAPI } from '../../services/api';
import { Button } from '../../components/ui/Button';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', role_id: 3 });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await userAPI.delete(userId);
                setUsers(users.filter(user => user.id !== userId));
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Failed to delete user');
            }
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditForm({
            full_name: user.full_name,
            role_id: user.role_id
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser) return;

        try {
            setIsSaving(true);
            const updated = await userAPI.update(editingUser.id, editForm);
            setUsers(users.map(u => u.id === editingUser.id ? updated : u));
            setIsEditModalOpen(false);
            setEditingUser(null);
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role_name?.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'instructor': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-neutral-100 text-neutral-700 border-neutral-200';
        }
    };

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-neutral-500 font-medium tracking-wide">Fetching users list...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">User Management</h1>
                    <p className="text-neutral-500 mt-1">Manage system access, roles, and security for LearnSphere users.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl">
                        <Filter className="h-4 w-4 text-neutral-500" />
                        <select
                            className="bg-transparent text-sm font-semibold text-neutral-600 focus:outline-none cursor-pointer"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admins Only</option>
                            <option value="instructor">Instructors</option>
                            <option value="learner">Learners</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50/50 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-5 font-bold text-neutral-800 uppercase tracking-wider text-[11px]">User Identity</th>
                                <th className="px-6 py-5 font-bold text-neutral-800 uppercase tracking-wider text-[11px]">Access Role</th>
                                <th className="px-6 py-5 font-bold text-neutral-800 uppercase tracking-wider text-[11px]">Status</th>
                                <th className="px-6 py-5 font-bold text-neutral-800 uppercase tracking-wider text-[11px]">Registration Date</th>
                                <th className="px-6 py-5 font-bold text-neutral-800 uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-neutral-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                                                {user.full_name ? user.full_name[0].toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{user.full_name || 'Anonymous User'}</div>
                                                <div className="text-neutral-500 text-xs flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="h-3.5 w-3.5 opacity-70" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getRoleBadgeColor(user.role_name)}`}>
                                            {user.role_name || 'LEARNER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg w-fit border border-emerald-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-xs font-bold">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-500 font-medium">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="p-2.5 text-neutral-400 hover:text-primary hover:bg-neutral-100 rounded-xl transition-all border border-transparent hover:border-neutral-200"
                                            >
                                                <Edit className="h-4.5 w-4.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="p-2.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                            >
                                                <Trash2 className="h-4.5 w-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-neutral-400 italic">No users found matching your criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-neutral-200 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <h2 className="text-xl font-bold text-neutral-900">Edit User Access</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                    value={editForm.full_name}
                                    onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral-700">Access Level</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all cursor-pointer bg-white"
                                    value={editForm.role_id}
                                    onChange={e => setEditForm({ ...editForm, role_id: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Administrator</option>
                                    <option value={2}>Instructor</option>
                                    <option value={3}>Learner</option>
                                </select>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3 italic text-xs text-blue-700 leading-relaxed shadow-inner">
                                Changing a user's role will immediately adjust their dashboard access and permissions across the platform.
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-xl h-12"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 rounded-xl h-12"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : 'Update User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
