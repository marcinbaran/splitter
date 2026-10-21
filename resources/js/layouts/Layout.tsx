import NotificationMenu from '@/components/NotificationMenu';
import type { SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BarChart3, ChevronLeft, ChevronRight, FileSpreadsheet, LogOut, Menu, Split, Users, Wallet, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const navigation = [
    { label: 'Rozliczenia', name: 'settlements.index', match: 'settlements.*', icon: FileSpreadsheet },
    { label: 'Moje długi', name: 'my.debts', match: 'my.debts', icon: Wallet },
    { label: 'Moi dłużnicy', name: 'debtors', match: 'debtors', icon: Users },
    { label: 'Statystyki', name: 'statistics', match: 'statistics', icon: BarChart3 },
];

export default function MainLayout({ children, title }: { children: ReactNode; title?: string }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const menuButton = useRef<HTMLButtonElement>(null);
    const sidebar = useRef<HTMLElement>(null);
    const closeButton = useRef<HTMLButtonElement>(null);
    const { auth } = usePage<SharedData>().props;
    const username = auth.user.name;

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem('menu-collapsed') === 'true');
        } catch {
            /* Storage may be unavailable. */
        }
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;
        closeButton.current?.focus();
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Tab' && window.matchMedia('(max-width: 1023px)').matches) {
                const elements = sidebar.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
                const focusable = Array.from(elements ?? []).filter((el) => el.getClientRects().length > 0);
                const first = focusable[0],
                    last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first?.focus();
                }
            }
            if (event.key === 'Escape') {
                setMobileOpen(false);
                menuButton.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [mobileOpen]);

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        try {
            localStorage.setItem('menu-collapsed', String(!collapsed));
        } catch {
            /* Keep session state. */
        }
    };

    return (
        <div className="splitter-app flex min-h-dvh bg-[#0b1017] text-slate-200">
            <Head title={title} />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-teal-300 focus:p-3 focus:text-slate-950"
            >
                Przejdź do treści
            </a>
            {mobileOpen && (
                <button
                    aria-label="Zamknij menu"
                    tabIndex={-1}
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
                />
            )}
            <aside
                ref={sidebar}
                id="main-navigation"
                aria-label="Menu główne"
                className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-800/70 bg-[#0f161f] transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${mobileOpen ? 'visible translate-x-0' : 'invisible -translate-x-full lg:visible'} ${collapsed ? 'lg:w-24' : 'lg:w-64'}`}
            >
                <div className="flex h-24 items-center justify-between px-6">
                    <Link
                        href={route('dashboard')}
                        aria-label="Splitter — strona główna"
                        className="flex items-center gap-3"
                        onClick={() => setMobileOpen(false)}
                    >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
                            <Split size={23} strokeWidth={2.5} />
                        </span>
                        <span className={`text-xl font-semibold tracking-tight text-white ${collapsed ? 'lg:hidden' : ''}`}>
                            splitter<span className="text-teal-300">.</span>
                        </span>
                    </Link>
                    <button
                        ref={closeButton}
                        aria-label="Zamknij menu"
                        onClick={() => {
                            setMobileOpen(false);
                            menuButton.current?.focus();
                        }}
                        className="rounded-xl p-2 text-slate-400 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                    <p className={`mb-5 px-4 text-xs font-medium tracking-widest text-slate-500 uppercase ${collapsed ? 'lg:hidden' : ''}`}>
                        Twoje finanse
                    </p>
                    {navigation.map(({ label, name, match, icon: Icon }) => {
                        const active = route().current(match);
                        return (
                            <Link
                                key={name}
                                href={route(name)}
                                title={label}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => setMobileOpen(false)}
                                className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition-colors ${active ? 'bg-teal-300/10 text-teal-300 ring-1 ring-teal-300/15 ring-inset' : 'text-slate-400 hover:bg-white/5 hover:text-white'} ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                            >
                                <Icon size={19} className="shrink-0" />
                                <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
                                {active && <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-teal-300 ${collapsed ? 'lg:hidden' : ''}`} />}
                            </Link>
                        );
                    })}
                </nav>
                <div
                    className={`mx-4 mb-6 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/70 to-transparent p-4 ${collapsed ? 'lg:hidden' : ''}`}
                >
                    <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-300/10 text-teal-300">
                        <Users size={18} />
                    </span>
                    <p className="text-sm font-medium text-white">
                        Wspólny rachunek?
                        <br />
                        Prosty podział.
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">Dodaj wydatki i rozlicz się ze znajomymi w jednym miejscu.</p>
                    <Link
                        href={route('settlements.create')}
                        onClick={() => setMobileOpen(false)}
                        className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-teal-300"
                    >
                        Dodaj rozliczenie <ArrowUpRight size={15} />
                    </Link>
                </div>
                <button
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? 'Rozwiń menu' : 'Zwiń menu'}
                    className="mx-4 mb-5 hidden min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-800 text-xs text-slate-400 hover:bg-white/5 lg:flex"
                >
                    {collapsed ? (
                        <ChevronRight size={17} />
                    ) : (
                        <>
                            <ChevronLeft size={17} /> Zwiń menu
                        </>
                    )}
                </button>
            </aside>
            <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-800/70 bg-[#0b1017]/90 px-4 backdrop-blur-xl sm:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            ref={menuButton}
                            onClick={() => setMobileOpen(true)}
                            aria-label="Otwórz menu"
                            aria-expanded={mobileOpen}
                            aria-controls="main-navigation"
                            className="rounded-xl p-2 text-slate-300 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="truncate text-sm">
                            <span className="hidden text-slate-500 sm:inline">
                                Twoja przestrzeń <span className="mx-3 text-slate-700">/</span>
                            </span>
                            <span className="font-medium text-slate-200">{title}</span>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                        <NotificationMenu />
                        <div className="flex items-center gap-3 border-l border-slate-800 pl-3 sm:pl-5">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-400/15 text-sm font-semibold text-indigo-300">
                                {username.charAt(0).toUpperCase()}
                            </span>
                            <div className="hidden sm:block">
                                <p className="max-w-40 truncate text-sm font-medium text-white">{username}</p>
                                <p className="text-xs text-slate-500">Twoje konto</p>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                aria-label="Wyloguj się"
                                title="Wyloguj się"
                                className="rounded-xl p-3 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <LogOut size={17} />
                            </Link>
                        </div>
                    </div>
                </header>
                <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-7 outline-none sm:px-8 sm:py-10 lg:px-10">
                    <div className="mx-auto w-full max-w-7xl">{children}</div>
                </main>
                <footer className="mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 py-5 text-xs text-slate-500 sm:mx-8 lg:mx-10">
                    <span>Splitter © {new Date().getFullYear()} Revi</span>
                    <span>Mniej liczenia. Więcej wspólnych chwil.</span>
                </footer>
            </div>
        </div>
    );
}
