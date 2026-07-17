import MainLayout from '@/layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, Plus, User, Utensils } from 'lucide-react';
import React from 'react';

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
                    <h2 className="text-xl font-black tracking-wider text-white uppercase">Rozliczenia</h2>
                    <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">Lista aktywnych i archiwalnych rozliczeń</p>
                </div>

                <button
                    onClick={() => router.visit(route('settlements.create'))}
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#ED1C24] px-5 py-2.5 text-xs font-bold tracking-widest text-white uppercase shadow-lg shadow-red-950/20 transition-all hover:bg-[#d1171e]"
                >
                    <Plus className="h-4 w-4" />
                    Nowe rozliczenie
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#121214]">
                {settlements.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500">
                            <Utensils className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Brak rozliczeń</h3>
                        <p className="mt-1 max-w-xs text-xs text-zinc-500">Dodaj swoje pierwsze rozliczenie, aby zacząć.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Restauracja</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Zamawiający</th>
                                        <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Data</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-zinc-500 uppercase">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/40">
                                    {settlements.data.map((settlement) => {
                                        const dateToDisplay = settlement.date || settlement.created_at;

                                        return (
                                            <tr key={settlement.id} className="group transition-colors hover:bg-zinc-800/10">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Utensils className="h-4 w-4 text-zinc-500" />
                                                        <span className="text-xs font-bold text-zinc-200">{settlement.restaurant_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <User className="h-4 w-4 text-zinc-500" />
                                                        <span className="text-xs font-medium text-zinc-300">{settlement.user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <Calendar className="h-4 w-4 text-zinc-500" />
                                                        <span className="text-xs text-zinc-400">
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
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-bold tracking-widest text-zinc-400 uppercase transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
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

                        {settlements.last_page > 1 && (
                            <div className="flex flex-col items-center justify-between gap-4 border-t border-zinc-800/60 bg-zinc-900/10 px-6 py-4 sm:flex-row">
                                <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                    Pokazywanie <span className="text-zinc-300">{settlements.from}</span> -{' '}
                                    <span className="text-zinc-300">{settlements.to}</span> z{' '}
                                    <span className="text-zinc-300">{settlements.total}</span> rozliczeń
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={settlements.prev_page_url || '#'}
                                        disabled={!settlements.prev_page_url}
                                        as="button"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>

                                    <div className="flex items-center gap-1">
                                        {pageNumbers.map((page, index) => {
                                            if (page === '...') {
                                                return (
                                                    <span key={`dots-${index}`} className="px-2 font-black text-zinc-600">
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
                                                    className={`h-9 w-9 rounded-xl text-xs font-black transition-all ${
                                                        settlements.current_page === page
                                                            ? 'bg-[#ED1C24] text-white shadow-md shadow-red-950/20'
                                                            : 'border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white'
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
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:pointer-events-none disabled:opacity-30"
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
