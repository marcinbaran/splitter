import React, { useEffect, useState } from 'react';
import {
    DesktopOutlined,
    FileOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Button, MenuProps } from 'antd';
import { Layout, Menu, theme } from 'antd';
import { Head, Link } from '@inertiajs/react';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
}

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Option 1', '1', <PieChartOutlined />),
    getItem('Option 2', '2', <DesktopOutlined />),
    getItem('User', 'sub1', <UserOutlined />, [
        getItem('Tom', '3'),
        getItem('Bill', '4'),
        getItem('Alex', '5'),
    ]),
    getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
    getItem('Files', '9', <FileOutlined />),
];

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('menu-collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    useEffect(() => {
        localStorage.setItem('menu-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <>
            <Head title={title} />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div className="demo-logo-vertical" style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '64px',
                        margin: '16px 0'
                    }}>
                        <Link href={route('dashboard')}>
                            <img src="/images/logo.png" alt="HR Appgo" className="w-[70px] max-w-full"/>
                        </Link>
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                </Sider>
                <Layout>
                    <Header style={{ padding: 0, background: colorBgContainer }}>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                            }}
                        />
                    </Header>
                    <Content style={{ margin: '16px 16px' }}>
                        <div
                            style={{
                                padding: 24,
                                minHeight: 360,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            {children}
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>©{new Date().getFullYear()} Revi</Footer>
                </Layout>
            </Layout>
        </>
    );
};

export default MainLayout;
