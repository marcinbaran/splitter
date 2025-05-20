import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Usuń wszystko co nie jest cyfrą
        const value = e.target.value.replace(/\D/g, '');
        setData('phone', value);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 px-4">
            <Head title="Register" />
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Utwórz swoje konto</h2>
                    <p className="text-gray-500 dark:text-gray-400">Dołącz do nas !</p>
                </div>

                <form className="space-y-6" onSubmit={submit}>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Imię i nazwisko</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Adam Nowak"
                            className="rounded-lg h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="rounded-lg h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Numer telefonu</Label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500 dark:text-gray-400">+48</span>
                            </div>
                            <Input
                                id="phone"
                                type="tel"
                                required
                                value={data.phone}
                                onChange={handlePhoneChange}
                                disabled={processing}
                                placeholder="123456789"
                                className="rounded-lg h-11 pl-12 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                maxLength={9}
                            />
                        </div>
                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Hasło</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Hasło"
                            className="rounded-lg h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-gray-700 dark:text-gray-300">Powtórz hasło</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Powtórz hasło"
                            className="rounded-lg h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        {processing ? 'Tworzenie konta...' : 'Utwórz konto'}
                    </Button>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Masz już konto?{' '}
                        <TextLink
                            href={route('login')}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
                        >
                            Zaloguj się
                        </TextLink>
                    </div>
                </form>
            </div>
        </div>
    );
}
