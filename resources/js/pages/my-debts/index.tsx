import MainLayout from '@/layouts/Layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Coins, Receipt, Clock, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SettlementItem {
    id: number;
    amount: number | string | null;
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
        id: number;
    };
    user?: {
        name: string;
        phone: string;
    };
}

interface PageProps {
    myDebts: Record<number, SettlementItem[]>;
    auth: {
        user: {
            id: number;
        };
    };
}

function MyDebts() {
    const { props } = usePage<PageProps>();
    const [groupedDebts, setGroupedDebts] = useState<Record<number, SettlementItem[]>>(props.myDebts || {});
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);

    // Stan rozwijania paneli (wierzycieli)
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

    // Stan prostego systemu notyfikacji systemowych (zastępstwo dla message z antd)
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

    useEffect(() => {
        setGroupedDebts(props.myDebts || {});
    }, [props.myDebts]);

    const showToast = (text: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setToast({ text, type });
        setTimeout(() => setToast(null), 4000);
    };

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const toggleGroup = (groupId: string) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupId]: !prev[groupId],
        }));
    };

    const handleMarkAsPaid = (itemId: number, amount: number) => {
        if (!confirm(`Czy na pewno chcesz oznaczyć ten dług (${amount.toFixed(2)} zł) jako opłacony?`)) {
            return;
        }

        setPayingItemId(itemId);
        router.post(
            route('settlements.items.markAsPaid', { id: itemId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast('Status pozycji został zaktualizowany', 'success');
                    router.reload({ only: ['myDebts'] });
                },
                onError: () => {
                    showToast('Błąd podczas aktualizacji statusu', 'error');
                },
                onFinish: () => setPayingItemId(null),
            },
        );
    };

    const handleMarkGroupAsPaid = (groupId: number, debts: SettlementItem[], creditorName: string) => {
        const unpaidDebts = debts.filter((debt) => debt.status === 'unpaid');
        const unpaidDebtIds = unpaidDebts.map((debt) => debt.id);
        const totalUnpaidAmount = unpaidDebts.reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);

        if (unpaidDebtIds.length === 0) {
            showToast('Brak niezapłaconych długów w tej grupie', 'warning');
            return;
        }

        if (
            !confirm(
                `Czy chcesz opłacić wszystkie niezapłacone długi u: ${creditorName}?\nSuma: ${totalUnpaidAmount.toFixed(2)} zł (${unpaidDebtIds.length} pozycji)`,
            )
        ) {
            return;
        }

        setPayingGroupId(groupId);
        router.post(
            route('settlements.items.bulkMarkAsPaid'),
            { settlement_ids: unpaidDebtIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    showToast(`Opłacono ${unpaidDebtIds.length} długów za ${totalUnpaidAmount.toFixed(2)} zł`, 'success');
                    router.reload({ only: ['myDebts'] });
                },
                onError: () => {
                    showToast('Błąd przy aktualizacji grupy długów', 'error');
                },
                onFinish: () => setPayingGroupId(null),
            },
        );
    };

    // Obliczenia statystyk globalnych
    let totalAmount = 0;
    let totalUnpaidCount = 0;
    let totalUnpaidAmount = 0;

    Object.values(groupedDebts).forEach((debts) => {
        debts.forEach((debt) => {
            const amount = parseAmount(debt.final_amount);
            totalAmount += amount;
            if (debt.status === 'unpaid') {
                totalUnpaidCount++;
                totalUnpaidAmount += amount;
            }
        });
    });

    const getCreditorName = (debts: SettlementItem[]) => {
        if (debts[0]?.created_by?.name) {
            return debts[0].created_by.name;
        }
        const creditorId = debts[0]?.created_by;
        return `Wierzyciel #${creditorId}`;
    };

    const getCreditorId = (debts: SettlementItem[]) => {
        return debts[0]?.created_by?.id;
    };

    const getUnpaidAmountForGroup = (debts: SettlementItem[]) => {
        return debts.filter((debt) => debt.status === 'unpaid').reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);
    };

    const getUnpaidCountForGroup = (debts: SettlementItem[]) => {
        return debts.filter((debt) => debt.status === 'unpaid').length;
    };

    return (
        <div className="relative space-y-6">
            <Head title="Moje długi" />

            {/* Powiadomienia systemowe Toast */}
            {toast && (
                <div className="fixed right-5 bottom-5 z-50 flex animate-bounce items-center gap-2.5 rounded-xl border border-zinc-800 bg-[#121214] px-4 py-3 text-xs font-bold text-white shadow-xl">
                    {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-[#ED1C24]" />}
                    {toast.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    <span>{toast.text}</span>
                </div>
            )}

            {/* Nagłówek sekcji */}
            <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase">Moje długi</h2>
                <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">Podsumowanie i status Twoich zaległości finansowych</p>
            </div>

            {/* Grid ze Statystykami */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Suma wszystkich długów</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-zinc-300">{totalAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-zinc-900 p-3 text-zinc-400">
                        <Receipt className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Niezapłacone pozycje</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-[#ED1C24]">{totalUnpaidCount}</h3>
                    </div>
                    <div className="rounded-xl bg-[#ED1C24]/10 p-3 text-[#ED1C24]">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#ED1C24]/30 bg-[#121214] p-5">
                    <div>
                        <p className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Do zapłacenia łącznie</p>
                        <h3 className="mt-1 font-mono text-xl font-bold text-emerald-500">{totalUnpaidAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>
            </div>

            {/* Sekcja główna - Lista długów */}
            <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                <h3 className="mb-6 text-xs font-black tracking-wider text-zinc-300 uppercase">Twoje zobowiązania podzielone według wierzycieli</h3>

                {Object.keys(groupedDebts).length > 0 ? (
                    <div className="space-y-4">
                        {Object.entries(groupedDebts).map(([creditorId, debts]) => {
                            if (!debts || debts.length === 0) return null;

                            const creditorName = getCreditorName(debts);
                            const creditorIdValue = getCreditorId(debts);
                            const creditorTotal = debts.reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);
                            const unpaidCount = getUnpaidCountForGroup(debts);
                            const unpaidAmount = getUnpaidAmountForGroup(debts);
                            const hasUnpaid = unpaidCount > 0;
                            const isExpanded = expandedGroups[creditorId] ?? false;

                            return (
                                <div key={creditorId} className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/20">
                                    {/* Nagłówek Wierzyciela */}
                                    <div
                                        onClick={() => toggleGroup(creditorId)}
                                        className="flex cursor-pointer flex-col gap-4 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-xs font-black tracking-wider text-zinc-200 uppercase">
                                                Wierzyciel: {creditorName}
                                            </span>
                                            <span className="font-mono text-xs font-semibold text-zinc-400">
                                                Razem: {creditorTotal.toFixed(2)} zł
                                            </span>
                                            {hasUnpaid ? (
                                                <span className="rounded-full bg-[#ED1C24]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#ED1C24] uppercase">
                                                    {unpaidCount} do zapłaty ({unpaidAmount.toFixed(2)} zł)
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-emerald-500 uppercase">
                                                    Rozliczone
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                            {hasUnpaid && creditorIdValue && (
                                                <button
                                                    onClick={() => handleMarkGroupAsPaid(creditorIdValue, debts, creditorName)}
                                                    disabled={payingGroupId === creditorIdValue}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase transition-colors hover:bg-emerald-500 disabled:opacity-50"
                                                >
                                                    {payingGroupId === creditorIdValue ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5" />
                                                    )}
                                                    Opłać wszystkie
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleGroup(creditorId)}
                                                className="p-1 text-zinc-500 transition-colors hover:text-white"
                                            >
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabela szczegółów rozwijana */}
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
                                                        <th className="px-6 py-3.5 text-right">Akcje</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/40">
                                                    {debts.map((record) => {
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
                                                                    {record.status === 'paid' ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-emerald-500 uppercase">
                                                                            Zapłacone ({formatDateTime(record.paid_at || record.created_at)})
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#ED1C24]/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#ED1C24] uppercase">
                                                                            Do zapłaty
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-zinc-500">{formatDateTime(record.created_at)}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {record.status !== 'paid' && (
                                                                        <button
                                                                            onClick={() => handleMarkAsPaid(record.id, finalAmount)}
                                                                            disabled={payingItemId === record.id}
                                                                            className="inline-flex items-center gap-1 rounded bg-[#ED1C24] px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase transition-all hover:bg-[#d1171e] disabled:opacity-50"
                                                                        >
                                                                            {payingItemId === record.id ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                            ) : (
                                                                                <Check className="h-3 w-3" />
                                                                            )}
                                                                            Opłać
                                                                        </button>
                                                                    )}
                                                                </td>
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
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-emerald-500">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Wszystko czyste!</h3>
                        <p className="mt-1 max-w-xs text-xs text-zinc-500">Brak niezapłaconych długów. Świetna robota! 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
}

MyDebts.layout = (page: React.ReactNode) => <MainLayout children={page} title="Moje długi" />;

export default MyDebts;
