'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, MoreVertical } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChatDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    developer: any; // The developer we are chatting with
}

interface Message {
    _id?: string;
    senderId: string;
    recipientId: string;
    message: string;
    senderRole: 'ADMIN' | 'DEVELOPER' | 'USER';
    timestamp: string;
}

// Initialize socket outside component to prevent multiple connections
let socket: Socket;

export default function ChatDrawer({ isOpen, onClose, developer }: ChatDrawerProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }

        // Initialize socket connection
        if (!socket) {
            // Using a rewrite to valid backend URL or direct URL
            // Since we have proxy, we can try to connect to root or specific URL
            // If proxy handles ws properly, fine. If not, might need full URL http://localhost:5000
            // But admin and backend are on different ports.
            socket = io('http://localhost:5000', {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });
        }

        const onConnect = () => {
            console.log('Socket connected');
            // Join admin room
            socket.emit('join_chat', { userId: 'ADMIN', role: 'ADMIN' });
        };

        const onReceiveMessage = (msg: Message) => {
            // Only add message if it belongs to current chat context
            if (
                (msg.senderId === developer?._id) ||
                (msg.recipientId === developer?._id && msg.senderId === 'ADMIN')
            ) {
                setMessages((prev) => [...prev, msg]);
                scrollToBottom();
            }
        };

        socket.on('connect', onConnect);
        socket.on('receive_message', onReceiveMessage);

        // If already connected, ensure we join room
        if (socket.connected) {
            socket.emit('join_chat', { userId: 'ADMIN', role: 'ADMIN' });
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('receive_message', onReceiveMessage);
        };
    }, [developer]); // Re-run when developer changes is acceptable, but socket should persist

    // Fetch history when drawer opens for a specific developer
    useEffect(() => {
        if (isOpen && developer) {
            fetchHistory();
        }
    }, [isOpen, developer]);

    const fetchHistory = async () => {
        if (!developer) return;
        const token = localStorage.getItem('accessToken');
        try {
            const res = await fetch(`/api/chat/history/${developer._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
        } catch (error) {
            console.error('Failed to fetch chat history', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !developer) return;

        const msgData = {
            senderId: 'ADMIN', // Or user._id if we want specific admin ID
            recipientId: developer._id,
            message: newMessage,
            senderRole: 'ADMIN'
        };

        socket.emit('send_message', msgData);
        setNewMessage('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                        {developer?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{developer?.email}</h3>
                        <p className="text-xs text-slate-400">Developer Support</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 py-10 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'ADMIN';
                    return (
                        <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${isAdmin
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                    }`}
                            >
                                <p>{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${isAdmin ? 'text-indigo-200' : 'text-slate-500'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
