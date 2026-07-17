import NotificationMenu from '@/components/NotificationMenu';
import { PageProps } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, BarChart3, ChevronLeft, ChevronRight, FileSpreadsheet, LogOut, Menu, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
}

interface SidebarItem {
    label: string;
    route: string;
    routeName: string;
    icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
    {
        label: 'Rozliczenia',
        route: route('settlements.index'),
        routeName: 'settlements.*',
        icon: FileSpreadsheet,
    },
    {
        label: 'Moje długi',
        route: route('my.debts'),
        routeName: 'my.debts',
        icon: AlertTriangle,
    },
    {
        label: 'Moi dłużnicy',
        route: route('debtors'),
        routeName: 'debtors',
        icon: Users,
    },
    {
        label: 'Statystyki',
        route: route('statistics'),
        routeName: 'statistics',
        icon: BarChart3,
    },
];

export default function MainLayout({ children, title }: MainLayoutProps) {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('menu-collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const pageProps = usePage<PageProps>();
    const username = pageProps.props.auth.user.name;

    useEffect(() => {
        localStorage.setItem('menu-collapsed', JSON.stringify(collapsed));
    }, [collapsed]);

    const isCurrentRoute = (routeName: string) => {
        return route().current(routeName);
    };

    return (
        <div className="flex min-h-screen overflow-hidden bg-[#09090b] font-sans text-zinc-100">
            <Head title={title} />

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-zinc-800/40 bg-[#0d0d0f] transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
                    mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${collapsed ? 'lg:w-[88px]' : 'lg:w-72'}`}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/40 px-6">
                    <Link
                        href={route('dashboard')}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 transition-all duration-300 ${collapsed ? 'lg:w-full lg:justify-center lg:gap-0' : ''}`}
                    >
                        <div className="relative">
                            <img
                                src="/images/logo.png"
                                alt="Logo"
                                className="h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(237,28,36,0.35)] transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <span
                            className={`text-sm font-black tracking-[0.25em] text-white uppercase transition-all duration-300 ${
                                collapsed ? 'lg:hidden lg:opacity-0' : 'opacity-100'
                            }`}
                        >
                            Splitter
                        </span>
                    </Link>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800/50 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="custom-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 py-8">
                    {!collapsed && (
                        <p className="mb-4 hidden px-4 text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase lg:block">Menu główne</p>
                    )}

                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentRoute(item.routeName);
                        return (
                            <Link
                                key={item.route}
                                href={item.route}
                                onClick={() => setMobileOpen(false)}
                                className={`group relative flex items-center gap-4 rounded-2xl px-4.5 py-4 text-[12px] font-bold tracking-widest uppercase transition-all duration-200 ${
                                    active
                                        ? 'border border-[#ff3b42]/20 bg-gradient-to-r from-[#ED1C24] to-[#c81219] text-white shadow-[0_6px_24px_rgba(237,28,36,0.25)]'
                                        : 'border border-transparent bg-zinc-900/10 text-zinc-400 shadow-sm hover:border-zinc-800/40 hover:bg-zinc-900/80 hover:text-white'
                                } ${collapsed ? 'lg:mx-auto lg:h-14 lg:w-14 lg:justify-center lg:px-0' : ''}`}
                            >
                                {!active && !collapsed && (
                                    <div className="absolute top-1/4 left-0 h-1/2 w-[3px] scale-y-0 rounded-r-full bg-[#ED1C24] transition-transform duration-200 group-hover:scale-y-100" />
                                )}

                                <Icon
                                    className={`h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                                        active ? 'text-white' : 'text-zinc-400 group-hover:text-white'
                                    }`}
                                />

                                <span
                                    className={`whitespace-nowrap transition-all duration-300 ${
                                        collapsed ? 'lg:pointer-events-none lg:absolute lg:opacity-0' : 'opacity-100'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden shrink-0 border-t border-zinc-800/30 p-5 lg:block">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex w-full items-center justify-center rounded-2xl border border-zinc-800/50 bg-zinc-900/20 py-3 text-zinc-500 transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-white"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>
            </aside>

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <header className="relative z-30 flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/40 bg-[#0d0d0f] px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-white lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {title && <h1 className="text-[11px] font-black tracking-[0.2em] text-zinc-400 uppercase">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative text-zinc-300 transition-colors hover:text-white">
                            <NotificationMenu />
                        </div>

                        {username && (
                            <div className="flex h-8 items-center gap-3 border-l border-zinc-800/40 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#ED1C24]/30 bg-[#ED1C24]/10 text-xs font-black text-[#ED1C24] uppercase shadow-inner">
                                        {username.charAt(0)}
                                    </div>
                                    <span className="hidden text-xs font-bold tracking-wider text-zinc-300 uppercase md:block">{username}</span>
                                </div>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl border border-zinc-800/30 p-2 text-zinc-500 transition-all duration-200 hover:border-red-500/20 hover:bg-red-500/10 hover:text-[#ED1C24]"
                                >
                                    <LogOut className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto bg-[#09090b] p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>

                <footer className="flex h-14 shrink-0 items-center justify-center border-t border-zinc-800/40 bg-[#0d0d0f] px-6 text-[10px] font-bold tracking-[0.2em] text-zinc-600 uppercase">
                    <span>Splitter &copy; {new Date().getFullYear()} Revi</span>
                </footer>
            </div>
        </div>
    );
}
