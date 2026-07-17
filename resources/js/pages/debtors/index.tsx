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
                <h2 className="text-xl font-black tracking-wider text-white uppercase">Dłużnicy</h2>
                <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    Lista osób, które zalegają Ci z płatnościami za wspólne zamówienia
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Łączna kwota</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-zinc-300">{totalAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-zinc-900 p-3 text-zinc-400">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Niezapłacone pozycje</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-amber-500">{totalUnpaidCount}</h3>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#ED1C24]/30 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Kwota niezapłacona</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-[#ED1C24]">{totalUnpaidAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-[#ED1C24]/10 p-3 text-[#ED1C24]">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                <h3 className="mb-6 text-xs font-black tracking-wider text-zinc-300 uppercase">Lista Twoich dłużników</h3>

                {Object.keys(groupedSettlements).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedSettlements).map(([userId, settlements]) => {
                            const user = settlements[0]?.user;
                            if (!user) return null;

                            const userTotal = settlements.reduce((sum, s) => sum + parseAmount(s.final_amount), 0);
                            const unpaidCount = settlements.filter((s) => s.status === 'unpaid').length;
                            const isExpanded = expandedGroups[userId] ?? false;

                            return (
                                <div key={userId} className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/20">
                                    <div
                                        onClick={() => toggleGroup(userId)}
                                        className="flex cursor-pointer items-center justify-between bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/50"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="flex items-center gap-2 text-xs font-black tracking-wider text-zinc-200 uppercase">
                                                <UserIcon className="h-4 w-4 text-[#ED1C24]" />
                                                {user.name}
                                            </span>
                                            <span className="font-mono text-xs font-semibold text-zinc-400">Suma: {userTotal.toFixed(2)} zł</span>
                                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase">
                                                {unpaidCount} niezapłaconych
                                            </span>
                                        </div>

                                        <button className="p-1 text-zinc-500 transition-colors hover:text-white">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </button>
                                    </div>

                                    {isExpanded && (
                                        <div className="overflow-x-auto border-t border-zinc-800/60">
                                            <table className="w-full text-left text-xs">
                                                <thead>
                                                    <tr className="border-b border-zinc-800 bg-zinc-900/10 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                                        <th className="px-6 py-3.5">Numer zamówienia</th>
                                                        <th className="px-6 py-3.5">Restauracja</th>
                                                        <th className="px-6 py-3.5">Kwota</th>
                                                        <th className="px-6 py-3.5">Status</th>
                                                        <th className="px-6 py-3.5">Data utworzenia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/40">
                                                    {settlements.map((record) => {
                                                        const finalAmount = parseAmount(record.final_amount);
                                                        return (
                                                            <tr key={record.id} className="group transition-colors hover:bg-zinc-800/5">
                                                                <td className="px-6 py-4">
                                                                    {record.settlement?.uuid ? (
                                                                        <Link
                                                                            href={route('settlements.show', { settlement: record.settlement_id })}
                                                                            className="inline-flex items-center gap-1 font-bold text-zinc-400 transition-colors hover:text-white"
                                                                        >
                                                                            #{record.settlement.uuid}
                                                                            <ExternalLink className="h-3 w-3" />
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-zinc-650">Brak</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 font-semibold text-zinc-300">
                                                                    {record.settlement?.restaurant_name || 'Brak nazwy'}
                                                                </td>
                                                                <td className="px-6 py-4 font-mono font-bold text-zinc-300">
                                                                    {finalAmount.toFixed(2)} zł
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-500 uppercase">
                                                                        Niezapłacone
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-zinc-500">{formatDateTime(record.created_at)}</td>
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
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-500">
                            <Users className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Brak dłużników</h3>
                        <p className="mt-1 max-w-xs text-xs text-zinc-500">Wszyscy Twoi znajomi są z Tobą rozliczeni na czysto! 🍕</p>
                    </div>
                )}
            </div>
        </div>
    );
}

Debtors.layout = (page: React.ReactNode) => <MainLayout children={page} title="Dłużnicy" />;

export default Debtors;
