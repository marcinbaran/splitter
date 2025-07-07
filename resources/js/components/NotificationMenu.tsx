import { Badge, Dropdown, MenuProps } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

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

    useEffect(() => {
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 5000);

        return () => clearInterval(intervalId);
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
            setNotifications(notifications.map(n =>
                n.id === id ? {...n, read: true} : n
            ));
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(notifications.map(n => ({...n, read: true})));
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

    const items: MenuProps['items'] = [
        {
            key: 'header',
            label: (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 16px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <strong>Powiadomienia</strong>
                    {unreadCount > 0 && (
                        <a onClick={(e) => {
                            e.preventDefault();
                            markAllAsRead();
                        }} style={{ fontSize: '12px' }}>
                            Przeczytaj wszystko
                        </a>
                    )}
                </div>
            ),
        },
        ...(loading ? [{
            key: 'loading',
            label: (
                <div style={{ padding: '8px 16px', textAlign: 'center' }}>
                    Ładowanie...
                </div>
            )
        }] : notifications.map(notification => ({
            key: notification.id,
            label: (
                <Link
                    href={getNotificationUrl(notification)}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    preserveScroll
                >
                    <div style={{
                        padding: '8px 16px',
                        background: notification.read ? '#fff' : '#f6ffed',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div><strong>{notification.title}</strong></div>
                        <div style={{ color: '#666' }}>{notification.message}</div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            {notification.created_at}
                        </div>
                    </div>
                </Link>
            ),
        }))),
        ...(notifications.length === 0 && !loading ? [{
            key: 'empty',
            label: (
                <div style={{ padding: '8px 16px', textAlign: 'center' }}>
                    Brak powiadomień
                </div>
            )
        }] : []),
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" onOpenChange={(open) => open && fetchNotifications()}>
            <Badge count={unreadCount}>
                <BellOutlined style={{
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '0 16px'
                }} />
            </Badge>
        </Dropdown>
    );
};

export default NotificationMenu;
