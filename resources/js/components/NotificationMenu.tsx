import { Badge, Dropdown, MenuProps } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface Notification {
    id: number;
    title: string;
    message: string;
    route: string;
    read: boolean;
}

const NotificationMenu: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([
        { id: 1, title: 'Nowe zamówienie', message: 'Zostało złozone nowe zamówienie przez ADAM NOWAK w restauracji XXX na kwotę 888 zł', route: 'dashboard', read: false },
        { id: 3, title: 'System', message: 'Aktualizacja systemu zaplanowana na jutro', route: 'dashboard', read: true },
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? {...n, read: true} : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({...n, read: true})));
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
                        <a onClick={markAllAsRead} style={{ fontSize: '12px' }}>
                            Przeczytaj wszystko
                        </a>
                    )}
                </div>
            ),
        },
        ...notifications.map(notification => ({
            key: notification.id,
            label: (
                <Link href={route(notification.route)} onClick={() => markAsRead(notification.id)}>
                    <div style={{
                        padding: '8px 16px',
                        background: notification.read ? '#fff' : '#f6ffed',
                        borderBottom: '1px solid #f0f0f0'
                    }}>
                        <div><strong>{notification.title}</strong></div>
                        <div style={{ color: '#666' }}>{notification.message}</div>
                    </div>
                </Link>
            ),
        })),
    ];

    return (
        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
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
