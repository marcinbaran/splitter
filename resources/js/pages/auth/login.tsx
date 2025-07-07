import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button, Checkbox, Form, Input, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 px-4">
            <Head title="Log in" />
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Witaj !</h2>
                    <p className="text-gray-500 dark:text-gray-400">Zaloguj się na swoje konto</p>
                </div>

                {status && (
                    <Alert
                        message={status}
                        type="success"
                        className="mb-6 text-sm dark:border-gray-600"
                        showIcon
                        closable
                    />
                )}

                <form onSubmit={submit} className="space-y-6">
                    <Form.Item
                        label={<span className="text-gray-700 dark:text-gray-300">Email</span>}
                        validateStatus={errors.email ? 'error' : ''}
                        help={errors.email}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Input
                            size="large"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                            autoComplete="email"
                            required
                            className="rounded-lg h-11 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span className="dark:text-gray-300">Hasło</span>}
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Input.Password
                            size="large"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                            className="rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                    </Form.Item>

                    <div className="flex justify-between items-center">
                        <Checkbox
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="[&>.ant-checkbox+span]:text-gray-600 [&>.ant-checkbox+span]:dark:text-gray-300"
                        >
                            Zapamiętaj mnie
                        </Checkbox>
                        {/*{canResetPassword && (*/}
                        {/*    <a*/}
                        {/*        href={route('password.request')}*/}
                        {/*        className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline transition-colors"*/}
                        {/*    >*/}
                        {/*        Zapomniałeś hasła?*/}
                        {/*    </a>*/}
                        {/*)}*/}
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        block
                        disabled={processing}
                        icon={processing ? <LoadingOutlined spin /> : undefined}
                        className="mt-6 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                    >
                        {processing ? 'Logowanie...' : 'Zaloguj się'}
                    </Button>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Nie masz konta?{' '}
                        <a
                            href={route('register')}
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline transition-colors"
                        >
                            Zarejestruj się
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
