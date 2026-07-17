import Layout from '@/layouts/Layout';
import { ReactNode, useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Calendar, User, Phone, Check, ArrowLeft, Percent, Ticket, Truck, CreditCard, Loader2 } from 'lucide-react';

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
    settlement: Settlement;
    items: SettlementItem[];
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
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

    const refreshItems = () => {
        router.reload({ only: ['items'], preserveScroll: true });
    };

    const markAsPaid = (itemId: number) => {
        if (!confirm('Czy na pewno chcesz oznaczyć tę pozycję jako opłaconą?')) {
            return;
        }

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
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('settlements.index')}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h2 className="text-xl font-black tracking-wider text-white uppercase">
                            Rozliczenie <span className="text-[#ED1C24]">#{props.settlement.uuid.slice(0, 8)}...</span>
                        </h2>
                        <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">{props.settlement.restaurant_name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-[#121214] px-4 py-2.5 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    {formatSettlementDate()}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Restauracja</span>
                    <span className="text-sm font-bold text-white">{props.settlement.restaurant_name}</span>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Zamawiający</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <User className="h-4 w-4 text-zinc-500" />
                        {props.settlement.user.name}
                    </div>
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-[#121214] p-5">
                    <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Telefon</span>
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Phone className="h-4 w-4 text-zinc-500" />
                        {props.settlement.user.phone || 'Brak numeru'}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                <h3 className="mb-6 border-b border-zinc-800/60 pb-4 text-xs font-black tracking-widest text-zinc-400 uppercase">
                    Podsumowanie finansowe
                </h3>

                <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                            <Percent className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Rabat</span>
                            <span className="text-lg font-black text-zinc-100">{props.settlement.discount}%</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                            <Ticket className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Voucher</span>
                            <span className="text-lg font-black text-zinc-100">{Number(props.settlement.voucher).toFixed(2)} zł</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                            <Truck className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Dostawa</span>
                            <span className="text-lg font-black text-zinc-100">{Number(props.settlement.delivery).toFixed(2)} zł</span>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
                            <CreditCard className="h-4 w-4" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Transakcja</span>
                            <span className="text-lg font-black text-zinc-100">{Number(props.settlement.transaction).toFixed(2)} zł</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-zinc-800/40 pt-6 md:grid-cols-3">
                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Suma podstawowa</span>
                        <span className="text-lg font-black text-zinc-200">{totals.baseAmount.toFixed(2)} zł</span>
                    </div>
                    <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Po zniżkach</span>
                        <span className="text-lg font-black text-zinc-200">{totals.amountAfterDiscount.toFixed(2)} zł</span>
                    </div>
                    <div className="rounded-xl border border-[#ED1C24]/20 bg-[#ED1C24]/5 p-4">
                        <span className="mb-1 block text-[10px] font-bold tracking-widest text-[#ED1C24] uppercase">Suma końcowa</span>
                        <span className="text-lg font-black text-white">{totals.totalAmount.toFixed(2)} zł</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-[#121214]">
                <div className="border-b border-zinc-800/60 px-6 py-4">
                    <h3 className="text-xs font-black tracking-widest text-zinc-400 uppercase">Pozycje rozliczenia</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-zinc-800/60 bg-zinc-900/30">
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Użytkownik</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Kwota podstawowa</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Kwota po rabacie</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Do zapłaty</th>
                                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-zinc-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black tracking-widest text-zinc-500 uppercase">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                            {props.items.map((item) => {
                                const status = statusConfig[item.status];

                                return (
                                    <tr key={item.id} className="group transition-colors hover:bg-zinc-800/10">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <User className="h-4 w-4 text-zinc-500" />
                                                <span className="text-xs font-bold text-zinc-200">{item.user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-zinc-400">{Number(item.amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-zinc-400">{Number(item.discounted_amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-[#ED1C24]">{Number(item.final_amount).toFixed(2)} zł</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${status.classes}`}
                                            >
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {item.user_id === props.auth.user.id && item.status !== 'paid' && (
                                                <button
                                                    onClick={() => markAsPaid(item.id)}
                                                    disabled={payingItemId === item.id}
                                                    className="text-zinc-450 inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-bold tracking-widest uppercase transition-all hover:border-zinc-700 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
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
