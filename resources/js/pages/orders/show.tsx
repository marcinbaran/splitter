import Layout from '@/layouts/Layout';
import { ReactNode, useState } from 'react';
import {
    Button,
    Table,
    Form,
    Input,
    Select,
    Typography,
    message,
    Card,
    Space,
    Statistic,
    Tag,
    Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, CheckOutlined } from '@ant-design/icons';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';

const { Option } = Select;
const { Title, Text } = Typography;

interface OrderItem {
    id: number;
    user_id: number;
    amount: number;
    status: 'paid' | 'unpaid';
    created_by: number;
    user?: {
        id: number;
        name: string;
    };
}

interface User {
    id: number;
    name: string;
}

interface Order {
    id: number;
    uuid: string;
    user: {
        name: string;
        phone: string;
    };
    total_amount?: number;
}

interface PageProps {
    order: Order;
    users: User[];
    items: OrderItem[];
    auth: {
        user: {
            id: number;
        };
    };
}

const OrderShow = () => {
    const { order, users: initialUsers, items: initialItems, auth } = usePage<PageProps>().props;
    const [form] = Form.useForm();
    const [orderItems] = useState<OrderItem[]>(initialItems || []);
    const [loading, setLoading] = useState(false);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    const totalAmount = orderItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);

    const onFinish = (values: { user_id: number; amount: string }) => {
        setLoading(true);

        Inertia.post(
            route('orders.items.store', { orderId: order.id }),
            {
                user_id: values.user_id,
                amount: parseFloat(values.amount),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Pozycja dodana pomyślnie');
                    form.resetFields();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas dodawania pozycji');
                },
                onFinish: () => {
                    setLoading(false);
                },
            }
        );
    };

    const removeItem = (id: number) => {
        Inertia.delete(
            route('orders.items.destroy', { id }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Pozycja usunięta pomyślnie');
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas usuwania pozycji');
                },
            }
        );
    };

    const markAsPaid = (itemId: number) => {
        setPayingItemId(itemId);
        Inertia.post(
            route('orders.items.markAsPaid', { id: itemId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Status pozycji zaktualizowany');
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas aktualizacji statusu');
                },
                onFinish: () => {
                    setPayingItemId(null);
                },
            }
        );
    };

    const columns = [
        {
            title: 'Użytkownik',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'Kwota',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <Text type="secondary">{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: OrderItem) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? 'Zapłacona' : 'Niezapłacona'}
                </Tag>
            ),
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (_: any, record: OrderItem) => (
                <Space>
                    {/* Przycisk "Opłać" widoczny tylko dla właściciela pozycji */}
                    {record.user_id === auth.user.id && record.status !== 'paid' && (
                        <Popconfirm
                            title="Czy na pewno chcesz oznaczyć tę pozycję jako opłaconą?"
                            onConfirm={() => markAsPaid(record.id)}
                            okText="Tak"
                            cancelText="Nie"
                        >
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={payingItemId === record.id}
                                size="small"
                            >
                                Opłać
                            </Button>
                        </Popconfirm>
                    )}

                    {/* Przycisk "Usuń" widoczny tylko dla twórcy pozycji */}
                    {record.created_by.id === auth.user.id && (
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeItem(record.id)}
                            loading={loading}
                            size="small"
                        />
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="order-show-container">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Order Header */}
                <Card>
                    <Title level={3} style={{ marginBottom: 24 }}>
                        Szczegóły zamówienia #{order.uuid}
                    </Title>

                    <Space size="large">
                        <Statistic
                            title="Łączna kwota"
                            value={totalAmount}
                            precision={2}
                            suffix="zł"
                            valueStyle={{ color: '#3f8600' }}
                        />

                        <Space direction="vertical" size="small">
                            <Text>
                                <UserOutlined style={{ marginRight: 8 }} />
                                <strong>Zamawiający:</strong> {order.user.name}
                            </Text>
                            <Text>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                <strong>Telefon:</strong> {order.user.phone}
                            </Text>
                        </Space>
                    </Space>
                </Card>

                {/* Add Item Form */}
                <Card title="Dodaj pozycję">
                    <Form
                        form={form}
                        layout="inline"
                        onFinish={onFinish}
                        style={{ marginBottom: 24 }}
                    >
                        <Form.Item
                            name="user_id"
                            rules={[{ required: true, message: 'Wybierz użytkownika' }]}
                            style={{ width: 250 }}
                        >
                            <Select
                                placeholder="Wybierz użytkownika"
                                loading={loading}
                                showSearch
                                optionFilterProp="children"
                            >
                                {initialUsers.map((user) => (
                                    <Option key={user.id} value={user.id}>
                                        {user.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            rules={[
                                { required: true, message: 'Podaj kwotę' },
                                {
                                    pattern: /^\d+(\.\d{1,2})?$/,
                                    message: 'Podaj poprawną kwotę (np. 10.50)',
                                },
                            ]}
                            normalize={(value) => value.replace(',', '.')}
                            style={{ width: 200 }}
                        >
                            <Input
                                placeholder="Kwota"
                                suffix="zł"
                                disabled={loading}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<PlusOutlined />}
                                loading={loading}
                            >
                                Dodaj
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                {/* Order Items Table */}
                <Card title="Pozycje zamówienia">
                    <Table
                        columns={columns}
                        dataSource={orderItems}
                        rowKey="id"
                        pagination={false}
                        loading={loading}
                        bordered
                        locale={{
                            emptyText: 'Brak pozycji. Dodaj pierwszą pozycję zamówienia.',
                        }}
                    />
                </Card>
            </Space>
        </div>
    );
};

OrderShow.layout = (page: ReactNode) => (
    <Layout children={page} title="Szczegóły zamówienia" />
);

export default OrderShow;
