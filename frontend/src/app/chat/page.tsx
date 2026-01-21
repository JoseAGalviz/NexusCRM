"use client";
import React, { useEffect, useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { io, Socket } from 'socket.io-client';
import API_URL from '@/config/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
}

interface Message {
    id: string;
    content: string;
    sender: User;
    receiver: User;
    channelId: string;
    channel: { id: string }; // Add channel object structure
    createdAt: string;
    editedAt?: string;
    isDeleted?: boolean;
    deletedFor?: string[];
    replyTo?: Message;
    readAt?: string | Date; // Add readStatus
}

export default function Chat() {
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
    const [activeChannelName, setActiveChannelName] = useState<string | null>(null); // To store channel name
    const [isChannelGlobal, setIsChannelGlobal] = useState(false); // To distinguish from DM
    const activeChannelIdRef = useRef<string | null>(null);

    useEffect(() => {
        activeChannelIdRef.current = activeChannelId;
    }, [activeChannelId]);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState<Socket | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const emojis = [
        { category: 'Caras', icons: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '☺️', '🙂', '🤗', '🤩'] },
        { category: 'Gestos', icons: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '🖐️', '✋', '🖖', '👋', '✍️', '👏', '🙌', '👐', '🙏', '🤝', '👂', '👀', '🧠'] },
        { category: 'Corazones', icons: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💢', '💥'] }
    ];

    const [users, setUsers] = useState<User[]>([]);
    const [channels, setChannels] = useState<any[]>([]); // New channels state
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const notificationAudio = useRef<HTMLAudioElement | null>(null);
    const [notifications, setNotifications] = useState<Record<string, { count: number, lastMessage: string }>>({});
    const [toast, setToast] = useState<{ visible: boolean, message: string, senderName: string } | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));

        fetch(`${API_URL}/chat/channels`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setChannels(data);
                // If restore logic doesn't trigger, maybe we want to select General by default?
                // But let the user decide.
            })
            .catch(err => console.error("Error loading channels", err));

        fetch(`${API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => res.json())
            .then(data => {
                setUsers(data);

                // Restore last active chat if exists
                const savedChat = localStorage.getItem('activeChat');
                if (savedChat && storedUser) {
                    try {
                        const { userId, channelId, user, isChannel, name } = JSON.parse(savedChat);
                        const currentUserId = JSON.parse(storedUser).id;

                        if (isChannel) {
                            setActiveChannelId(channelId);
                            setActiveChannelName(name);
                            setIsChannelGlobal(true);
                        } else if (data.some((u: User) => u.id === userId)) {
                            // Verify user still exists
                            // Re-fetch the channel to ensure proper member validation
                            fetch(`${API_URL}/chat/direct`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({
                                    targetUserId: userId,
                                    currentUserId: currentUserId
                                })
                            })
                                .then(res => res.json())
                                .then((channel: { id: string; name: string }) => {
                                    setActiveUser(user);
                                    setActiveChannelId(channel.id);
                                    setActiveChannelName(null);
                                    setIsChannelGlobal(false);
                                })
                                .catch(err => {
                                    console.error("Error restoring chat", err);
                                    localStorage.removeItem('activeChat');
                                });
                        } else {
                            // User no longer exists, clear saved chat
                            localStorage.removeItem('activeChat');
                        }
                    } catch (e) {
                        console.error("Error restoring chat", e);
                        localStorage.removeItem('activeChat');
                    }
                }
            })
            .catch(err => console.error("Error loading users", err));

        const newSocket = io(API_URL, {
            transports: ['websocket', 'polling'],
            query: { userId: JSON.parse(storedUser || '{}').id }
        });
        setSocket(newSocket);

        // Initialize Notification Audio Ref
        notificationAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

        // Request Notification Permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        newSocket.on('connect', () => {
            console.log('Connected to socket');
        });

        newSocket.on('newMessage', (message: Message) => {
            // Check if this message belongs to the currently active channel via ref
            if (activeChannelIdRef.current === message.channelId || activeChannelIdRef.current === message.channel?.id) {
                setMessages(prev => {
                    if (prev.some(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });

                // If it's the active chat, we don't notify via toast/sound here implicitly because logic below handles 'notification' event.
                // However, we might want to ensure 'markAsRead' is fired. 
                // But let's rely on the specific channel useEffect for that to be cleaner.
            }
        });

        newSocket.on('notification', (payload: { senderId: string, senderName: string, content: string, channelId: string }) => {
            console.log("Notification received:", payload);

            // Check if we are already chatting with this user using the REF
            const isActiveChat = activeChannelIdRef.current === payload.channelId;

            if (isActiveChat) {
                // We are in the chat, so suppress notification count increment
                return;
            }

            notificationAudio.current?.play().catch(e => console.error("Audio play failed", e));

            if (Notification.permission === 'granted') {
                new Notification(`Mensaje de ${payload.senderName}`, {
                    body: payload.content
                });
            }

            setToast({ visible: true, message: payload.content, senderName: payload.senderName });
            setTimeout(() => setToast(null), 5000);

            setNotifications(prev => ({
                ...prev,
                [payload.senderId]: {
                    count: (prev[payload.senderId]?.count || 0) + 1,
                    lastMessage: payload.content
                }
            }));
        });

        newSocket.on('onlineUsers', (userIds: string[]) => {
            setOnlineUsers(userIds);
        });

        return () => { newSocket.disconnect(); };
    }, []);

    useEffect(() => {
        if (!socket || !currentUser || !activeChannelId) return;

        socket.emit('joinChannel', activeChannelId);

        // Save active chat to localStorage
        if (isChannelGlobal) {
            localStorage.setItem('activeChat', JSON.stringify({
                channelId: activeChannelId,
                name: activeChannelName,
                isChannel: true
            }));
        } else if (activeUser) {
            localStorage.setItem('activeChat', JSON.stringify({
                userId: activeUser.id,
                channelId: activeChannelId,
                user: activeUser,
                isChannel: false
            }));
        }

        // Clear notifications if it matches active chat
        if (activeUser) {
            setNotifications(prev => {
                const updated = { ...prev };
                delete updated[activeUser.id];
                return updated;
            });
        }

        // Mark messages as read when joining
        if (socket && activeChannelId && currentUser) {
            socket.emit('markAsRead', { channelId: activeChannelId, userId: currentUser.id });
        }

        fetch(`${API_URL}/chat/channels/${activeChannelId}/messages`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(res => {
                if (!res.ok) {
                    console.warn("Failed to load messages for channel", activeChannelId, res.status);
                    if (res.status === 403) {
                        // Access denied - clear saved chat and reset state
                        console.error("Access denied to channel - clearing saved chat");
                        localStorage.removeItem('activeChat');
                        setActiveUser(null);
                        setActiveChannelId(null);
                        setMessages([]);
                    }
                    return [];
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Received non-array messages:", data);
                    setMessages([]);
                }
            })
            .catch(err => {
                console.error("Error loading messages", err);
                setMessages([]);
            });

        const handleNewMessage = (msg: Message) => {
            setMessages(prev => {
                if (prev.some(m => m.id === msg.id)) return prev;
                // Play sound if message is not from me
                if (currentUser && msg.sender.id !== currentUser.id) {
                    notificationAudio.current?.play().catch(e => console.log("Audio play failed", e));

                    // If I am in this channel, mark as read immediately
                    if (activeChannelId === msg.channel.id) { // This check is redundant due to useEffect dep but safe
                        socket.emit('markAsRead', { channelId: activeChannelId, userId: currentUser.id });
                    }
                }
                return [...prev, msg];
            });
        };

        const handleMessageEdited = (editedMsg: Message) => {
            setMessages(prev => prev.map(m => m.id === editedMsg.id ? editedMsg : m));
        };

        const handleMessageDeleted = (data: { messageId: string; deleteForAll: boolean; userId: string }) => {
            if (data.deleteForAll) {
                setMessages(prev => prev.map(m => m.id === data.messageId ? { ...m, isDeleted: true } : m));
            } else {
                setMessages(prev => prev.map(m => {
                    if (m.id === data.messageId) {
                        const deletedFor = m.deletedFor || [];
                        if (!deletedFor.includes(data.userId)) {
                            deletedFor.push(data.userId);
                        }
                        return { ...m, deletedFor };
                    }
                    return m;
                }));
            }
        };

        const handleMessagesRead = (data: { channelId: string; readByUserId: string; readAt: string }) => {
            if (data.channelId === activeChannelId) {
                setMessages(prev => prev.map(m => {
                    // Update messages sent by ME that are now read by the OTHER person
                    if (m.sender.id === currentUser.id && !m.readAt) {
                        return { ...m, readAt: new Date(data.readAt) };
                    }
                    return m;
                }));
            }
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('messageEdited', handleMessageEdited);
        socket.on('messageDeleted', handleMessageDeleted);
        socket.on('messagesRead', handleMessagesRead);

        socket.on('exception', (error: any) => {
            if (error?.message === 'User or Channel not found') {
                alert('Sesión no válida. Recarga la página.');
            }
        });

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('messageEdited', handleMessageEdited);
            socket.off('messageDeleted', handleMessageDeleted);
            socket.off('messagesRead', handleMessagesRead);
            socket.off('exception');
        };
    }, [socket, activeUser, activeChannelId, currentUser, isChannelGlobal, activeChannelName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !socket || !activeChannelId || !currentUser) {
            console.warn('[sendMessage] Cannot send - missing requirements:', {
                hasInput: !!input.trim(),
                hasSocket: !!socket,
                hasChannelId: !!activeChannelId,
                hasCurrentUser: !!currentUser
            });
            return;
        }

        console.log('[sendMessage] Sending message:', {
            channelId: activeChannelId,
            userId: currentUser.id,
            content: input.substring(0, 50) + (input.length > 50 ? '...' : '')
        });

        socket.emit('sendMessage', {
            channelId: activeChannelId,
            userId: currentUser.id,
            content: input,
            replyToId: replyingTo?.id
        });

        setInput('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
    };

    const addEmoji = (emoji: string) => {
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeCursor = input.substring(0, cursorPosition);
        const textAfterCursor = input.substring(cursorPosition);

        setInput(textBeforeCursor + emoji + textAfterCursor);

        // Return focus to input and set cursor position after the emoji
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPosition = cursorPosition + emoji.length;
                inputRef.current.setSelectionRange(newPosition, newPosition);
            }
        }, 10);
    };

    const startEdit = (msg: Message) => {
        setEditingMessageId(msg.id);
        setEditContent(msg.content);
        setMenuOpen(null);
    };

    const saveEdit = (messageId: string) => {
        if (!socket || !activeChannelId || !currentUser || !editContent.trim()) return;

        socket.emit('editMessage', {
            messageId,
            userId: currentUser.id,
            newContent: editContent,
            channelId: activeChannelId
        });

        setEditingMessageId(null);
        setEditContent('');
    };

    const deleteMessage = (messageId: string, deleteForAll: boolean) => {
        if (!socket || !activeChannelId || !currentUser) return;

        socket.emit('deleteMessage', {
            messageId,
            userId: currentUser.id,
            channelId: activeChannelId,
            deleteForAll
        });

        setMenuOpen(null);
    };

    const isMessageDeletedForUser = (msg: Message) => {
        if (msg.isDeleted) return true;
        if (msg.deletedFor && currentUser && msg.deletedFor.includes(currentUser.id)) return true;
        return false;
    };

    const handleUserClick = (targetUser: User) => {
        if (!currentUser) return;

        // Clear any old saved chat to prevent stale channel IDs
        localStorage.removeItem('activeChat');

        fetch(`${API_URL}/chat/direct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                targetUserId: targetUser.id,
                currentUserId: currentUser.id
            })
        })
            .then(res => res.json())
            .then((channel: { id: string; name: string }) => {
                setActiveUser(targetUser);
                setActiveChannelId(channel.id);
                setActiveChannelName(null);
                setIsChannelGlobal(false);
            })
            .catch(err => console.error("Error creating direct chat", err));
    };

    const handleChannelClick = (channel: any) => {
        setActiveUser(null);
        setActiveChannelId(channel.id);
        setActiveChannelName(channel.name);
        setIsChannelGlobal(true);
    };



    return (
        <MainLayout>
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
                    backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                    padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    animation: 'slideIn 0.3s ease-out'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>chat</span>
                        <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{toast.senderName}</span>
                    </div>
                    <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{toast.message}</span>
                </div>
            )}
            <div style={{ display: 'flex', height: 'calc(100vh - 140px)', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                {/* Sidebar */}
                <div className="hidden md:flex" style={{ width: '300px', borderRight: '1px solid #334155', flexDirection: 'column', backgroundColor: '#0f172a' }}>
                    <div style={{ flex: 1, overflowY: 'auto' }}>

                        <div style={{ padding: '16px', paddingBottom: '8px' }}>
                            <h3 style={{ fontWeight: '600', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Canales</h3>
                        </div>
                        <div style={{ padding: '0 8px', marginBottom: '16px' }}>
                            {channels.map(channel => {
                                const isActive = activeChannelId === channel.id && isChannelGlobal;
                                return (
                                    <button
                                        key={channel.id}
                                        onClick={() => handleChannelClick(channel)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: isActive ? '#1e40af' : 'transparent',
                                            color: '#cbd5e1',
                                            border: 'none',
                                            cursor: 'pointer',
                                            marginBottom: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                        }}
                                    >
                                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: isActive ? '#2563eb' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff' }}>
                                            #
                                        </div>
                                        <span style={{ fontWeight: '600', flex: 1 }}>{channel.name}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ padding: '16px', paddingBottom: '8px' }}>
                            <h3 style={{ fontWeight: '600', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mensajes Directos</h3>
                        </div>
                        <div style={{ padding: '0 8px' }}>
                            {users.filter(u => u.id !== currentUser?.id).map(user => {
                                const notification = notifications[user.id];
                                const isActive = activeUser?.id === user.id;
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => handleUserClick(user)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: isActive ? '#1e40af' : 'transparent',
                                            color: '#cbd5e1',
                                            border: 'none',
                                            cursor: 'pointer',
                                            marginBottom: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ position: 'relative', flexShrink: 0 }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isActive ? '#2563eb' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            {onlineUsers.includes(user.id) && (
                                                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid #0f172a' }}></div>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                <span style={{ fontWeight: '600', fontSize: '14px', color: isActive ? '#f1f5f9' : '#f1f5f9' }}>
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                {notification && notification.count > 0 && (
                                                    <div style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '12px', padding: '2px 6px', fontSize: '11px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                                                        {notification.count}
                                                    </div>
                                                )}
                                            </div>
                                            {notification && notification.lastMessage && (
                                                <div style={{ fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {notification.lastMessage}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Current User Profile */}
                    {currentUser && (
                        <div style={{ padding: '16px', borderTop: '1px solid #334155', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                {currentUser.firstName[0]}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px' }}>{currentUser.firstName} {currentUser.lastName}</span>
                                <span style={{ color: '#64748b', fontSize: '12px' }}>En línea</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: '#0f172a' }}>
                    <div style={{ height: '56px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: '#1e293b' }}>
                        <span style={{ fontWeight: '700', color: '#f1f5f9' }}>
                            {isChannelGlobal ? `# ${activeChannelName}` : (activeUser ? `${activeUser.firstName} ${activeUser.lastName}` : 'Selecciona un chat')}
                        </span>
                        <button
                            onClick={() => {
                                if (confirm('¿Estás seguro de que quieres borrar todo el historial de este chat? Esta acción no se puede deshacer.')) {
                                    if (!activeChannelId) return;
                                    fetch(`${API_URL}/chat/channels/${activeChannelId}/messages`, {
                                        method: 'DELETE',
                                        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                    })
                                        .then(res => {
                                            if (res.ok) {
                                                setMessages([]);
                                                // Ideally we should also notify other user via socket if we could.
                                                // The backend deletion is done, so next fetch is empty.
                                            }
                                        })
                                        .catch(err => console.error("Error clearing chat", err));
                                }
                            }}
                            title="Limpiar chat"
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <span className="material-symbols-outlined">delete_sweep</span>
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {messages.filter(msg => !isMessageDeletedForUser(msg)).map((msg, index) => {
                            const isMe = msg.sender.id === currentUser?.id;
                            const isEditing = editingMessageId === msg.id;
                            const prevMsg = index > 0 ? messages[index - 1] : null;
                            const isSameSender = prevMsg && prevMsg.sender.id === msg.sender.id && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() < 60000);

                            return (
                                <div key={msg.id} style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: isMe ? 'flex-end' : 'flex-start',
                                    marginTop: isSameSender ? '0' : '12px',
                                    padding: '2px 0'
                                }} className="group">
                                    {!isSameSender && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '2px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'center' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{isMe ? 'Tú' : `${msg.sender.firstName} ${msg.sender.lastName}`}</span>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px', maxWidth: '85%', flexDirection: isMe ? 'row-reverse' : 'row' }}>
                                        <div style={{ width: '32px', flexShrink: 0 }}>
                                            {!isSameSender && (
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isMe ? '#2563eb' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: '700' }}>
                                                    {msg.sender.firstName?.[0]}{msg.sender.lastName?.[0]}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', minWidth: 0 }}>
                                            {msg.replyTo && (
                                                <div style={{
                                                    marginBottom: '-4px', padding: '4px 10px 8px 10px', backgroundColor: '#1e293b',
                                                    borderRadius: '8px 8px 0 0', fontSize: '11px', border: '1px solid #334155', borderBottom: 'none', color: '#94a3b8'
                                                }}>
                                                    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{msg.replyTo.sender.firstName}:</span> {msg.replyTo.content}
                                                </div>
                                            )}
                                            <div style={{
                                                padding: '8px 14px', borderRadius: '12px', fontSize: '14px',
                                                backgroundColor: isMe ? '#3b82f6' : '#1e293b', color: '#fff',
                                                border: '1px solid #334155', wordBreak: 'break-word', whiteSpace: 'pre-wrap',
                                                borderTopRightRadius: isMe && !msg.replyTo ? '2px' : '12px',
                                                borderTopLeftRadius: !isMe && !msg.replyTo ? '2px' : '12px'
                                            }}>
                                                {isEditing ? (
                                                    <div style={{ minWidth: '200px' }}>
                                                        <textarea
                                                            value={editContent} onChange={e => setEditContent(e.target.value)}
                                                            autoFocus style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', color: '#fff', border: '1px solid #475569', borderRadius: '4px', resize: 'none', outline: 'none' }}
                                                            rows={2}
                                                        />
                                                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => setEditingMessageId(null)} style={{ fontSize: '10px', padding: '2px 8px', background: '#475569', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>Cancelar</button>
                                                            <button onClick={() => saveEdit(msg.id)} style={{ fontSize: '10px', padding: '2px 8px', background: '#10b981', border: 'none', color: '#fff', borderRadius: '3px', cursor: 'pointer' }}>Guardar</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                            <span style={{ marginRight: '8px' }}>{msg.content}
                                                                {msg.editedAt && <span style={{ fontSize: '10px', opacity: 0.5, marginLeft: '6px' }}>(editado)</span>}
                                                            </span>
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '2px',
                                                                fontSize: '10px',
                                                                color: 'rgba(255,255,255,0.7)',
                                                                marginTop: '2px',
                                                                userSelect: 'none'
                                                            }}>
                                                                <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {isMe && (
                                                                    <span className="material-symbols-outlined" style={{
                                                                        fontSize: '14px',
                                                                        color: msg.readAt ? '#93c5fd' : 'rgba(255,255,255,0.7)', // Blue active, gray pending
                                                                        marginLeft: '2px'
                                                                    }}>
                                                                        {msg.readAt ? 'done_all' : 'check'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Buttons - NO EMOJIS, MATERIAL SYMBOLS */}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '2px', opacity: 0.8 }} className="message-actions">
                                                <button
                                                    onClick={() => setReplyingTo(msg)}
                                                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                    title="Responder"
                                                >
                                                    <span className="material-symbols-outlined !text-[16px]">reply</span>
                                                </button>
                                                {isMe && !isEditing && (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(msg)}
                                                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined !text-[16px]">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setMenuOpen(menuOpen === msg.id ? null : msg.id)}
                                                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                                                            title="Eliminar"
                                                        >
                                                            <span className="material-symbols-outlined !text-[16px]">delete</span>
                                                        </button>
                                                    </>
                                                )}

                                                {menuOpen === msg.id && (
                                                    <div style={{ position: 'relative' }}>
                                                        <div onClick={() => setMenuOpen(null)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
                                                        <div style={{ position: 'absolute', bottom: '24px', right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)', width: '150px', zIndex: 101, overflow: 'hidden' }}>
                                                            <button onClick={() => deleteMessage(msg.id, false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', color: '#f1f5f9', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', cursor: 'pointer' }}>
                                                                <span className="material-symbols-outlined !text-[18px]">person_remove</span>
                                                                Para mí
                                                            </button>
                                                            <button onClick={() => deleteMessage(msg.id, true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', color: '#f87171', background: 'none', border: 'none', textAlign: 'left', fontSize: '12px', cursor: 'pointer' }}>
                                                                <span className="material-symbols-outlined !text-[18px]">delete_forever</span>
                                                                Para todos
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '16px', backgroundColor: '#0f172a', borderTop: '1px solid #334155' }}>
                        {replyingTo && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e3a8a', padding: '6px 12px', borderRadius: '8px 8px 0 0', borderBottom: '1px solid #1d4ed8' }}>
                                <span style={{ fontSize: '11px', color: '#93c5fd' }}>Respondiendo a <strong>{replyingTo.sender.firstName}</strong></span>
                                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}>
                                    <span className="material-symbols-outlined !text-[16px]">close</span>
                                </button>
                            </div>
                        )}
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                            <div style={{ position: 'relative' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    style={{
                                        padding: '0 12px',
                                        height: '100%',
                                        backgroundColor: '#1e293b',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: showEmojiPicker ? '#fbbf24' : '#94a3b8',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                                </button>

                                {showEmojiPicker && (
                                    <>
                                        <div
                                            onClick={() => setShowEmojiPicker(false)}
                                            style={{ position: 'fixed', inset: 0, zIndex: 50 }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: 'calc(100% + 12px)',
                                            left: 0,
                                            width: '280px',
                                            backgroundColor: '#1e293b',
                                            border: '1px solid #334155',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                            zIndex: 51,
                                            overflow: 'hidden',
                                            animation: 'slideUp 0.2s ease-out'
                                        }}>
                                            <div style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                                                {emojis.map((group) => (
                                                    <div key={group.category} style={{ marginBottom: '12px' }}>
                                                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                            {group.category}
                                                        </div>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                                                            {group.icons.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    type="button"
                                                                    onClick={() => addEmoji(emoji)}
                                                                    style={{
                                                                        padding: '4px',
                                                                        fontSize: '20px',
                                                                        background: 'none',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        borderRadius: '4px',
                                                                        transition: 'background 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#334155')}
                                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <input
                                ref={inputRef}
                                value={input} onChange={e => setInput(e.target.value)}
                                placeholder={activeUser ? `Mensaje a ${activeUser.firstName}...` : 'Selecciona un usuario...'}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: replyingTo ? '0 0 8px 8px' : '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f1f5f9', outline: 'none', fontSize: '14px' }}
                            />
                            <button
                                type="submit" disabled={!input.trim()}
                                style={{ padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: input.trim() ? '#2563eb' : '#334155', color: 'white', fontWeight: '600', cursor: input.trim() ? 'pointer' : 'default' }}
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .message-actions { opacity: 0; transition: opacity 0.2s; }
                .group:hover .message-actions { opacity: 1 !important; }
                @media (max-width: 768px) {
                    .message-actions { opacity: 0.8 !important; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </MainLayout>
    );
}
