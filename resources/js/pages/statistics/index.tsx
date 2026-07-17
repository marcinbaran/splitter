import MainLayout from '@/layouts/Layout';
import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Frown,
    Smile,
    Calendar,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Coins,
    ChevronDown
} from 'lucide-react';
import React, { ReactNode, useState, useEffect } from 'react';

const getMonthName = (monthNumber: number): string => {
    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
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
    const [showContent, setShowContent] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);

    useEffect(() => {
        const accepted = localStorage.getItem('statsWarningAccepted');
        if (accepted === 'true') {
            setShowContent(true);
        } else {
            setModalVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('statsWarningAccepted', 'true');
        setModalVisible(false);
        setShowContent(true);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setYear(value);
        router.get(route('statistics'), { year: value }, { preserveState: true });
    };

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const chartData = allMonths.map(monthNumber => {
        const existing = stats.monthlyStats.find(item => item.month === monthNumber);
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

    const maxMonthValue = Math.max(...chartData.map(d => d.total), 1);
    const totalWydatkow = stats.paidAmount + stats.unpaidAmount;

    return (
        <div className="space-y-6">
            <Head title="Statystyki" />

            {modalVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-[#121214] p-6 shadow-2xl">
                        <div className="flex items-center gap-2.5 border-b border-zinc-800/60 pb-4 text-amber-500">
                            <AlertTriangle className="h-5 w-5" />
                            <h3 className="text-sm font-black tracking-wider uppercase">Uwaga! To może być bolesne!</h3>
                        </div>

                        <div className="flex flex-col items-center py-8 text-center">
                            <Frown className="h-14 w-14 text-[#ED1C24] animate-pulse" />
                            <div className="mt-4 space-y-2 text-sm text-zinc-400">
                                <p className="font-bold text-zinc-200">Czy na pewno chcesz zobaczyć swoje statystyki finansowe?</p>
                                <p className="text-xs text-zinc-500 flex items-center justify-center gap-1">
                                    To może być lekki szok <Smile className="h-3.5 w-3.5 inline text-amber-500" />
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                            <button
                                type="button"
                                onClick={() => router.visit(route('dashboard'))}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-2.5 text-xs font-bold tracking-widest text-zinc-400 uppercase transition-colors hover:bg-zinc-800 hover:text-white sm:w-auto sm:px-4"
                            >
                                Nie chcę patrzeć
                            </button>
                            <button
                                type="button"
                                onClick={handleAccept}
                                className="w-full rounded-xl bg-[#ED1C24] py-2.5 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-[#d1171e] sm:w-auto sm:px-4"
                            >
                                Pokaż statystyki!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showContent && (
                <>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-black tracking-wider text-white uppercase">Moje statystyki zamówień</h2>
                            <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">Analiza podsumowania finansowego Twojego konta</p>
                        </div>

                        <div className="relative inline-block w-32">
                            <select
                                value={year}
                                onChange={handleYearChange}
                                className="w-full appearance-none rounded-xl border border-zinc-800 bg-[#121214] px-4 py-2.5 pr-8 font-mono text-xs font-bold tracking-wider text-zinc-300 outline-none transition focus:border-zinc-700"
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y} className="bg-[#121214]">
                                        {y}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Opłacone zamówienia</p>
                                <h3 className="mt-1 font-mono text-xl font-bold text-emerald-500">{stats.paidCount}</h3>
                            </div>
                            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Nieopłacone zamówienia</p>
                                <h3 className="mt-1 font-mono text-xl font-bold text-[#ED1C24]">{stats.unpaidCount}</h3>
                            </div>
                            <div className="rounded-xl bg-[#ED1C24]/10 p-3 text-[#ED1C24]">
                                <XCircle className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-5 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Łączny obrót ({year})</p>
                                <h3 className="mt-1 font-mono text-xl font-bold text-zinc-300">{totalWydatkow.toFixed(2)} zł</h3>
                            </div>
                            <div className="rounded-xl bg-zinc-900 p-3 text-zinc-400">
                                <Coins className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                        <div className="mb-6 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[#ED1C24]" />
                            <h3 className="text-xs font-black tracking-wider text-zinc-300 uppercase">
                                Wartość i struktura zamówień w roku {year}
                            </h3>
                        </div>

                        {totalWydatkow > 0 ? (
                            <div className="space-y-6">
                                <div className="flex h-64 items-end gap-2 pt-4 border-b border-zinc-800 px-2 sm:gap-4">
                                    {chartData.map((data, idx) => {
                                        const totalHeightPercent = (data.total / maxMonthValue) * 100;
                                        const paidHeightPercent = data.total > 0 ? (data.paid / data.total) * 100 : 0;
                                        const unpaidHeightPercent = data.total > 0 ? (data.unpaid / data.total) * 100 : 0;

                                        return (
                                            <div key={idx} className="group relative flex flex-1 flex-col items-center h-full justify-end">

                                                <div className="pointer-events-none absolute -top-12 z-10 hidden w-32 rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-[10px] text-zinc-300 shadow-xl group-hover:block text-center">
                                                    <p className="font-bold text-white mb-0.5">{data.fullName}</p>
                                                    <p className="text-emerald-500 font-mono">Opł: {data.paid.toFixed(0)}zł</p>
                                                    <p className="text-[#ED1C24] font-mono">Zal: {data.unpaid.toFixed(0)}zł</p>
                                                    <div className="mt-0.5 border-t border-zinc-800 pt-0.5 font-black text-zinc-200 font-mono">
                                                        {data.total.toFixed(1)} zł
                                                    </div>
                                                </div>

                                                {data.total > 0 ? (
                                                    <div
                                                        style={{ height: `${totalHeightPercent}%` }}
                                                        className="w-full overflow-hidden rounded-t-md bg-zinc-800 transition-all group-hover:opacity-90 flex flex-col justify-end"
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
                                                    <div className="h-1 w-full bg-zinc-900 rounded-t" />
                                                )}

                                                <span className="mt-2 text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
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
                            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
                                <Calendar className="h-8 w-8 text-zinc-600 mb-2" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Brak danych</p>
                                <p className="text-[11px] text-zinc-600 mt-0.5">Nie zarejestrowano żadnych zamówień w {year} roku.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

Statistics.layout = (page: ReactNode) => (
    <MainLayout children={page} title="Moje statystyki" />
);

export default Statistics;
