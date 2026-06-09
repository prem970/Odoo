import React, { useState, useEffect } from 'react';
import { User, Lock, Save, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
    const { user, login } = useAuth(); // We might need to update user context after name change
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        role: ''
    });
    const [passData, setPassData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await userAPI.getProfile();
            setProfileData({
                full_name: data.full_name,
                email: data.email,
                role: data.role_id === 1 ? 'Admin' : data.role_id === 2 ? 'Instructor' : 'Learner'
            });
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const updatedUser = await userAPI.updateProfile({ full_name: profileData.full_name });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            // Ideally update context here, but a page reload or re-fetch works too
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passData.newPassword !== passData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await userAPI.changePassword({
                currentPassword: passData.currentPassword,
                newPassword: passData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-neutral-800">Account Settings</h1>

            {message.text && (
                <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    <AlertCircle className="h-5 w-5" />
                    {message.text}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                                <Input
                                    value={profileData.full_name}
                                    onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Email (Read-only)</label>
                                <Input
                                    value={profileData.email}
                                    disabled
                                    className="bg-neutral-100 text-neutral-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                                <div className="px-3 py-2 bg-neutral-100 rounded-md text-neutral-500 text-sm">
                                    {profileData.role}
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
                                <Input
                                    type="password"
                                    value={passData.currentPassword}
                                    onChange={e => setPassData({ ...passData, currentPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
                                <Input
                                    type="password"
                                    value={passData.newPassword}
                                    onChange={e => setPassData({ ...passData, newPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={passData.confirmPassword}
                                    onChange={e => setPassData({ ...passData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-neutral-800 hover:bg-neutral-900 text-white">
                                {loading ? 'Updating...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Settings;
