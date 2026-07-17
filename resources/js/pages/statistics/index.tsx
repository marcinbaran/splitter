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
                    <div className="max-w-md rounded-2xl border border-zinc-800/80 bg-zinc-950/90 p-8 shadow-2xl ring-1 ring-[#ED1C24]/20">
                        <div className="mb-4 flex justify-center">
                            <div className="relative">
                                <EyeOff className="h-16 w-16 animate-pulse text-zinc-600" />
                                <Skull className="absolute -right-1 -bottom-1 h-7 w-7 animate-bounce text-[#ED1C24]" />
                            </div>
                        </div>

                        <h3 className="text-base font-black tracking-wider text-white uppercase">Strefa wysokiego napięcia!</h3>

                        <p className="mt-3 text-sm text-zinc-400">
                            Twoje konto bankowe może tego nie przeżyć. Na pewno chcesz zobaczyć sumę wydatków i czarno na białym dowiedzieć się, gdzie
                            podziały się Twoje miliony?
                        </p>

                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
                            <button
                                type="button"
                                onClick={() => router.visit(route('dashboard'))}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 text-xs font-bold tracking-widest text-zinc-400 uppercase transition-colors hover:bg-zinc-800 hover:text-white sm:px-6"
                            >
                                Uciekam stąd!
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRevealed(true)}
                                className="w-full rounded-xl bg-[#ED1C24] py-3 text-xs font-bold tracking-widest text-white uppercase shadow-[0_0_20px_rgba(237,28,36,0.3)] transition-all hover:scale-105 hover:bg-[#d1171e] active:scale-95 sm:px-6"
                            >
                                Pokaż te bolesne dane!
                            </button>
                        </div>

                        <p className="mt-4 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
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
                        <h2 className="text-xl font-black tracking-wider text-white uppercase">Moje statystyki zamówień</h2>
                        <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                            Analiza podsumowania finansowego Twojego konta
                        </p>
                    </div>

                    <div className="relative inline-block w-32">
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="w-full appearance-none rounded-xl border border-zinc-800 bg-[#121214] px-4 py-2.5 pr-8 font-mono text-xs font-bold tracking-wider text-zinc-300 transition outline-none focus:border-zinc-700"
                        >
                            {availableYears.map((y) => (
                                <option key={y} value={y} className="bg-[#121214]">
                                    {y}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Opłacone zamówienia</p>
                            <h3 className="mt-1 font-mono text-xl font-bold text-emerald-500">{stats.paidCount}</h3>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Nieopłacone zamówienia</p>
                            <h3 className="mt-1 font-mono text-xl font-bold text-[#ED1C24]">{stats.unpaidCount}</h3>
                        </div>
                        <div className="rounded-xl bg-[#ED1C24]/10 p-3 text-[#ED1C24]">
                            <XCircle className="h-5 w-5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Łączny obrót ({year})</p>
                            <h3 className="mt-1 font-mono text-xl font-bold text-zinc-300">{totalWydatkow.toFixed(2)} zł</h3>
                        </div>
                        <div className="rounded-xl bg-zinc-900 p-3 text-zinc-400">
                            <Coins className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                    <div className="mb-6 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#ED1C24]" />
                        <h3 className="text-xs font-black tracking-wider text-zinc-300 uppercase">Wartość i struktura zamówień w roku {year}</h3>
                    </div>

                    {totalWydatkow > 0 ? (
                        <div className="space-y-6">
                            <div className="flex h-64 items-end gap-2 border-b border-zinc-800 px-2 pt-4 sm:gap-4">
                                {chartData.map((data, idx) => {
                                    const totalHeightPercent = (data.total / maxMonthValue) * 100;
                                    const paidHeightPercent = data.total > 0 ? (data.paid / data.total) * 100 : 0;
                                    const unpaidHeightPercent = data.total > 0 ? (data.unpaid / data.total) * 100 : 0;

                                    return (
                                        <div key={idx} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                                            <div className="pointer-events-none absolute -top-12 z-10 hidden w-32 rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-center text-[10px] text-zinc-300 shadow-xl group-hover:block">
                                                <p className="mb-0.5 font-bold text-white">{data.fullName}</p>
                                                <p className="font-mono text-emerald-500">Opł: {data.paid.toFixed(0)}zł</p>
                                                <p className="font-mono text-[#ED1C24]">Zal: {data.unpaid.toFixed(0)}zł</p>
                                                <div className="mt-0.5 border-t border-zinc-800 pt-0.5 font-mono font-black text-zinc-200">
                                                    {data.total.toFixed(1)} zł
                                                </div>
                                            </div>

                                            {data.total > 0 ? (
                                                <div
                                                    style={{ height: `${totalHeightPercent}%` }}
                                                    className="flex w-full flex-col justify-end overflow-hidden rounded-t-md bg-zinc-800 transition-all group-hover:opacity-90"
                                                >
                                                    <div
                                                        style={{ height: `${unpaidHeightPercent}%` }}
                                                        className="w-full bg-[#ED1C24]/80 shadow-inner"
                                                    />
                                                    <div
                                                        style={{ height: `${paidHeightPercent}%` }}
                                                        className="w-full bg-emerald-500/80 shadow-inner"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-1 w-full rounded-t bg-zinc-900" />
                                            )}

                                            <span className="mt-2 block text-[9px] font-black tracking-wider text-zinc-500 uppercase">
                                                {data.month}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-[10px] font-black tracking-widest uppercase">
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-emerald-500/80" />
                                    <span className="text-zinc-400">Opłacone kwoty</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded bg-[#ED1C24]/80" />
                                    <span className="text-zinc-400">Zaległe kwoty</span>
                                </div>
                                <div className="flex items-center gap-1.5 font-normal text-zinc-500 normal-case">
                                    <span>(Najedź na słupek, aby zobaczyć detale)</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/20 py-12 text-center">
                            <Calendar className="mb-2 h-8 w-8 text-zinc-600" />
                            <p className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Brak danych</p>
                            <p className="mt-0.5 text-[11px] text-zinc-600">Nie zarejestrowano żadnych zamówień w {year} roku.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

Statistics.layout = (page: ReactNode) => <MainLayout children={page} title="Moje statystyki" />;

export default Statistics;
