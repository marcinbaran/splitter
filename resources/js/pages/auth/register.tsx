import InputError from '@/components/input-error';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
        const value = e.target.value.replace(/\D/g, '');
        setData('phone', value);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-12 text-white selection:bg-[#ED1C24] selection:text-white">
            <Head title="Zarejestruj się" />

            <div className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#ED1C24]/10 blur-[150px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-[150px]" />

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800/80 bg-[#121214] p-8 shadow-2xl transition-all duration-300 hover:border-zinc-700/50 md:p-10">
                <div className="mb-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <img
                            src="logo.png"
                            alt="Logo"
                            className="h-12 w-auto object-contain drop-shadow-[0_4px_20px_rgba(237,28,36,0.25)] transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase md:text-3xl">Utwórz konto</h2>
                    <p className="mt-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase md:text-sm">Dołącz do nas już teraz</p>
                </div>

                <form className="space-y-5" onSubmit={submit}>
                    <div>
                        <label htmlFor="name" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Imię i nazwisko
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="name"
                                type="text"
                                required
                                autoFocus
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                disabled={processing}
                                placeholder="Adam Nowak"
                                className={`h-12 w-full rounded-xl border bg-zinc-900/50 pr-4 pl-12 text-white placeholder-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none ${
                                    errors.name
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#ED1C24]'
                                }`}
                            />
                        </div>
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Adres Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                    />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                disabled={processing}
                                placeholder="nazwa@domena.pl"
                                className={`h-12 w-full rounded-xl border bg-zinc-900/50 pr-4 pl-12 text-white placeholder-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none ${
                                    errors.email
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#ED1C24]'
                                }`}
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="phone" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Numer telefonu
                        </label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <span className="border-r border-zinc-800 pr-2 text-sm font-bold tracking-wide text-zinc-500">+48</span>
                            </div>
                            <input
                                id="phone"
                                type="tel"
                                required
                                value={data.phone}
                                onChange={handlePhoneChange}
                                disabled={processing}
                                placeholder="123 456 789"
                                maxLength={9}
                                className={`h-12 w-full rounded-xl border bg-zinc-900/50 pr-4 pl-16 text-white placeholder-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none ${
                                    errors.phone
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#ED1C24]'
                                }`}
                            />
                        </div>
                        <InputError message={errors.phone} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Hasło
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="password"
                                type="password"
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className={`h-12 w-full rounded-xl border bg-zinc-900/50 pr-4 pl-12 text-white placeholder-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none ${
                                    errors.password
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#ED1C24]'
                                }`}
                            />
                        </div>
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Powtórz hasło
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </span>
                            <input
                                id="password_confirmation"
                                type="password"
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                                placeholder="••••••••"
                                className={`h-12 w-full rounded-xl border bg-zinc-900/50 pr-4 pl-12 text-white placeholder-zinc-600 transition-all duration-200 focus:ring-2 focus:ring-[#ED1C24]/20 focus:outline-none ${
                                    errors.password_confirmation
                                        ? 'border-red-500 focus:border-red-500'
                                        : 'border-zinc-800 hover:border-zinc-700 focus:border-[#ED1C24]'
                                }`}
                            />
                        </div>
                        <InputError message={errors.password_confirmation} className="mt-1.5" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ED1C24] text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-red-950/20 transition-all duration-200 hover:bg-white hover:text-black active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Tworzenie konta...
                            </>
                        ) : (
                            'Utwórz konto'
                        )}
                    </button>

                    <div className="mt-6 text-center">
                        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Masz już konto? </span>
                        <a
                            href={route('login')}
                            className="text-xs font-bold tracking-widest text-white uppercase transition-colors duration-200 hover:text-[#ED1C24]"
                        >
                            Zaloguj się
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
