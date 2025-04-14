import Layout from '@/layouts/Layout';
import { ReactNode, useState, useEffect } from 'react';
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
    Popconfirm,
    Row,
    Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, CheckOutlined } from '@ant-design/icons';
import { usePage, router } from '@inertiajs/react';

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
    createdBy?: {
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
    const { props } = usePage<PageProps>();
    const [form] = Form.useForm();
    const [items, setItems] = useState<OrderItem[]>(props.items || []);
    const [loading, setLoading] = useState(false);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    useEffect(() => {
        setItems(props.items || []);
    }, [props.items]);

    const totalAmount = items.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const paidItems = items.filter(item => item.status === 'paid');
    const unpaidItems = items.filter(item => item.status === 'unpaid');

    const paidItemsCount = paidItems.length;
    const unpaidItemsCount = unpaidItems.length;
    const paidAmount = paidItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const unpaidAmount = unpaidItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);

    const refreshItems = () => {
        router.reload({ only: ['items'], preserveScroll: true });
    };

    const onFinish = (values: { user_id: number; amount: string }) => {
        setLoading(true);

        router.post(
            route('orders.items.store', { orderId: props.order.id }),
            {
                user_id: values.user_id,
                amount: parseFloat(values.amount),
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Pozycja dodana pomyślnie');
                    form.resetFields();
                    refreshItems();
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
        router.delete(
            route('orders.items.destroy', { id }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Pozycja usunięta pomyślnie');
                    refreshItems();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas usuwania pozycji');
                },
            }
        );
    };

    const markAsPaid = (itemId: number) => {
        setPayingItemId(itemId);
        router.post(
            route('orders.items.markAsPaid', { id: itemId }),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Status pozycji zaktualizowany');
                    refreshItems();
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
                    {status === 'paid' ? 'Zapłacona - ' + record.paid_at : 'Niezapłacona'}
                </Tag>
            ),
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (_: any, record: OrderItem) => (
                <Space>
                    {record.user_id === props.auth.user.id && record.status !== 'paid' && (
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

                    {record.created_by === props.auth.user.id && (
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
                <Card>
                    <Title level={3} style={{ marginBottom: 24 }}>
                        Szczegóły zamówienia #{props.order.uuid}
                    </Title>

                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={4}>
                            <Statistic
                                title="Łączna kwota"
                                value={totalAmount}
                                precision={2}
                                suffix="zł"
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Statistic
                                title="Zapłacone"
                                value={paidItemsCount}
                                suffix={`/ ${items.length}`}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Statistic
                                title="Kwota zapłacona"
                                value={paidAmount}
                                precision={2}
                                suffix="zł"
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Statistic
                                title="Niezapłacone"
                                value={unpaidItemsCount}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4}>
                            <Statistic
                                title="Kwota niezapłacona"
                                value={unpaidAmount}
                                precision={2}
                                suffix="zł"
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={4}>
                            <Space direction="vertical" size="small">
                                <Text>
                                    <UserOutlined style={{ marginRight: 8 }} />
                                    <strong>Zamawiający:</strong> {props.order.user.name}
                                </Text>
                                <Text>
                                    <PhoneOutlined style={{ marginRight: 8 }} />
                                    <strong>Telefon:</strong> {props.order.user.phone}
                                </Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>

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
                                {props.users.map((user) => (
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

                <Card title="Pozycje zamówienia">
                    <Table
                        columns={columns}
                        dataSource={items}
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
