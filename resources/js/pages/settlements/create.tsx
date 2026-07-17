import MainLayout from '@/layouts/Layout';
import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, Utensils, Percent, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';

interface OrderItem {
    id?: number;
    user_id: number;
    amount: number;
    discounted_amount?: number;
    final_amount?: number;
    status?: 'paid' | 'unpaid';
    created_by?: number;
    user?: {
        id: number;
        name: string;
    };
}

interface User {
    id: number;
    name: string;
}

interface CreateProps {
    users: User[];
}

function Create({ users }: CreateProps) {
    const [restaurantName, setRestaurantName] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [discount, setDiscount] = useState<number>(0);
    const [voucher, setVoucher] = useState<number>(0);
    const [delivery, setDelivery] = useState<number>(0);
    const [transaction, setTransaction] = useState<number>(0);

    const [temporaryItems, setTemporaryItems] = useState<OrderItem[]>([]);

    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [itemAmount, setItemAmount] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const baseAmount = temporaryItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const discountAmount = baseAmount * (discount / 100);
    const amountAfterDiscount = Math.max(0, baseAmount - discountAmount - voucher);
    const totalAmount = amountAfterDiscount + delivery + transaction;

    const availableUsers = users.filter((user) => !temporaryItems.some((item) => item.user_id === user.id));

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!selectedUserId) {
            setValidationError('Wybierz użytkownika z listy');
            return;
        }

        const parsedAmount = parseFloat(itemAmount.replace(',', '.'));

        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setValidationError('Podaj prawidłową kwotę zamówienia');
            return;
        }

        const user = users.find((u) => u.id === parseInt(selectedUserId));

        if (!user) {
            return;
        }

        const newItem: OrderItem = {
            user_id: user.id,
            amount: parsedAmount,
            user: {
                id: user.id,
                name: user.name,
            },
        };

        setTemporaryItems([...temporaryItems, newItem]);
        setSelectedUserId('');
        setItemAmount('');
    };

    const handleRemoveUser = (index: number) => {
        const newItems = [...temporaryItems];
        newItems.splice(index, 1);
        setTemporaryItems(newItems);
    };

    const handleSubmitOrder = () => {
        setValidationError(null);

        if (!restaurantName.trim()) {
            setValidationError('Nazwa restauracji jest wymagana');
            return;
        }

        if (temporaryItems.length === 0) {
            setValidationError('Dodaj przynajmniej jedną osobę do rozliczenia');
            return;
        }

        setSaving(true);

        const itemsWithCalculations = temporaryItems.map((item) => {
            const itemBase = parseFloat(item.amount.toString());
            const itemDiscount = itemBase * (discount / 100);
            const itemVoucher = voucher / temporaryItems.length;
            const itemDelivery = delivery / temporaryItems.length;
            const itemTransaction = transaction / temporaryItems.length;

            return {
                ...item,
                discounted_amount: Math.max(0, itemBase - itemDiscount - itemVoucher),
                final_amount: Math.max(0, itemBase - itemDiscount - itemVoucher) + itemDelivery + itemTransaction,
            };
        });

        router.post(
            route('settlements.store'),
            {
                restaurant_name: restaurantName,
                date: orderDate,
                items: itemsWithCalculations,
                discount,
                voucher,
                delivery,
                transaction,
            },
            {
                onSuccess: () => {
                    setTemporaryItems([]);
                    setRestaurantName('');
                },
                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <Head title="Nowe rozliczenie" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        href={route('settlements.index')}
                        className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase transition-colors hover:text-zinc-300"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Powrót do listy
                    </Link>
                    <h2 className="mt-2 text-xl font-black tracking-wider text-white uppercase">Nowe rozliczenie</h2>
                    <p className="mt-1 text-xs font-bold tracking-widest text-zinc-500 uppercase">Stwórz nowe rozliczenie i podziel koszty</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Główny formularz (Lewa kolumna) */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Karta 1: Podstawowe informacje */}
                    <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                        <h2 className="mb-5 flex items-center gap-2.5 text-xs font-black tracking-wider text-zinc-300 uppercase">
                            <Utensils className="h-4 w-4 text-[#ED1C24]" />
                            Informacje podstawowe
                        </h2>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Restauracja</label>
                                <input
                                    type="text"
                                    value={restaurantName}
                                    onChange={(e) => setRestaurantName(e.target.value)}
                                    placeholder="Wpisz nazwę lokalu..."
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Data zamówienia</label>
                                <input
                                    type="date"
                                    value={orderDate}
                                    onChange={(e) => setOrderDate(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Karta 2: Parametry finansowe */}
                    <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                        <h2 className="mb-5 flex items-center gap-2.5 text-xs font-black tracking-wider text-zinc-300 uppercase">
                            <Percent className="h-4 w-4 text-[#ED1C24]" />
                            Koszty dodatkowe i rabaty
                        </h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div>
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Rabat %</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Voucher zł</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={voucher || ''}
                                    onChange={(e) => setVoucher(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Dostawa zł</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={delivery || ''}
                                    onChange={(e) => setDelivery(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Prowizja zł</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={transaction || ''}
                                    onChange={(e) => setTransaction(Math.max(0, parseFloat(e.target.value) || 0))}
                                    placeholder="0.00"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Karta 3: Uczestnicy */}
                    <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                        <h2 className="mb-5 flex items-center gap-2.5 text-xs font-black tracking-wider text-zinc-300 uppercase">
                            <UserIcon className="h-4 w-4 text-[#ED1C24]" />
                            Uczestnicy zamówienia
                        </h2>

                        <form onSubmit={handleAddUser} className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="flex-1">
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Osoba</label>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-[#121214] px-4 py-3 text-sm text-zinc-300 transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                >
                                    <option value="" className="bg-[#121214]">
                                        Wybierz użytkownika...
                                    </option>
                                    {availableUsers.map((u) => (
                                        <option key={u.id} value={u.id} className="bg-[#121214]">
                                            {u.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-48">
                                <label className="mb-2 block text-[10px] font-black tracking-widest text-zinc-500 uppercase">Kwota</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={itemAmount}
                                        onChange={(e) => setItemAmount(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pr-10 pl-4 text-sm text-white transition outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-semibold text-zinc-500">
                                        zł
                                    </span>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] px-6 py-3 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-[#d1171e] active:scale-[0.98] sm:w-auto"
                            >
                                <Plus className="h-4 w-4" />
                                Dodaj
                            </button>
                        </form>

                        {/* Tabela pozycji tymczasowych */}
                        <div className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/20">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-zinc-800 bg-zinc-900/30 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Użytkownik</th>
                                            <th className="w-24 px-6 py-4 sm:w-32">Baza</th>
                                            <th className="w-24 px-6 py-4 sm:w-32">Po rabacie</th>
                                            <th className="w-28 px-6 py-4 sm:w-36">Suma końcowa</th>
                                            <th className="w-16 px-6 py-4 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/40">
                                        {temporaryItems.length > 0 ? (
                                            temporaryItems.map((item, index) => {
                                                const itemBase = parseFloat(item.amount.toString());
                                                const itemDiscount = itemBase * (discount / 100);
                                                const itemVoucher = voucher / temporaryItems.length;
                                                const itemDelivery = delivery / temporaryItems.length;
                                                const itemTransaction = transaction / temporaryItems.length;

                                                const discounted = Math.max(0, itemBase - itemDiscount - itemVoucher);
                                                const final = discounted + itemDelivery + itemTransaction;

                                                return (
                                                    <tr key={index} className="group transition-colors hover:bg-zinc-800/5">
                                                        <td className="truncate px-6 py-4 font-semibold text-zinc-300">
                                                            <div className="flex items-center gap-2.5">
                                                                <UserIcon className="h-3.5 w-3.5 text-zinc-500" />
                                                                {item.user?.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">{itemBase.toFixed(2)} zł</td>
                                                        <td className="px-6 py-4 font-mono text-xs text-zinc-400">{discounted.toFixed(2)} zł</td>
                                                        <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-500">
                                                            {final.toFixed(2)} zł
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveUser(index)}
                                                                className="p-1 text-zinc-500 transition-colors hover:text-red-500"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-xs font-medium text-zinc-500">
                                                    Brak dodanych osób do rozliczenia
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel podsumowania (Prawa kolumna - Sticky) */}
                <div className="space-y-6">
                    <div className="sticky top-6 space-y-4">
                        {validationError && (
                            <div className="flex items-start gap-2.5 rounded-2xl border border-red-950/50 bg-red-950/20 p-4 text-xs font-semibold text-red-400">
                                <AlertCircle className="h-5 w-5 shrink-0 text-[#ED1C24]" />
                                <span>{validationError}</span>
                            </div>
                        )}

                        <div className="rounded-2xl border border-zinc-800/60 bg-[#121214] p-6">
                            <h2 className="mb-6 text-xs font-black tracking-wider text-zinc-300 uppercase">Podsumowanie</h2>

                            <div className="space-y-4 border-b border-zinc-800/60 pb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-zinc-500">Suma podstawowa</span>
                                    <span className="font-mono font-bold text-zinc-300">{baseAmount.toFixed(2)} zł</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-zinc-500">Łączne zniżki</span>
                                    <span className="font-mono font-bold text-red-500">-{(discountAmount + voucher).toFixed(2)} zł</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-zinc-500">Koszty wspólne</span>
                                    <span className="font-mono font-bold text-zinc-300">+{(delivery + transaction).toFixed(2)} zł</span>
                                </div>
                            </div>

                            <div className="pt-6">
                                <div className="mb-6 flex items-baseline justify-between">
                                    <span className="text-xs font-black tracking-wider text-zinc-500 uppercase">Suma końcowa</span>
                                    <span className="font-mono text-2xl font-black text-emerald-500">{totalAmount.toFixed(2)} zł</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSubmitOrder}
                                    disabled={saving}
                                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-[#d1171e] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Zapisz i rozlicz
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Create.layout = (page: React.ReactNode) => <MainLayout children={page} title="Nowe rozliczenie" />;

export default Create;
