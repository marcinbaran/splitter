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
    icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
    { label: 'Rozliczenia', route: route('settlements.index'), icon: FileSpreadsheet },
    { label: 'Moje długi', route: route('my.debts'), icon: AlertTriangle },
    { label: 'Moi dłużnicy', route: route('debtors'), icon: Users },
    { label: 'Statystyki', route: route('statistics'), icon: BarChart3 },
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

    const isCurrentRoute = (routePath: string) => {
        return location.href.split('?')[0] === routePath;
    };

    return (
        <div className="flex min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
            <Head title={title} />

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md transition-opacity duration-300 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-zinc-800/60 bg-[#121214] transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'lg:w-20' : 'lg:w-64'} `}
            >
                <div className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/60 px-4">
                    {/* Dodano onClick, aby kliknięcie w logo na mobilce również zamykało menu */}
                    <Link
                        href={route('dashboard')}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 ${collapsed ? 'lg:w-full lg:justify-center' : ''}`}
                    >
                        <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain drop-shadow-[0_2px_10px_rgba(237,28,36,0.25)]" />
                        {!collapsed && <span className="hidden text-sm font-black tracking-wider text-white uppercase lg:block">Splitter</span>}
                        <span className="text-sm font-black tracking-wider text-white uppercase lg:hidden">Splitter</span>
                    </Link>

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = isCurrentRoute(item.route);
                        return (
                            <Link
                                key={item.route}
                                href={item.route}
                                onClick={() => setMobileOpen(false)} // <--- TUTAJ: Zamyka menu po kliknięciu
                                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-bold tracking-widest uppercase transition-all duration-200 ${
                                    active
                                        ? 'bg-[#ED1C24] text-white shadow-lg shadow-red-950/30'
                                        : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-white'
                                } ${collapsed ? 'lg:justify-center' : ''} `}
                            >
                                <Icon
                                    className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}
                                />
                                <span className={`transition-opacity duration-200 ${collapsed ? 'lg:hidden' : 'opacity-100'}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden shrink-0 border-t border-zinc-800/60 p-4 lg:block">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-zinc-900/50 py-2.5 text-zinc-400 transition-all duration-200 hover:border-white/50 hover:bg-zinc-800/80 hover:text-white"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                    </button>
                </div>
            </aside>

            <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
                <header className="relative z-30 flex h-20 shrink-0 items-center justify-between border-b border-zinc-800/60 bg-[#121214] px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileOpen(true)}
                            className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {title && <h1 className="text-xs font-black tracking-widest text-zinc-400 uppercase">{title}</h1>}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative text-zinc-100 hover:text-white">
                            <NotificationMenu />
                        </div>

                        {username && (
                            <div className="flex h-8 items-center gap-3 border-l border-zinc-800/60 pl-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/80 text-xs font-black text-white uppercase shadow-inner">
                                        {username.charAt(0)}
                                    </div>
                                    <span className="hidden text-xs font-bold tracking-wider text-zinc-300 uppercase md:block">{username}</span>
                                </div>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="rounded-xl border border-zinc-800/30 p-2 text-zinc-400 transition-all duration-200 hover:bg-red-500/5 hover:text-[#ED1C24]"
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

                <footer className="flex h-14 shrink-0 items-center justify-center border-t border-zinc-800/60 bg-[#121214] px-6 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    <span>Splitter &copy; {new Date().getFullYear()} Revi</span>
                </footer>
            </div>
        </div>
    );
}
