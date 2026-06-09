import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const LiveClassRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const jitsiContainerRef = useRef(null);

    useEffect(() => {
        // Load Jitsi script
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => fetchSession();
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const fetchSession = async () => {
        try {
            const token = localStorage.getItem('token');
            // 1. Join session (log attendance)
            const joinRes = await fetch(`/api/live-classes/${id}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!joinRes.ok) throw new Error('Failed to join');

            // 2. Get details
            const res = await fetch(`/api/live-classes/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setSession(data);
            initJitsi(data);
        } catch (error) {
            console.error(error);
            alert('Failed to load session');
            navigate('/live-classes');
        } finally {
            setLoading(false);
        }
    };

    const initJitsi = (data) => {
        if (!window.JitsiMeetExternalAPI) return;

        const domain = 'meet.jit.si';
        const options = {
            roomName: data.meeting_url || `OdooLive_${id}`,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainerRef.current,
            userInfo: {
                displayName: 'Learner' // Should fetch user name
            },
            configOverwrite: {
                startWithAudioMuted: true,
                startWithVideoMuted: true
            },
            interfaceConfigOverwrite: {
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                    'tileview', 'select-background', 'download', 'help', 'mute-everyone',
                    'security'
                ],
            },
        };

        const api = new window.JitsiMeetExternalAPI(domain, options);

        api.addEventListeners({
            videoConferenceLeft: () => {
                navigate('/live-classes');
            }
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Connecting to secure room...</div>;

    return (
        <div className="h-screen w-screen bg-black flex flex-col">
            <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/live-classes')}>
                        ← Back
                    </Button>
                    <h1 className="font-bold text-white max-w-md truncate">{session?.title}</h1>
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-500 animate-pulse">● LIVE</span>
                </div>
            </div>
            <div ref={jitsiContainerRef} className="flex-1 w-full bg-neutral-900" />
        </div>
    );
};

export default LiveClassRoom;
