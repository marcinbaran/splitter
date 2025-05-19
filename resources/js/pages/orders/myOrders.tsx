import { ReactNode, useState, useEffect } from 'react';
import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Table, Typography, Card, Space, Statistic, Tag, Row, Col, Popconfirm, Button, message } from 'antd';
import { CheckOutlined, DeleteOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Order {
    id: number;
    amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    user_id: number;
    order?: {
        restaurant_name: string,
        uuid: string;
        user?: {
            name: string;
            phone: string;
        };
    };
    created_by?: {
        name: string;
    };
    user?: {
        name: string;
        phone: string;
    };
}

interface PageProps {
    orders: Order[];
    auth: {
        user: {
            id: number;
        };
    };
}

const MyOrders = () => {
    const { props } = usePage<PageProps>();
    const [orders, setOrders] = useState<Order[]>(props.orders || []);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    useEffect(() => {
        setOrders(props.orders || []);
    }, [props.orders]);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const paidOrders = orders.filter(order => order.status === 'paid');
    const unpaidOrders = orders.filter(order => order.status === 'unpaid');

    const totalAmount = orders.reduce((sum, order) => sum + parseAmount(order.final_amount), 0);
    const paidAmount = paidOrders.reduce((sum, order) => sum + parseAmount(order.final_amount), 0);
    const unpaidAmount = unpaidOrders.reduce((sum, order) => sum + parseAmount(order.final_amount), 0);

    const refreshItems = () => {
        router.reload({ only: ['orders'], preserveScroll: true });
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
            title: 'Numer zamówienia',
            dataIndex: ['order', 'uuid'],
            key: 'uuid',
            render: (uuid: string, record: Order) => (
                <Link href={route('orders.show', { orderId: record.order_id })}>
                    <Text strong style={{ color: '#1890ff', transition: 'color 0.3s' }} className="hover:text-blue-600">
                        #{uuid}
                    </Text>
                </Link>
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['order', 'restaurant_name'],
            key: 'restaurant_name',
            render: (restaurant_name: string) => <Text strong>{restaurant_name}</Text>,
        },
        {
            title: 'Kwota',
            dataIndex: 'final_amount',
            key: 'final_amount',
            render: (final_amount: number | string | null) => (
                <Text type="secondary">{parseAmount(final_amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Order) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? `Zapłacone - ${formatDateTime(record.paid_at || record.created_at)}` : 'Niezapłacone'}
                </Tag>
            ),
        },
        {
            title: 'Utworzone przez',
            dataIndex: ['created_by', 'name'],
            key: 'created_by',
        },
        {
            title: 'Data utworzenia',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDateTime(date),
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (record: Order) => (
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
                </Space>
            ),
        },
    ];

    return (
        <div className="my-orders-container">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Title level={3} style={{ marginBottom: 24 }}>
                        Moje zamówienia
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
                                value={paidOrders.length}
                                suffix={`/ ${orders.length}`}
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
                                value={unpaidOrders.length}
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
                                {orders[0]?.order?.user && (
                                    <>
                                        <Text>
                                            <UserOutlined style={{ marginRight: 8 }} />
                                            <strong>Zamawiający:</strong> {orders[0].order.user.name}
                                        </Text>
                                        <Text>
                                            <PhoneOutlined style={{ marginRight: 8 }} />
                                            <strong>Telefon:</strong> {orders[0].order.user.phone}
                                        </Text>
                                    </>
                                )}
                            </Space>
                        </Col>
                    </Row>
                </Card>

                <Card title="Lista zamówień">
                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        bordered
                        scroll={ {x: 'max-content'}}
                        locale={{
                            emptyText: 'Brak zamówień.',
                        }}
                    />
                </Card>
            </Space>
        </div>
    );
};

MyOrders.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje zamówienia" />
);

export default MyOrders;
