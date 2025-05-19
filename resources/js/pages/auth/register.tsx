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
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Head title="Register" />
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-indigo-600 mb-2">Utwórz swoje konto</h2>
                    <p className="text-gray-500">Dołącz do nas !</p>
                </div>

                <form className="space-y-6" onSubmit={submit}>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Imię i nazwisko</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Adam Nowak"
                            className="rounded-lg h-11"
                        />
                        <InputError message={errors.name} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="rounded-lg h-11"
                        />
                        <InputError message={errors.email} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">Hasło</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Hasło"
                            className="rounded-lg h-11"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className="text-gray-700">Powtórz hasło</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Powtórz hasło"
                            className="rounded-lg h-11"
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white"
                        disabled={processing}
                    >
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                        {processing ? 'Tworzenie konta...' : 'Utwórz konto'}
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        Masz już konto?{' '}
                        <TextLink
                            href={route('login')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                        >
                            Zaloguj się
                        </TextLink>
                    </div>
                </form>
            </div>
        </div>
    );
}
