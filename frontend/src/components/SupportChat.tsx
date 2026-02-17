'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageSquare, X, Send, User, Headset, Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/api';

interface Message {
    senderId: string;
    recipientId: string;
    message: string;
    senderRole: string;
    timestamp: string;
}

export default function SupportChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const socketRef = useRef<Socket | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    useEffect(() => {
        if (isOpen && user && !socketRef.current) {
            fetchHistory();
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [isOpen, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const initSocket = () => {
        const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('Connected to chat server');
            socket.emit('join_chat', { userId: user.id, role: 'DEVELOPER' });
        });

        socket.on('receive_message', (msg: Message) => {
            setMessages(prev => {
                // Prevent duplicates if emitting back to sender
                const exists = prev.some(m => m.timestamp === msg.timestamp && m.message === msg.message);
                if (exists) return prev;
                return [...prev, msg];
            });
        });

        socketRef.current = socket;
    };

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${user.id}`);
            const data = await res.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !socketRef.current || !user) return;

        const msgData = {
            senderId: user.id,
            recipientId: 'ADMIN',
            message: message.trim(),
            senderRole: 'DEVELOPER',
            timestamp: new Date().toISOString()
        };

        socketRef.current.emit('send_message', msgData);
        setMessage('');
    };

    if (!user) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            {/* Chat Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-cyan-500/20 hover:scale-110 transition-transform active:scale-95 group relative"
                >
                    <MessageSquare className="w-8 h-8 text-white" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0f1e] hidden animate-ping"></span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[380px] h-[550px] bg-[#131b2e] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                    {/* Header */}
                    <div className="p-5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                <Headset className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Developer Support</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Admin Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="text-gray-400 text-sm font-medium">Hello! 👋 How can we help you today?</p>
                            </div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.senderId === user.id;
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-${isMe ? 'right' : 'left'}-2 duration-300`}>
                                        <div className={`max-w-[80%] rounded-2xl p-3.5 text-sm ${isMe
                                                ? 'bg-cyan-600 text-white rounded-tr-none'
                                                : 'bg-white/5 text-gray-200 border border-white/5 rounded-tl-none'
                                            }`}>
                                            <p className="leading-relaxed">{msg.message}</p>
                                            <span className={`text-[9px] mt-1.5 block opacity-50 ${isMe ? 'text-right' : 'text-left'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0d1425]">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Write a message..."
                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-all font-medium"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim()}
                                className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-white disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-cyan-500/20 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
