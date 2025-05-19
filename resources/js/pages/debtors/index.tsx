import Layout from '@/layouts/Layout';
import { PhoneOutlined, UserOutlined } from '@ant-design/icons';
import { Link, usePage } from '@inertiajs/react';
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography } from 'antd';
import { ReactNode, useEffect, useState } from 'react';

const { Title, Text } = Typography;

interface Order {
    id: number;
    amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    user_id: number;
    order?: {
        restaurant_name: string;
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

    const unpaidOrders = orders.filter((order) => order.status === 'unpaid');
    const totalAmount = orders.reduce((sum, order) => sum + parseAmount(order.amount), 0);
    const unpaidAmount = unpaidOrders.reduce((sum, order) => sum + parseAmount(order.amount), 0);

    const columns = [
        {
            title: 'Numer zamówienia',
            dataIndex: ['order', 'uuid'],
            key: 'uuid',
            render: (uuid: string, record: Order) => (
                <Link href={route('orders.show', { orderId: record.id })}>
                    <Text strong className="text-blue-500 hover:text-blue-600 transition-colors">
                        #{uuid}
                    </Text>
                </Link>
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['order', 'restaurant_name'],
            key: 'restaurant_name',
            render: (restaurant_name: string) => <Text className="font-medium">{restaurant_name}</Text>,
        },
        {
            title: 'Kwota',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number | string | null) => (
                <Text className="text-gray-600">{parseAmount(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: () => (
                <Tag color="orange" className="rounded-full px-3 py-1">
                    Niezapłacone
                </Tag>
            ),
        },
        {
            title: 'Dłużnik',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (name: string) => <Text className="text-gray-600">{name}</Text>,
        },
        {
            title: 'Data utworzenia',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Text className="text-gray-500">{formatDateTime(date)}</Text>,
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size={24} className="w-full">
                <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <Title level={3} className="m-0 text-2xl font-bold text-gray-800">
                            Dłużnicy
                        </Title>
                        {orders[0]?.order?.user && (
                            <div className="mt-4 md:mt-0 space-y-2">
                                <div className="flex items-center text-gray-700">
                                    <UserOutlined className="mr-2 text-orange-500" />
                                    <span className="font-medium">Zamawiajający:</span>
                                    <span className="ml-1">{orders[0].order.user.name}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <PhoneOutlined className="mr-2 text-orange-500" />
                                    <span className="font-medium">Telefon:</span>
                                    <span className="ml-1">{orders[0].order.user.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Łączna kwota"
                                    value={totalAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#faad14' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Niezapłacone"
                                    value={unpaidOrders.length}
                                    valueStyle={{ color: '#fa8c16' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Kwota niezapłacona"
                                    value={unpaidAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#fa541c' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title={<span className="text-lg font-semibold text-gray-800">Lista dłużników</span>}
                    className="rounded-xl shadow-sm border-0"
                    styles={{header: {borderBottom: '1px solid #f0f0f0'}}}
                >
                    <Table
                        columns={columns}
                        dataSource={unpaidOrders}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: false,
                            className: 'px-4 py-2'
                        }}
                        bordered
                        scroll={{ x: 'max-content' }}
                        locale={{
                            emptyText: 'Brak niezapłaconych zamówień.',
                        }}
                        className="rounded-lg overflow-hidden"
                        rowClassName="hover:bg-orange-50 transition-colors"
                    />
                </Card>
            </Space>
        </div>
    );
}

Debtors.layout = (page: ReactNode) => <Layout children={page} title="Dłużnicy" />;

export default Debtors;
