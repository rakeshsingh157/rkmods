'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Search, MessageSquare, Clock, User, ChevronRight } from 'lucide-react';
import ChatDrawer from '../../../components/ChatDrawer';

interface Conversation {
    _id: string;
    email: string;
    lastMessage: string;
    timestamp: string;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDev, setSelectedDev] = useState<any>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        fetchConversations();
        // Poll for new messages every 30 seconds
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch('/api/chat/conversations', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = (conv: Conversation) => {
        setSelectedDev(conv);
        setIsChatOpen(true);
    };

    const filteredConversations = conversations.filter(conv =>
        conv.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar />

            <ChatDrawer
                isOpen={isChatOpen}
                onClose={() => {
                    setIsChatOpen(false);
                    fetchConversations(); // Refresh list to update last message
                }}
                developer={selectedDev}
            />

            <main className="ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Support Inbox</h1>
                        <p className="text-slate-400 mt-1">Manage all developer communications</p>
                    </div>
                </header>

                {/* Search */}
                <div className="mb-6 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-white transition-colors"
                    />
                </div>

                {/* Conversation List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center animate-pulse">
                            <p className="text-slate-500">Loading conversations...</p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-500 font-medium">No active conversations found.</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => handleOpenChat(conv)}
                                className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all cursor-pointer flex items-center gap-5 shadow-lg hover:shadow-indigo-500/5"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg group-hover:scale-105 transition-transform">
                                    {conv.email[0].toUpperCase()}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm">
                                            {conv.email}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                                            <Clock className="w-3 h-3" />
                                            {new Date(conv.timestamp).toLocaleDateString()} {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm truncate font-medium max-w-[500px]">
                                        {conv.lastMessage || 'Sent an attachment or empty message'}
                                    </p>
                                </div>

                                <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
