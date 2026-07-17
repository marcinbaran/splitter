import InputError from '@/components/input-error';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 text-white selection:bg-[#ED1C24] selection:text-white">
            <Head title="Resetuj hasło" />

            <div className="pointer-events-none absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#ED1C24]/10 blur-[150px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-white/5 blur-[150px]" />

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-zinc-800/80 bg-[#121214] p-8 shadow-2xl transition-all duration-300 hover:border-zinc-700/50 md:p-10">
                <div className="mb-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <img
                            src="../logo.png"
                            alt="Logo"
                            className="h-12 w-auto object-contain drop-shadow-[0_4px_20px_rgba(237,28,36,0.25)] transition-transform duration-300 hover:scale-105"
                        />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-white uppercase md:text-3xl">Ustaw nowe hasło</h2>
                    <p className="mt-2 text-xs font-semibold tracking-widest text-zinc-400 uppercase md:text-sm">
                        Wprowadź swoje nowe dane dostępowe
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="mb-2 block text-xs font-bold tracking-widest text-zinc-500 uppercase">
                            Adres Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-600">
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
                                name="email"
                                autoComplete="email"
                                value={data.email}
                                readOnly
                                onChange={(e) => setData('email', e.target.value)}
                                className="h-12 w-full cursor-not-allowed rounded-xl border border-zinc-900 bg-zinc-950/40 pr-4 pl-12 text-zinc-500 focus:outline-none"
                            />
                        </div>
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                            Nowe hasło
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
                                name="password"
                                autoComplete="new-password"
                                value={data.password}
                                autoFocus
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                                required
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
                            Potwierdź nowe hasło
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
                                name="password_confirmation"
                                autoComplete="new-password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder="••••••••"
                                required
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
                                Zmienianie hasła...
                            </>
                        ) : (
                            'Zresetuj hasło'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
