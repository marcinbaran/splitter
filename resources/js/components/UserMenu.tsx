import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Avatar, Dropdown, MenuProps, Space, Typography } from 'antd';
import React from 'react';

interface UserMenuProps {
    username: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
    const handleLogout = () => {
        router.post(route('logout'));
    };

    const items: MenuProps['items'] = [
        // {
        //     key: '1',
        //     label: (
        //         <Link href={route('profile.edit')}>
        //             <Space>
        //                 <UserOutlined />
        //                 <span>Profil</span>
        //             </Space>
        //         </Link>
        //     ),
        // },
        // {
        //     type: 'divider',
        // },
        {
            key: '2',
            label: (
                <button onClick={handleLogout}>
                    <Space>
                        <LogoutOutlined />
                        <span>Wyloguj</span>
                    </Space>
                </button>
            ),
        },
    ];

    return (
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', padding: '0 16px' }}>
                <Avatar icon={<UserOutlined />} />
                <Typography.Text>{username}</Typography.Text>
            </Space>
        </Dropdown>
    );
};

export default UserMenu;
