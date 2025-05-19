import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button, Checkbox, Form, Input, Typography, Alert } from 'antd';
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

export default function Login({ status, canResetPassword }: LoginProps) {
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
            <Head title="Log in" />
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all hover:shadow-2xl">
                <div className="text-center mb-8">
                    <Typography.Title level={2} className="!mb-2 !text-indigo-600">
                        Witaj !
                    </Typography.Title>
                    <Typography.Paragraph className="text-gray-500">
                        Zaloguj się na swoje konto
                    </Typography.Paragraph>
                </div>

                {status && (
                    <Alert
                        message={status}
                        type="success"
                        className="mb-6 text-sm"
                        showIcon
                        closable
                    />
                )}

                <form onSubmit={submit} className="space-y-6">
                    <Form.Item
                        label="Email"
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
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Hasło"
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
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <div className="flex justify-between items-center">
                        <Checkbox
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="text-gray-600"
                        >
                            Zapamiętaj mnie
                        </Checkbox>
                        {/*{canResetPassword && (*/}
                        {/*    <a*/}
                        {/*        href={route('password.request')}*/}
                        {/*        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"*/}
                        {/*    >*/}
                        {/*        Forgot password?*/}
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
                        className="mt-6 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        {processing ? 'Logowanie...' : 'Zaloguj się'}
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-6">
                        Nie masz konta?{' '}
                        <a
                            href={route('register')}
                            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors"
                        >
                            Zarejestruj się
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
