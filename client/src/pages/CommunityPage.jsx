import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/Button';
import {
    Hash,
    Users,
    Search,
    Plus,
    Smile,
    Send,
    Menu,
    X,
    Loader2,
    LogIn,
    MessageSquarePlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityPage = () => {
    // State for Room Joining/Creation
    const [isInRoom, setIsInRoom] = useState(false);
    const [roomAction, setRoomAction] = useState('landing'); // 'landing', 'create', 'join'
    const [roomNameInput, setRoomNameInput] = useState('');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [error, setError] = useState('');
    const [isLoadingRoom, setIsLoadingRoom] = useState(false);

    // Chat State
    const [activeChannel, setActiveChannel] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMembers, setShowMembers] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [channels, setChannels] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingChannels, setLoadingChannels] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // User Identity (Simulated since we don't have full auth context for this public page sometimes,
    // but better to use what we have or a guest fallback)
    const currentUser = {
        name: 'Guest User',
        role: 'LEARNER',
        avatar: 'G'
    };

    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch initial data needed for room validation/listing
    const fetchChannels = async () => {
        try {
            setLoadingChannels(true);
            const response = await fetch('http://localhost:5000/api/public/community-channels');
            if (response.ok) {
                const data = await response.json();
                setChannels(data);
                return data;
            }
        } catch (error) {
            console.error('Error fetching channels:', error);
        } finally {
            setLoadingChannels(false);
        }
        return [];
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    // Fetch Users when entering room
    useEffect(() => {
        if (!isInRoom) return;

        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/public/community-users');
                if (response.ok) {
                    const data = await response.json();
                    setOnlineUsers(data);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoadingUsers(false);
            }
        };
        fetchUsers();
    }, [isInRoom]);

    // Fetch Messages for Active Channel & Poll
    useEffect(() => {
        if (!activeChannel || !isInRoom) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/public/community-messages/${activeChannel}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoadingMessages(false);
            }
        };

        setLoadingMessages(true);
        fetchMessages();

        // Polling for new messages every 3 seconds
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);
    }, [activeChannel, isInRoom]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!roomNameInput.trim()) return;
        setIsLoadingRoom(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/public/community-channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: roomNameInput, type: 'text' })
            });

            if (response.ok) {
                const newChannel = await response.json();
                setChannels(prev => [...prev, newChannel]);
                setActiveChannel(newChannel.id);
                setIsInRoom(true);
                setRoomNameInput('');
            } else {
                const err = await response.json();
                setError(err.message || 'Failed to create room');
            }
        } catch (err) {
            setError('Server error, please try again.');
        } finally {
            setIsLoadingRoom(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (!roomCodeInput.trim()) return;
        setIsLoadingRoom(true);
        setError('');

        // Refresh channels to check if it exists
        const currentChannels = await fetchChannels();
        const channelExists = currentChannels.find(c => c.id === roomCodeInput.trim() || c.name === roomCodeInput.trim());

        if (channelExists) {
            setActiveChannel(channelExists.id);
            setIsInRoom(true);
            setRoomCodeInput('');
        } else {
            setError('Room not found. Please check the code or name.');
        }
        setIsLoadingRoom(false);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        try {
            await fetch(`http://localhost:5000/api/public/community-messages/${activeChannel}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: currentUser.name,
                    role: currentUser.role,
                    avatar: currentUser.avatar,
                    content: messageInput
                }),
            });
            setMessageInput('');
            setShowEmojiPicker(false);
            // Optimistic update
            const response = await fetch(`http://localhost:5000/api/public/community-messages/${activeChannel}`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const addEmoji = (emoji) => {
        setMessageInput(prev => prev + emoji);
    };

    const filteredMessages = messages.filter(msg =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const commonEmojis = ["😀", "😂", "🥰", "😎", "🤔", "👍", "👎", "🎉", "🔥", "🚀", "💀", "💩", "❤️", "🙌", "👀"];

    if (!isInRoom) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800">
                <Navbar />
                <div className="flex-1 flex items-center justify-center p-4 pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8 max-w-md w-full"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Community</h1>
                            <p className="text-neutral-500">Connect, learn, and grow together.</p>
                        </div>

                        {roomAction === 'landing' && (
                            <div className="space-y-4">
                                <Button
                                    onClick={() => setRoomAction('create')}
                                    className="w-full h-14 text-lg bg-primary hover:bg-primary-hover shadow-lg shadow-primary/30 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <MessageSquarePlus className="w-5 h-5" />
                                    Create a New Room
                                </Button>
                                <Button
                                    onClick={() => setRoomAction('join')}
                                    variant="outline"
                                    className="w-full h-14 text-lg border-2 border-dashed border-neutral-300 hover:border-primary hover:text-primary hover:bg-neutral-50 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Join Existing Room
                                </Button>

                                <div className="mt-8 pt-8 border-t border-neutral-100">
                                    <p className="text-xs text-center text-neutral-400 uppercase tracking-widest font-bold mb-4">Available Public Rooms</p>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {channels.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => { setActiveChannel(c.id); setIsInRoom(true); }}
                                                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full text-xs font-medium transition-colors"
                                            >
                                                #{c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {roomAction === 'create' && (
                            <form onSubmit={handleCreateRoom} className="space-y-4">
                                {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 text-center">{error}</div>}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Room Name</label>
                                    <input
                                        type="text"
                                        value={roomNameInput}
                                        onChange={(e) => setRoomNameInput(e.target.value)}
                                        placeholder="e.g. React Developers"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => { setRoomAction('landing'); setError(''); }} className="flex-1">Back</Button>
                                    <Button type="submit" disabled={isLoadingRoom} className="flex-1 bg-primary text-white">
                                        {isLoadingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Room'}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {roomAction === 'join' && (
                            <form onSubmit={handleJoinRoom} className="space-y-4">
                                {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 text-center">{error}</div>}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Room Code or Name</label>
                                    <input
                                        type="text"
                                        value={roomCodeInput}
                                        onChange={(e) => setRoomCodeInput(e.target.value)}
                                        placeholder="Enter room name / code"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        autoFocus
                                    />
                                    <p className="text-xs text-neutral-400 mt-2">Enter the exact name of the room you want to join.</p>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => { setRoomAction('landing'); setError(''); }} className="flex-1">Back</Button>
                                    <Button type="submit" disabled={isLoadingRoom} className="flex-1 bg-primary text-white">
                                        {isLoadingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Room'}
                                    </Button>
                                </div>
                            </form>
                        )}

                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-800 overflow-hidden">
            {/* Navbar - Fixed position handled inside component */}
            <Navbar />

            {/* Main Layout - Full Width with Margin */}
            <div className="flex-1 flex pt-20 w-full px-4 sm:px-6 lg:px-8 gap-4 pb-4 h-screen overflow-hidden">

                {/* Left Sidebar - Channels */}
                <div className={`${mobileMenuOpen ? 'flex absolute inset-0 z-40 bg-white p-4' : 'hidden'} lg:flex w-64 flex-col bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex-shrink-0 mb-4 lg:mb-0 mt-4`}>
                    <div className="p-4 border-b border-neutral-100 bg-primary/5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg text-primary">Channels</h2>
                            <Button size="sm" variant="ghost" onClick={() => setIsInRoom(false)} title="Leave Room">
                                <X className="w-4 h-4 text-neutral-400 hover:text-rose-500" />
                            </Button>
                        </div>
                        <Button
                            onClick={() => { setIsInRoom(false); setRoomAction('create'); }}
                            className="w-full text-xs h-8 bg-white border border-dashed border-neutral-300 text-neutral-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <Plus className="w-3 h-3 mr-1" /> New Channel
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                        {/* Text Channels */}
                        <div>
                            <div className="space-y-1">
                                {loadingChannels ? (
                                    <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
                                ) : (
                                    channels.map(channel => (
                                        <button
                                            key={channel.id}
                                            onClick={() => { setActiveChannel(channel.id); setMobileMenuOpen(false); }}
                                            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 group text-left
                                                ${activeChannel === channel.id
                                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary'
                                                }`}
                                        >
                                            <Hash className={`w-4 h-4 mr-2 ${activeChannel === channel.id ? 'text-white/80' : 'text-neutral-400 group-hover:text-primary'}`} />
                                            <span className="font-medium text-sm truncate">{channel.name}</span>
                                            {channel.unread > 0 && (
                                                <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeChannel === channel.id ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
                                                    {channel.unread}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Chat */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden relative mb-4 lg:mb-0 mt-4">
                    {/* Chat Header */}
                    <div className="h-16 px-6 border-b border-neutral-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <Button size="sm" variant="ghost" className="lg:hidden p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </Button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-neutral-400" />
                                    <h2 className="font-bold text-lg text-neutral-800 capitalize">{activeChannel}</h2>
                                </div>
                                <p className="text-xs text-neutral-500 hidden sm:block">Start of the #{activeChannel} discussion.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search chat..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-1.5 text-sm bg-neutral-50 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 w-32 sm:w-48 transition-all"
                                />
                                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                            <button
                                onClick={() => setShowMembers(!showMembers)}
                                className={`p-2 rounded-full transition-colors ${showMembers ? 'bg-primary/10 text-primary' : 'hover:bg-neutral-50 text-neutral-400'}`}
                            >
                                <Users className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-neutral-50/30">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredMessages.length === 0 && (
                                    <div className="text-center py-10 opacity-60">
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Hash className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold text-neutral-800 mb-2">Welcome to #{activeChannel}!</h3>
                                        <p className="text-neutral-500">This is the start of the #{activeChannel} channel.</p>
                                    </div>
                                )}

                                {filteredMessages.map((msg) => {
                                    const isSelf = msg.user === currentUser.name;
                                    return (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm shadow-sm
                                                ${msg.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' :
                                                    msg.role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-white text-primary border border-neutral-100'}
                                            `}>
                                                {msg.avatar}
                                            </div>
                                            <div className={`flex flex-col max-w-[80%] ${isSelf ? 'items-end' : 'items-start'}`}>
                                                <div className="flex items-baseline gap-2 mb-1 px-1">
                                                    <span className={`text-xs font-bold ${isSelf ? 'text-primary' : 'text-neutral-700'}`}>
                                                        {msg.user}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400">{msg.time}</span>
                                                </div>
                                                <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm leading-relaxed
                                                    ${isSelf
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-white text-neutral-700 border border-neutral-100 rounded-tl-none'}
                                                `}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-neutral-100 relative">
                        {/* Emoji Picker */}
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    ref={emojiPickerRef}
                                    className="absolute bottom-20 left-4 bg-white rounded-xl shadow-xl border border-neutral-100 p-3 w-64 grid grid-cols-5 gap-2 z-20"
                                >
                                    {commonEmojis.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => addEmoji(emoji)}
                                            className="text-2xl hover:bg-neutral-100 p-2 rounded-lg transition-colors"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-neutral-50 px-4 py-2 rounded-full border border-neutral-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-sm">
                            <button type="button" className="p-1.5 text-neutral-400 hover:text-primary transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder={`Message #${activeChannel}`}
                                className="flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none py-2"
                            />
                            <div className="flex items-center gap-2 text-neutral-400">
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`p-1.5 hover:text-primary transition-colors ${showEmojiPicker ? 'text-primary' : ''}`}
                                >
                                    <Smile className="w-5 h-5" />
                                </button>
                                <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary-hover shadow-md text-white flex items-center justify-center p-0" disabled={!messageInput}>
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Sidebar - Members */}
                <AnimatePresence>
                    {showMembers && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="hidden xl:flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden flex-shrink-0 mb-4 lg:mb-0 mt-4"
                        >
                            <div className="p-4 border-b border-neutral-100 bg-neutral-50/50">
                                <h2 className="font-bold text-sm text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Online — {onlineUsers.length}
                                </h2>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
                                {loadingUsers ? (
                                    <div className="text-center py-4 text-xs text-neutral-400">Loading members...</div>
                                ) : (
                                    <>
                                        {['ADMIN', 'INSTRUCTOR', 'LEARNER'].map((role) => {
                                            const roleUsers = onlineUsers.filter(u => u.role === role);
                                            if (roleUsers.length === 0) return null;

                                            return (
                                                <div key={role}>
                                                    <h3 className="text-xs font-bold text-neutral-400 uppercase mb-3 px-2">
                                                        {role === 'ADMIN' ? 'Site Admins' : role === 'INSTRUCTOR' ? 'Instructors' : 'Learners'}
                                                    </h3>
                                                    <div className="space-y-1">
                                                        {roleUsers.map(user => (
                                                            <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 cursor-pointer group transition-colors">
                                                                <div className="relative">
                                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white
                                                                        ${role === 'ADMIN' ? 'bg-rose-100 text-rose-600' :
                                                                            role === 'INSTRUCTOR' ? 'bg-blue-100 text-blue-600' :
                                                                                'bg-primary/10 text-primary'}
                                                                    `}>
                                                                        {user.name[0]}
                                                                    </div>
                                                                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
                                                                        ${user.status === 'online' ? 'bg-green-500' :
                                                                            user.status === 'idle' ? 'bg-amber-400' : 'bg-rose-500'}
                                                                    `} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-sm font-medium text-neutral-700 truncate group-hover:text-primary transition-colors">
                                                                        {user.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-neutral-400 truncate capitalize">
                                                                        {user.status === 'dnd' ? 'Do not disturb' : user.status}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CommunityPage;
