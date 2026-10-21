import MainLayout from '@/layouts/Layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Coins, ExternalLink, User as UserIcon, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface Settlement {
    id: number;
    final_amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    user_id: number;
    settlement_id: number;
    settlement?: {
        restaurant_name: string;
        uuid: string;
        user?: {
            name: string;
            phone: string;
        };
    };
    created_by?: {
        name: string;
    };
    user?: {
        name: string;
        phone: string;
    };
}

interface PageProps {
    [key: string]: unknown;
    settlements: Record<number, Settlement[]>;
    auth: {
        user: {
            id: number;
        };
    };
}

function Debtors() {
    const { props } = usePage<PageProps>();
    const [groupedSettlements, setGroupedSettlements] = useState<Record<number, Settlement[]>>(props.settlements || {});

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setGroupedSettlements(props.settlements || {});
    }, [props.settlements]);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const toggleGroup = (userId: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [userId]: !prev[userId],
        }));
    };

    let totalAmount = 0;
    let totalUnpaidCount = 0;
    let totalUnpaidAmount = 0;

    Object.values(groupedSettlements).forEach((settlements) => {
        settlements.forEach((settlement) => {
            const amount = parseAmount(settlement.final_amount);
            totalAmount += amount;
            if (settlement.status === 'unpaid') {
                totalUnpaidCount++;
                totalUnpaidAmount += amount;
            }
        });
    });

    return (
        <div className="space-y-6">
            <Head title="Dłużnicy" />

            <div>
                <h2 className="text-xl font-semibold tracking-normal text-white">Dłużnicy</h2>
                <p className="mt-1 text-sm font-bold tracking-normal text-slate-500">
                    Lista osób, które zalegają Ci z płatnościami za wspólne zamówienia
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-500">Łączna kwota</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-300 tabular-nums">{totalAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3 text-slate-400">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-500">Niezapłacone pozycje</p>
                        <h3 className="mt-1 text-xl font-bold text-amber-500 tabular-nums">{totalUnpaidCount}</h3>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#2dd4bf]/30 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-400">Kwota niezapłacona</p>
                        <h3 className="mt-1 text-xl font-bold text-[#2dd4bf] tabular-nums">{totalUnpaidAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-[#2dd4bf]/10 p-3 text-[#2dd4bf]">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-[#111a25] p-6">
                <h3 className="mb-6 text-sm font-semibold tracking-normal text-slate-300">Lista Twoich dłużników</h3>

                {Object.keys(groupedSettlements).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedSettlements).map(([userId, settlements]) => {
                            const user = settlements[0]?.user;
                            if (!user) return null;

                            const userTotal = settlements.reduce((sum, s) => sum + parseAmount(s.final_amount), 0);
                            const unpaidCount = settlements.filter((s) => s.status === 'unpaid').length;
                            const isExpanded = expandedGroups[userId] ?? false;

                            return (
                                <div key={userId} className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/20">
                                    <div
                                        onClick={() => toggleGroup(userId)}
                                        className="flex cursor-pointer items-center justify-between bg-slate-900/30 p-4 transition-colors hover:bg-slate-900/50"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="flex items-center gap-2 text-sm font-semibold tracking-normal text-slate-200">
                                                <UserIcon className="h-4 w-4 text-[#2dd4bf]" />
                                                {user.name}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-400 tabular-nums">Suma: {userTotal.toFixed(2)} zł</span>
                                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold tracking-normal text-amber-500">
                                                {unpaidCount} niezapłaconych
                                            </span>
                                        </div>

                                        <button className="p-1 text-slate-500 transition-colors hover:text-white">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="overflow-x-auto border-t border-slate-800/60">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-800 bg-slate-900/10 text-xs font-semibold tracking-normal text-slate-500">
                                                        <th className="px-6 py-3.5">Numer zamówienia</th>
                                                        <th className="px-6 py-3.5">Restauracja</th>
                                                        <th className="px-6 py-3.5">Kwota</th>
                                                        <th className="px-6 py-3.5">Status</th>
                                                        <th className="px-6 py-3.5">Data utworzenia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/40">
                                                    {settlements.map((record) => {
                                                        const finalAmount = parseAmount(record.final_amount);
                                                        return (
                                                            <tr key={record.id} className="group transition-colors hover:bg-slate-800/5">
                                                                <td className="px-6 py-4">
                                                                    {record.settlement?.uuid ? (
                                                                        <Link
                                                                            href={route('settlements.show', { settlement: record.settlement_id })}
                                                                            className="inline-flex items-center gap-1 font-bold text-slate-400 transition-colors hover:text-white"
                                                                        >
                                                                            #{record.settlement.uuid}
                                                                            <ExternalLink className="h-3 w-3" />
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-slate-650">Brak</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 font-semibold text-slate-300">
                                                                    {record.settlement?.restaurant_name || 'Brak nazwy'}
                                                                </td>
                                                                <td className="px-6 py-4 font-bold text-slate-300 tabular-nums">
                                                                    {finalAmount.toFixed(2)} zł
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold tracking-wide text-amber-500">
                                                                        Niezapłacone
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-500">{formatDateTime(record.created_at)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-normal text-slate-300">Brak dłużników</h3>
                        <p className="mt-1 max-w-xs text-sm text-slate-500">Wszyscy Twoi znajomi są z Tobą rozliczeni na czysto! 🍕</p>
                    </div>
                )}
            </div>
        </div>
    );
}

Debtors.layout = (page: React.ReactNode) => <MainLayout children={page} title="Dłużnicy" />;

export default Debtors;
