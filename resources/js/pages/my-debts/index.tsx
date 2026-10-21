import MainLayout from '@/layouts/Layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Check, CheckCircle2, ChevronDown, ChevronUp, Clock, Coins, ExternalLink, Loader2, Receipt, X } from 'lucide-react';
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
    [key: string]: unknown;
    myDebts: Record<number, SettlementItem[]>;
    auth: {
        user: {
            id: number;
        };
    };
}

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

function MyDebts() {
    const { props } = usePage<PageProps>();
    const [groupedDebts, setGroupedDebts] = useState<Record<number, SettlementItem[]>>(props.myDebts || {});
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

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

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const handleMarkAsPaid = (itemId: number, amount: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Potwierdź opłacenie długu',
            message: `Czy na pewno chcesz oznaczyć ten dług (${amount.toFixed(2)} zł) jako opłacony?`,
            onConfirm: () => {
                closeConfirmModal();
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
            },
        });
    };

    const handleMarkGroupAsPaid = (groupId: number, debts: SettlementItem[], creditorName: string) => {
        const unpaidDebts = debts.filter((debt) => debt.status === 'unpaid');
        const unpaidDebtIds = unpaidDebts.map((debt) => debt.id);
        const totalUnpaidAmount = unpaidDebts.reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);

        if (unpaidDebtIds.length === 0) {
            showToast('Brak niezapłaconych długów w tej grupie', 'warning');
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Opłać wszystkie długi',
            message: `Czy chcesz opłacić wszystkie niezapłacone długi u: ${creditorName}?\nSuma wynosi ${totalUnpaidAmount.toFixed(2)} zł (${unpaidDebtIds.length} pozycji).`,
            onConfirm: () => {
                closeConfirmModal();
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
            },
        });
    };

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

            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeConfirmModal} />
                    <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-slate-800 bg-[#111a25] p-6 shadow-2xl transition-all">
                        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                            <h3 className="flex items-center gap-2 text-sm font-semibold tracking-normal text-white">
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                                {confirmModal.title}
                            </h3>
                            <button
                                onClick={closeConfirmModal}
                                className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-900 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm leading-relaxed font-semibold whitespace-pre-line text-slate-400">{confirmModal.message}</p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={closeConfirmModal}
                                className="rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2 text-xs font-semibold tracking-normal text-slate-400 transition-colors hover:bg-slate-900 hover:text-white"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold tracking-normal text-white transition-colors hover:bg-emerald-500"
                            >
                                Potwierdzam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed right-5 bottom-5 z-50 flex animate-bounce items-center gap-2.5 rounded-xl border border-slate-800 bg-[#111a25] px-4 py-3 text-sm font-bold text-white shadow-xl">
                    {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-[#2dd4bf]" />}
                    {toast.type === 'warning' && <AlertCircle className="h-4 w-4 text-amber-500" />}
                    <span>{toast.text}</span>
                </div>
            )}

            <div>
                <h2 className="text-xl font-semibold tracking-normal text-white">Moje długi</h2>
                <p className="mt-1 text-sm font-bold tracking-normal text-slate-500">Podsumowanie i status Twoich zaległości finansowych</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-500">Suma wszystkich długów</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-300 tabular-nums">{totalAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-slate-900 p-3 text-slate-400">
                        <Receipt className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-500">Niezapłacone pozycje</p>
                        <h3 className="mt-1 text-xl font-bold text-[#2dd4bf] tabular-nums">{totalUnpaidCount}</h3>
                    </div>
                    <div className="rounded-xl bg-[#2dd4bf]/10 p-3 text-[#2dd4bf]">
                        <Clock className="h-5 w-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#2dd4bf]/30 bg-[#111a25] p-5">
                    <div>
                        <p className="text-xs font-semibold tracking-normal text-slate-400">Do zapłacenia łącznie</p>
                        <h3 className="mt-1 text-xl font-bold text-emerald-500 tabular-nums">{totalUnpaidAmount.toFixed(2)} zł</h3>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                        <Coins className="h-5 w-5" />
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-[#111a25] p-6">
                <h3 className="mb-6 text-sm font-semibold tracking-normal text-slate-300">Twoje zobowiązania podzielone według wierzycieli</h3>

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
                                <div key={creditorId} className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/20">
                                    <div
                                        onClick={() => toggleGroup(creditorId)}
                                        className="flex cursor-pointer flex-col gap-4 bg-slate-900/30 p-4 transition-colors hover:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-sm font-semibold tracking-normal text-slate-200">Wierzyciel: {creditorName}</span>
                                            <span className="text-sm font-semibold text-slate-400 tabular-nums">
                                                Razem: {creditorTotal.toFixed(2)} zł
                                            </span>
                                            {hasUnpaid ? (
                                                <span className="rounded-full bg-[#2dd4bf]/10 px-2.5 py-0.5 text-xs font-bold tracking-normal text-[#2dd4bf]">
                                                    {unpaidCount} do zapłaty ({unpaidAmount.toFixed(2)} zł)
                                                </span>
                                            ) : (
                                                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold tracking-normal text-emerald-500">
                                                    Rozliczone
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                            {hasUnpaid && creditorIdValue && (
                                                <button
                                                    onClick={() => handleMarkGroupAsPaid(creditorIdValue, debts, creditorName)}
                                                    disabled={payingGroupId === creditorIdValue}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold tracking-normal text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
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
                                                className="p-1 text-slate-500 transition-colors hover:text-white"
                                            >
                                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                        </div>
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
                                                        <th className="px-6 py-3.5 text-right">Akcje</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/40">
                                                    {debts.map((record) => {
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
                                                                    {record.status === 'paid' ? (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold tracking-wide text-emerald-500">
                                                                            Zapłacone ({formatDateTime(record.paid_at || record.created_at)})
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center gap-1 rounded-md bg-[#2dd4bf]/10 px-2 py-0.5 text-xs font-bold tracking-wide text-[#2dd4bf]">
                                                                            Do zapłaty
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-slate-500">{formatDateTime(record.created_at)}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    {record.status !== 'paid' && (
                                                                        <button
                                                                            onClick={() => handleMarkAsPaid(record.id, finalAmount)}
                                                                            disabled={payingItemId === record.id}
                                                                            className="inline-flex items-center gap-1 rounded bg-[#2dd4bf] px-2.5 py-1 text-xs font-semibold tracking-normal text-slate-950 transition-all hover:bg-[#0f766e] disabled:opacity-50"
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
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-emerald-500">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-sm font-bold tracking-normal text-slate-300">Wszystko czyste!</h3>
                        <p className="mt-1 max-w-xs text-sm text-slate-500">Brak niezapłaconych długów. Świetna robota! 🎉</p>
                    </div>
                )}
            </div>
        </div>
    );
}

MyDebts.layout = (page: React.ReactNode) => <MainLayout children={page} title="Moje długi" />;

export default MyDebts;
