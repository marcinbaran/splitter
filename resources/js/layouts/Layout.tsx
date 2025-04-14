import {
    AuditOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined
} from '@ant-design/icons';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button, Layout, Menu, MenuProps, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import UserMenu from '@/components/UserMenu';

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number] & {
    route?: string;
};

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    username?: string;
}

function getItem(label: React.ReactNode, key: React.Key, icon?: React.ReactNode, children?: MenuItem[], route?: string): MenuItem {
    return {
        key,
        icon,
        children,
        label: route ? <Link href={route}>{label}</Link> : label,
        route,
    } as MenuItem;
}

const items: MenuItem[] = [
    getItem('Strona główna', '1', <PieChartOutlined />, undefined, route('dashboard')),
    getItem('Zamówienia', '2', <AuditOutlined />, undefined, route('orders.index')),
];

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('menu-collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const pageProps = usePage<PageProps>()

    const username = pageProps.props.auth.user.name;

    useEffect(() => {
        localStorage.setItem('menu-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <>
            <Head title={title} />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={collapsed}>
                    <div
                        className="demo-logo-vertical"
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '64px',
                            margin: '16px 0',
                        }}
                    >
                        <Link href={route('dashboard')}>
                            <img src="/images/logo.png" alt="HR Appgo" className="w-[70px] max-w-full" />
                        </Link>
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
                </Sider>
                <Layout>
                    <Header style={{
                        padding: 0,
                        background: colorBgContainer,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
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
                        {username && <UserMenu username={username} />}
                    </Header>
                    <Content style={{ margin: '16px 16px' }}>
                        {children}
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>©{new Date().getFullYear()} Revi</Footer>
                </Layout>
            </Layout>
        </>
    );
};

export default MainLayout;
