import NotificationMenu from '@/components/NotificationMenu';
import UserMenu from '@/components/UserMenu';
import { AuditOutlined, BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button, Layout, Menu, MenuProps, theme } from 'antd';
import React, { useEffect, useState } from 'react';
import { PageProps } from '@inertiajs/inertia';

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
    getItem('Rozliczenia', route('settlements.index'), <AuditOutlined />, undefined, route('settlements.index')),
    getItem('Moje rozliczenia', route('settlements.my'), <AuditOutlined />, undefined, route('settlements.my')),
    getItem('Moi dłużnicy', route('debtors'), <UsergroupDeleteOutlined />, undefined, route('debtors')),
    getItem('Statystyki', route('statistics'), <BarChartOutlined />, undefined, route('statistics')),
];

function getDefaultKeys() {
    const openKeys: React.Key[] = [];

    function findKeys(items: MenuItem[], keys: React.Key[] = []) {
        return items.reduce<React.Key[]>(
            (previousValue, currentValue) => {
                if (currentValue.type === 'divider') return previousValue;

                if (currentValue.children?.length) {
                    const res = findKeys(currentValue.children, keys);

                    if (res.length) {
                        previousValue.push(...res);
                        openKeys.push(currentValue.key);
                    }
                }

                if (currentValue.key.toString() === route('dashboard')) {
                    if (currentValue.key.toString() === location.href) {
                        previousValue.push(currentValue.key);
                    }
                } else if (location.href.split('?')[0] === currentValue.key.toString()) {
                    previousValue.push(currentValue.key);
                }

                return previousValue;
            },
            [...keys],
        );
    }

    return {
        openKeys,
        selectedKeys: findKeys(items),
    };
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('menu-collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const pageProps = usePage<PageProps>();

    const username = pageProps.props.auth.user.name;

    useEffect(() => {
        localStorage.setItem('menu-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    return (
        <>
            <Head title={title} />
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    breakpoint="lg"
                    collapsedWidth="0"
                    onBreakpoint={(broken) => {
                        setCollapsed(broken);
                    }}
                    width={200}
                >
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
                    <Menu theme="dark" defaultSelectedKeys={getDefaultKeys().selectedKeys} mode="inline" items={items} />
                </Sider>
                <Layout>
                    <Header
                        style={{
                            padding: 0,
                            background: colorBgContainer,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
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
                        <NotificationMenu />
                        {username && <UserMenu username={username} />}
                    </Header>
                    <Content style={{ margin: '16px 16px' }}>{children}</Content>
                    <Footer style={{ textAlign: 'center' }}>Appgo ©{new Date().getFullYear()} Revi</Footer>
                </Layout>
            </Layout>
        </>
    );
};

export default MainLayout;
