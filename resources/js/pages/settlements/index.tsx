import MainLayout from '@/layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Search, User, Utensils } from 'lucide-react';
import React, { useState } from 'react';

interface DataType {
    id: string;
    uuid: string;
    restaurant_name: string;
    date?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email?: string;
    };
}

interface LaravelPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedSettlements {
    data: DataType[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: LaravelPaginationLink[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface OrderIndexProps {
    settlements: PaginatedSettlements;
}

function SettlementIndex({ settlements }: OrderIndexProps) {
    const [search, setSearch] = useState('');
    const filteredSettlements = settlements.data.filter((item) =>
        (item.restaurant_name + ' ' + item.user.name).toLocaleLowerCase('pl').includes(search.toLocaleLowerCase('pl')),
    );
    const getPageNumbers = () => {
        const total = settlements.last_page;
        const current = settlements.current_page;
        const pages: (number | string)[] = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);

            if (current > 3) {
                pages.push('...');
            }

            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (current < total - 2) {
                pages.push('...');
            }

            pages.push(total);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="space-y-6">
            <Head title="Rozliczenia" />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-white">Rozliczenia</h2>
                    <p className="mt-1 text-sm font-bold tracking-normal text-slate-500">Lista aktywnych i archiwalnych rozliczeń</p>
                </div>

                <button
                    onClick={() => router.visit(route('settlements.create'))}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#2dd4bf] px-5 py-2.5 text-sm font-bold tracking-normal text-slate-950 shadow-lg shadow-teal-950/20 transition-all hover:bg-[#0f766e]"
                >
                    <Plus className="h-4 w-4" />
                    Nowe rozliczenie
                </button>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-800/70 bg-[#111a25] p-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-base font-medium text-white">
                        Historia rozliczeń <span className="ml-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-teal-300">{settlements.total}</span>
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">Wspólne wydatki, wszystko w jednym miejscu.</p>
                </div>
                <label className="flex items-center gap-2 rounded-xl border border-slate-700/70 px-3 py-2.5 text-slate-400 focus-within:border-teal-300">
                    <Search size={17} />
                    <input
                        aria-label="Szukaj na bieżącej stronie"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Szukaj na tej stronie…"
                        className="min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    />
                </label>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-[#111a25]">
                {filteredSettlements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                            <Utensils className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-normal text-slate-300">Brak rozliczeń</h3>
                        <p className="mt-1 max-w-xs text-sm text-slate-500">
                            {search ? 'Zmień lub wyczyść wyszukiwanie.' : 'Dodaj swoje pierwsze rozliczenie, aby zacząć.'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-800/60 bg-slate-900/30">
                                        <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Restauracja</th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Zamawiający</th>
                                        <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Data</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold tracking-normal text-slate-500">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {filteredSettlements.map((settlement) => {
                                        const dateToDisplay = settlement.date || settlement.created_at;

                                        return (
                                            <tr key={settlement.id} className="group transition-colors hover:bg-slate-800/10">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Utensils className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-bold text-slate-200">{settlement.restaurant_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm font-medium text-slate-300">{settlement.user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Calendar className="h-4 w-4 text-slate-500" />
                                                        <span className="text-sm text-slate-400">
                                                            {new Date(dateToDisplay).toLocaleDateString('pl-PL', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                            })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route('settlements.show', { settlement: settlement.id })}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-sm font-bold tracking-normal text-slate-400 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                                                    >
                                                        Szczegóły
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-slate-800/60 md:hidden">
                            {filteredSettlements.map((settlement) => (
                                <Link
                                    key={settlement.id}
                                    href={route('settlements.show', { settlement: settlement.id })}
                                    className="flex items-center gap-4 p-4 transition-colors hover:bg-slate-800/40"
                                >
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-300/10 text-teal-300">
                                        <Utensils size={18} />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-base font-medium text-white">{settlement.restaurant_name}</p>
                                        <p className="mt-1 truncate text-sm text-slate-400">
                                            {settlement.user.name} · {new Date(settlement.date || settlement.created_at).toLocaleDateString('pl-PL')}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 shrink-0 text-slate-500" />
                                </Link>
                            ))}
                        </div>
                        {settlements.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800/60 bg-slate-900/10 px-6 py-4 sm:flex-row">
                                <div className="text-sm font-bold tracking-normal text-slate-500">
                                    Pokazywanie <span className="text-slate-300">{settlements.from}</span> -{' '}
                                    <span className="text-slate-300">{settlements.to}</span> z{' '}
                                    <span className="text-slate-300">{settlements.total}</span> rozliczeń
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={settlements.prev_page_url || '#'}
                                        disabled={!settlements.prev_page_url}
                                        as="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`dots-${index}`} className="px-2 font-semibold text-slate-600">
                                                        ...
                                                    </span>
                                                );
                                            }

                                            const pageUrl = `${route('settlements.index')}?page=${page}`;

                                            return (
                                                <Link
                                                    key={`page-${page}`}
                                                    href={pageUrl}
                                                    as="button"
                                                    className={`h-9 w-9 rounded-xl text-sm font-semibold transition-all ${
                                                        settlements.current_page === page
                                                            ? 'bg-[#2dd4bf] text-white shadow-md shadow-teal-950/20'
                                                            : 'border border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
                                                    }`}
                                                >
                                                    {page}
                                                </Link>
                                            );
                                        })}
                                    </div>

                                    <Link
                                        href={settlements.next_page_url || '#'}
                                        disabled={!settlements.next_page_url}
                                        as="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

SettlementIndex.layout = (page: React.ReactNode) => <MainLayout children={page} title="Rozliczenia" />;

export default SettlementIndex;
