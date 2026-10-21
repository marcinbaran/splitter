import MainLayout from '@/layouts/Layout';
import { Head, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, ChevronDown, Coins, EyeOff, Skull, Smile, TrendingUp, XCircle } from 'lucide-react';
import React, { ReactNode, useState } from 'react';

const getMonthName = (monthNumber: number): string => {
    const months = [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
    ];
    return months[monthNumber - 1] || '';
};

interface StatisticsPageProps {
    stats: {
        paidAmount: number;
        unpaidAmount: number;
        paidCount: number;
        unpaidCount: number;
        monthlyStats: Array<{
            month: number;
            paid_amount: number;
            unpaid_amount: number;
        }>;
    };
    filters: {
        year: number;
    };
    availableYears: number[];
}

function Statistics({ stats, filters, availableYears }: StatisticsPageProps) {
    const [year, setYear] = useState<number>(filters.year);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setYear(value);
        router.get(route('statistics'), { year: value }, { preserveState: true });
    };

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const chartData = allMonths.map((monthNumber) => {
        const existing = stats.monthlyStats.find((item) => item.month === monthNumber);
        const paid = existing ? parseFloat(existing.paid_amount.toString()) : 0;
        const unpaid = existing ? parseFloat(existing.unpaid_amount.toString()) : 0;

        return {
            month: getMonthName(monthNumber).substring(0, 3),
            fullName: getMonthName(monthNumber),
            paid,
            unpaid,
            total: paid + unpaid,
        };
    });

    const maxMonthValue = Math.max(...chartData.map((d) => d.total), 1);
    const totalWydatkow = stats.paidAmount + stats.unpaidAmount;

    return (
        <div className="relative min-h-[80vh] space-y-6">
            <Head title="Statystyki" />

            {!isRevealed && (
                <div className="animate-fade-in absolute inset-0 z-40 flex flex-col items-center justify-center rounded-2xl bg-black/40 p-6 text-center backdrop-blur-md transition-all duration-500">
                    <div className="max-w-md rounded-2xl border border-slate-800/80 bg-slate-950/90 p-8 shadow-2xl ring-1 ring-[#2dd4bf]/20">
                        <div className="mb-4 flex justify-center">
                            <div className="relative">
                                <EyeOff className="h-16 w-16 animate-pulse text-slate-600" />
                                <Skull className="absolute -right-1 -bottom-1 h-7 w-7 animate-bounce text-[#2dd4bf]" />
                            </div>
                        </div>

                        <h3 className="text-base font-semibold tracking-normal text-white">Strefa wysokiego napięcia!</h3>

                        <p className="mt-3 text-sm text-slate-400">
                            Twoje konto bankowe może tego nie przeżyć. Na pewno chcesz zobaczyć sumę wydatków i czarno na białym dowiedzieć się, gdzie
                            podziały się Twoje miliony?
                        </p>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                            <button
                                type="button"
                                onClick={() => router.visit(route('dashboard'))}
                                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3 text-sm font-bold tracking-normal text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:px-6"
                            >
                                Uciekam stąd!
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRevealed(true)}
                                className="w-full rounded-xl bg-[#2dd4bf] py-3 text-sm font-bold tracking-normal text-slate-950 shadow-[0_0_20px_rgba(237,28,36,0.3)] transition-all hover:scale-105 hover:bg-[#0f766e] active:scale-95 sm:px-6"
                            >
                                Pokaż te bolesne dane!
                            </button>
                        </div>

                        <p className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-500">
                            Klikasz na własną odpowiedzialność <Smile className="inline h-3 w-3 text-amber-500" />
                        </p>
                    </div>
                </div>
            )}

            <div
                className={`transition-all duration-700 ease-in-out ${!isRevealed ? 'pointer-events-none opacity-40 blur-md select-none' : 'blur-0'}`}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold tracking-normal text-white">Moje statystyki zamówień</h2>
                        <p className="mt-1 text-sm font-bold tracking-normal text-slate-500">Analiza podsumowania finansowego Twojego konta</p>
                    </div>

                    <div className="relative inline-block w-32">
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="w-full appearance-none rounded-xl border border-slate-800 bg-[#111a25] px-4 py-2.5 pr-8 text-sm font-bold tracking-normal text-slate-300 tabular-nums transition outline-none focus:border-slate-700"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y} className="bg-[#111a25]">
                                    {y}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                        <div>
                            <p className="text-xs font-semibold tracking-normal text-slate-500">Opłacone zamówienia</p>
                            <h3 className="mt-1 text-xl font-bold text-emerald-500 tabular-nums">{stats.paidCount}</h3>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                        <div>
                            <p className="text-xs font-semibold tracking-normal text-slate-500">Nieopłacone zamówienia</p>
                            <h3 className="mt-1 text-xl font-bold text-[#2dd4bf] tabular-nums">{stats.unpaidCount}</h3>
                        </div>
                        <div className="rounded-xl bg-[#2dd4bf]/10 p-3 text-[#2dd4bf]">
                            <XCircle className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                        <div>
                            <p className="text-xs font-semibold tracking-normal text-slate-500">Łączny obrót ({year})</p>
                            <h3 className="mt-1 text-xl font-bold text-slate-300 tabular-nums">{totalWydatkow.toFixed(2)} zł</h3>
                        </div>
                        <div className="rounded-xl bg-slate-900 p-3 text-slate-400">
                            <Coins className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-800/60 bg-[#111a25] p-6">
                    <div className="mb-6 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#2dd4bf]" />
                        <h3 className="text-sm font-semibold tracking-normal text-slate-300">Wartość i struktura zamówień w roku {year}</h3>
                    </div>

                    {totalWydatkow > 0 ? (
                        <div className="space-y-6">
                            <div className="flex h-64 items-end gap-2 border-b border-slate-800 px-2 pt-4 sm:gap-4">
                                {chartData.map((data, idx) => {
                                    const totalHeightPercent = (data.total / maxMonthValue) * 100;
                                    const paidHeightPercent = data.total > 0 ? (data.paid / data.total) * 100 : 0;
                                    const unpaidHeightPercent = data.total > 0 ? (data.unpaid / data.total) * 100 : 0;

                                    return (
                                        <div key={idx} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                                            <div className="pointer-events-none absolute -top-12 z-10 hidden w-32 rounded-lg border border-slate-800 bg-slate-950 p-2 text-center text-xs text-slate-300 shadow-xl group-hover:block">
                                                <p className="mb-0.5 font-bold text-white">{data.fullName}</p>
                                                <p className="text-emerald-500 tabular-nums">Opł: {data.paid.toFixed(0)}zł</p>
                                                <p className="text-[#2dd4bf] tabular-nums">Zal: {data.unpaid.toFixed(0)}zł</p>
                                                <div className="mt-0.5 border-t border-slate-800 pt-0.5 font-semibold text-slate-200 tabular-nums">
                                                    {data.total.toFixed(1)} zł
                                                </div>
                                            </div>

                                            {data.total > 0 ? (
                                                <div
                                                    style={{ height: `${totalHeightPercent}%` }}
                                                    className="flex w-full flex-col justify-end overflow-hidden rounded-t-md bg-slate-800 transition-all group-hover:opacity-90"
                                                >
                                                    <div
                                                        style={{ height: `${unpaidHeightPercent}%` }}
                                                        className="w-full bg-[#2dd4bf]/80 shadow-inner"
                                                    />
                                                    <div
                                                        style={{ height: `${paidHeightPercent}%` }}
                                                        className="w-full bg-emerald-500/80 shadow-inner"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-1 w-full rounded-t bg-slate-900" />
                                            )}

                                            <span className="mt-2 block text-[9px] font-semibold tracking-normal text-slate-500">{data.month}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-semibold tracking-normal">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-emerald-500/80" />
                                    <span className="text-slate-400">Opłacone kwoty</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-[#2dd4bf]/80" />
                                    <span className="text-slate-400">Zaległe kwoty</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-normal text-slate-500 normal-case">
                                    <span>(Najedź na słupek, aby zobaczyć detale)</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/20 py-12 text-center">
                            <Calendar className="mb-2 h-8 w-8 text-slate-600" />
                            <p className="text-sm font-bold tracking-normal text-slate-400">Brak danych</p>
                            <p className="mt-0.5 text-[11px] text-slate-600">Nie zarejestrowano żadnych zamówień w {year} roku.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Statistics.layout = (page: ReactNode) => <MainLayout children={page} title="Moje statystyki" />;

export default Statistics;
