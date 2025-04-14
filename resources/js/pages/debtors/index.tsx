import { ReactNode, useState, useEffect } from 'react';
import Layout from '@/layouts/Layout';
import { router, usePage } from '@inertiajs/react';
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

function Debtors() {

    const { props } = usePage<PageProps>();
    const [orders, setOrders] = useState<Order[]>(props.orders || []);
    const [payingItemId] = useState<number | null>(null);

    console.log(props)

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

    const totalAmount = orders.reduce((sum, order) => sum + parseAmount(order.amount), 0);
    const paidAmount = paidOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0);
    const unpaidAmount = unpaidOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0);



    const columns = [
        {
            title: 'Numer zamówienia',
            dataIndex: ['order', 'uuid'],
            key: 'uuid',
            render: (uuid: string) => <Text strong>#{uuid}</Text>,
        },
        {
            title: 'Restauracja',
            dataIndex: ['order', 'restaurant_name'],
            key: 'restaurant_name',
            render: (restaurant_name: string) => <Text strong>{restaurant_name}</Text>,
        },
        {
            title: 'Kwota',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number | string | null) => (
                <Text type="secondary">{parseAmount(amount).toFixed(2)} zł</Text>
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
            title: 'Dłużnik',
            dataIndex: ['user', 'name'],
            key: 'user',
        },
        {
            title: 'Data utworzenia',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => formatDateTime(date),
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
                        locale={{
                            emptyText: 'Brak zamówień.',
                        }}
                    />
                </Card>
            </Space>
        </div>
    );
}

Debtors.layout = (page: ReactNode) => (
    <Layout children={page} title="Dłużnicy" />
);

export default Debtors;
