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
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
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
                aria-label="Powiadomienia"
                aria-expanded={isOpen}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className={`relative rounded-xl border p-2.5 transition-all duration-200 ${
                    isOpen ? 'border-slate-700 bg-slate-800 text-white' : 'hover:bg-slate-850/60 border-slate-800/30 text-slate-400 hover:text-white'
                }`}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] animate-pulse items-center justify-center rounded-full bg-[#2dd4bf] px-1 text-xs font-semibold text-slate-950 ring-4 ring-[#111a25]">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="animate-in fade-in slide-in-from-top-2 fixed inset-x-4 top-20 z-50 mt-3 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#111a25] shadow-2xl duration-150 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:w-96">
                    <div className="flex items-center justify-between border-b border-slate-800/60 bg-slate-900/40 px-4 py-3">
                        <span className="text-sm font-semibold tracking-normal text-white">Powiadomienia</span>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs font-bold text-[#2dd4bf] transition-colors hover:text-red-400"
                            >
                                <Check className="h-3 w-3" />
                                Odczytaj wszystkie
                            </button>
                        )}
                    </div>

                    <div className="custom-scrollbar max-h-[320px] divide-y divide-slate-800/40 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center gap-2 p-8 text-slate-500">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                <span className="text-xs font-bold tracking-normal">Ładowanie...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p className="text-sm font-medium">Brak nowych powiadomień</p>
                                <span className="text-slate-650 mt-1 block text-xs font-bold tracking-normal">Wszystko czyste!</span>
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
                                    className={`hover:bg-slate-850/30 relative block border-l-2 p-4 transition-all duration-150 ${
                                        notification.read ? 'border-transparent bg-transparent' : 'border-[#2dd4bf] bg-red-500/[0.02]'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className={`text-sm font-bold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                                                {notification.title}
                                            </span>
                                            {!notification.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#2dd4bf]" />}
                                        </div>
                                        <p className="text-sm leading-relaxed font-medium text-slate-400">{notification.message}</p>
                                        <span className="mt-1.5 text-[9px] font-bold tracking-normal text-slate-500">{notification.created_at}</span>
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
