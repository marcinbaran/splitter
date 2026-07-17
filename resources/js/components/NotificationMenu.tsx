import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Bell, Check, Loader2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    route: string;
    route_params?: Record<string, never>;
    read: boolean;
    created_at: string;
}

const NotificationMenu: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Zamykanie dropdownu po kliknięciu poza nim
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const response = await axios.post(`/notifications/${id}/read`);
            setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(notifications.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getNotificationUrl = (notification: Notification) => {
        if (notification.route_params) {
            return route(notification.route, notification.route_params);
        }
        return route(notification.route);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className={`relative rounded-xl border p-2.5 transition-all duration-200 ${
                    isOpen ? 'border-zinc-700 bg-zinc-800 text-white' : 'hover:bg-zinc-850/60 border-zinc-800/30 text-zinc-400 hover:text-white'
                }`}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full bg-[#ED1C24] px-1 text-[10px] font-black text-white ring-4 ring-[#121214]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] shadow-2xl duration-150">
                    <div className="flex items-center justify-between border-b border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
                        <span className="text-xs font-black tracking-wider text-white uppercase">Powiadomienia</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-[10px] font-bold text-[#ED1C24] uppercase transition-colors hover:text-red-400"
                            >
                                <Check className="h-3 w-3" />
                                Odczytaj wszystkie
                            </button>
                        )}
                    </div>

                    <div className="custom-scrollbar max-h-[320px] divide-y divide-zinc-800/40 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-2 p-8 text-zinc-500">
                                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                                <span className="text-[10px] font-bold tracking-wider uppercase">Ładowanie...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <p className="text-xs font-medium">Brak nowych powiadomień</p>
                                <span className="text-zinc-650 mt-1 block text-[10px] font-bold tracking-widest uppercase">Wszystko czyste!</span>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={getNotificationUrl(notification)}
                                    onClick={() => {
                                        if (!notification.read) markAsRead(notification.id);
                                        setIsOpen(false);
                                    }}
                                    preserveScroll
                                    className={`hover:bg-zinc-850/30 relative block border-l-2 p-4 transition-all duration-150 ${
                                        notification.read ? 'border-transparent bg-transparent' : 'border-[#ED1C24] bg-red-500/[0.02]'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className={`text-xs font-bold ${notification.read ? 'text-zinc-300' : 'text-white'}`}>
                                                {notification.title}
                                            </span>
                                            {!notification.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ED1C24]" />}
                                        </div>
                                        <p className="text-xs leading-relaxed font-medium text-zinc-400">{notification.message}</p>
                                        <span className="mt-1.5 text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                                            {notification.created_at}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationMenu;
