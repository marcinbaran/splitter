import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Calendar, Check, CreditCard, Loader2, Percent, Phone, Ticket, Truck, User, X } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface SettlementItem {
    id: number;
    user_id: number;
    amount: number;
    discounted_amount: number;
    final_amount: number;
    status: 'paid' | 'unpaid';
    created_by: number;
    user: {
        id: number;
        name: string;
    };
    createdBy: {
        id: number;
        name: string;
    };
}

interface Settlement {
    id: number;
    uuid: string;
    restaurant_name: string;
    date?: string;
    user: {
        name: string;
        phone: string;
    };
    discount: number;
    voucher: number;
    delivery: number;
    transaction: number;
    created_at: string;
}

interface PageProps {
    [key: string]: unknown;
    settlement: Settlement;
    items: SettlementItem[];
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
}

interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
}

const statusConfig = {
    paid: {
        label: 'Zapłacone',
        classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    unpaid: {
        label: 'Niezapłacone',
        classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
};

const SettlementShow = () => {
    const { props } = usePage<PageProps>();
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    const refreshItems = () => {
        router.reload({ only: ['items'] });
    };

    const closeConfirmModal = () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    };

    const markAsPaid = (itemId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'Potwierdź opłacenie pozycji',
            message: 'Czy na pewno chcesz oznaczyć tę pozycję jako opłaconą?',
            onConfirm: () => {
                closeConfirmModal();
                setPayingItemId(itemId);
                router.post(
                    route('settlements.items.markAsPaid', { id: itemId }),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            refreshItems();
                        },
                        onFinish: () => {
                            setPayingItemId(null);
                        },
                    },
                );
            },
        });
    };

    const formatSettlementDate = () => {
        const dateString = props.settlement.date || props.settlement.created_at;
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const calculateTotals = () => {
        const baseAmount = props.items.reduce((sum, item) => sum + Number(item.amount), 0);
        const discountAmount = baseAmount * (Number(props.settlement.discount) / 100);
        const amountAfterDiscount = baseAmount - discountAmount - Number(props.settlement.voucher);
        const totalAmount = amountAfterDiscount + Number(props.settlement.delivery) + Number(props.settlement.transaction);

        return {
            baseAmount,
            discountAmount,
            amountAfterDiscount,
            totalAmount,
        };
    };

    const totals = calculateTotals();

    return (
        <div className="relative mx-auto max-w-6xl space-y-6">
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
                            <p className="text-sm leading-relaxed font-semibold text-slate-400">{confirmModal.message}</p>
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

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('settlements.index')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 transition-colors hover:border-slate-700 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-semibold tracking-normal text-white">
                            Rozliczenie <span className="text-[#2dd4bf]">#{props.settlement.uuid.slice(0, 8)}...</span>
                        </h2>
                        <p className="mt-1 text-sm font-bold tracking-normal text-slate-500">{props.settlement.restaurant_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-800/60 bg-[#111a25] px-4 py-2.5 text-sm font-bold tracking-normal text-slate-400">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    {formatSettlementDate()}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <span className="text-xs font-semibold tracking-normal text-slate-500">Restauracja</span>
                    <span className="text-sm font-bold text-white">{props.settlement.restaurant_name}</span>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <span className="text-xs font-semibold tracking-normal text-slate-500">Zamawiający</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <User className="h-4 w-4 text-slate-500" />
                        {props.settlement.user.name}
                    </div>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/60 bg-[#111a25] p-5">
                    <span className="text-xs font-semibold tracking-normal text-slate-500">Telefon</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Phone className="h-4 w-4 text-slate-500" />
                        {props.settlement.user.phone || 'Brak numeru'}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-[#111a25] p-6">
                <h3 className="mb-6 border-b border-slate-800/60 pb-4 text-sm font-semibold tracking-normal text-slate-400">
                    Podsumowanie finansowe
                </h3>

                <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                            <Percent className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold tracking-normal text-slate-500">Rabat</span>
                            <span className="text-lg font-semibold text-slate-100">{props.settlement.discount}%</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                            <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold tracking-normal text-slate-500">Voucher</span>
                            <span className="text-lg font-semibold text-slate-100">{Number(props.settlement.voucher).toFixed(2)} zł</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                            <Truck className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold tracking-normal text-slate-500">Dostawa</span>
                            <span className="text-lg font-semibold text-slate-100">{Number(props.settlement.delivery).toFixed(2)} zł</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-xs font-bold tracking-normal text-slate-500">Transakcja</span>
                            <span className="text-lg font-semibold text-slate-100">{Number(props.settlement.transaction).toFixed(2)} zł</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-800/40 pt-6 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                        <span className="mb-1 block text-xs font-bold tracking-normal text-slate-500">Suma podstawowa</span>
                        <span className="text-lg font-semibold text-slate-200">{totals.baseAmount.toFixed(2)} zł</span>
                    </div>
                    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4">
                        <span className="mb-1 block text-xs font-bold tracking-normal text-slate-500">Po zniżkach</span>
                        <span className="text-lg font-semibold text-slate-200">{totals.amountAfterDiscount.toFixed(2)} zł</span>
                    </div>
                    <div className="rounded-xl border border-[#2dd4bf]/20 bg-[#2dd4bf]/5 p-4">
                        <span className="mb-1 block text-xs font-bold tracking-normal text-[#2dd4bf]">Suma końcowa</span>
                        <span className="text-lg font-semibold text-white">{totals.totalAmount.toFixed(2)} zł</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-[#111a25]">
                <div className="border-b border-slate-800/60 px-6 py-4">
                    <h3 className="text-sm font-semibold tracking-normal text-slate-400">Pozycje rozliczenia</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-800/60 bg-slate-900/30">
                                <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Użytkownik</th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Kwota podstawowa</th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Kwota po rabacie</th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Do zapłaty</th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-normal text-slate-500">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold tracking-normal text-slate-500">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {props.items.map((item) => {
                                const status = statusConfig[item.status];

                                return (
                                    <tr key={item.id} className="group transition-colors hover:bg-slate-800/10">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <User className="h-4 w-4 text-slate-500" />
                                                <span className="text-sm font-bold text-slate-200">{item.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-400">{Number(item.amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-400">{Number(item.discounted_amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-[#2dd4bf]">{Number(item.final_amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-normal ${status.classes}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.user_id === props.auth.user.id && item.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(item.id)}
                                                    disabled={payingItemId === item.id}
                                                    className="text-slate-450 inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-sm font-bold tracking-normal transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
                                                >
                                                    {payingItemId === item.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <Check className="h-3 w-3 text-emerald-500" />
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
            </div>
        </div>
    );
};

SettlementShow.layout = (page: ReactNode) => <Layout children={page} title="Szczegóły zamówienia" />;

export default SettlementShow;
