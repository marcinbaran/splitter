import { ReactNode, useState, useEffect } from 'react';
import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Table, Typography, Card, Space, Statistic, Tag, Row, Col, Popconfirm, Button, message, Checkbox } from 'antd';
import { CheckOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Order {
    id: number;
    order_id: number;
    amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    final_amount: number;
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
        id: number;
    };
    user?: {
        name: string;
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

interface GroupedOrders {
    created_by: {
        id: number;
        name: string;
    };
    orders: Order[];
    totalAmount: number;
    allUnpaid: boolean;
    selected: boolean;
}

const MyOrders = () => {
    const { props } = usePage<PageProps>();
    const [orders, setOrders] = useState<Order[]>(props.orders || []);
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrders[]>([]);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);

    useEffect(() => {
        setOrders(props.orders || []);
    }, [props.orders]);

    useEffect(() => {
        if (orders.length > 0) {
            const grouped = orders.reduce((acc: GroupedOrders[], order) => {
                const createdById = order.created_by?.id || 0;
                const createdByName = order.created_by?.name || 'Nieznany';

                const existingGroup = acc.find(group => group.created_by.id === createdById);

                if (existingGroup) {
                    existingGroup.orders.push(order);
                    existingGroup.totalAmount += parseAmount(order.final_amount);
                    existingGroup.allUnpaid = existingGroup.orders.every(o => o.status === 'unpaid');
                } else {
                    acc.push({
                        created_by: {
                            id: createdById,
                            name: createdByName
                        },
                        orders: [order],
                        totalAmount: parseAmount(order.final_amount),
                        allUnpaid: order.status === 'unpaid',
                        selected: false
                    });
                }
                return acc;
            }, []);

            setGroupedOrders(grouped);
        }
    }, [orders]);

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
        router.reload({ only: ['orders'] });
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

    const markGroupAsPaid = (groupId: number) => {
        setPayingGroupId(groupId);
        const group = groupedOrders.find(g => g.created_by.id === groupId);
        if (!group) return;

        const unpaidOrderIds = group.orders
            .filter(order => order.status === 'unpaid')
            .map(order => order.id);

        if (unpaidOrderIds.length === 0) {
            message.warning('Brak niezapłaconych zamówień w tej grupie');
            setPayingGroupId(null);
            return;
        }

        router.post(
            route('orders.items.bulkMarkAsPaid'),
            { order_ids: unpaidOrderIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success(`Opłacono ${unpaidOrderIds.length} zamówień`);
                    refreshItems();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas aktualizacji statusów');
                },
                onFinish: () => {
                    setPayingGroupId(null);
                },
            }
        );
    };

    const toggleGroupSelection = (groupId: number) => {
        setGroupedOrders(prev => prev.map(group =>
            group.created_by.id === groupId
                ? { ...group, selected: !group.selected }
                : group
        ));
    };

    const columns = [
        {
            title: 'Numer zamówienia',
            dataIndex: ['order', 'uuid'],
            key: 'uuid',
            render: (uuid: string, record: Order) => (
                <Link href={route('orders.show', { orderId: record.order_id })}>
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
            dataIndex: 'final_amount',
            key: 'final_amount',
            render: (final_amount: number | string | null) => (
                <Text className="text-gray-600">{parseAmount(final_amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: Order) => (
                <Tag
                    color={status === 'paid' ? 'green' : 'orange'}
                    className="rounded-full px-3 py-1"
                >
                    {status === 'paid' ? `Zapłacone - ${formatDateTime(record.paid_at || record.created_at)}` : 'Niezapłacone'}
                </Tag>
            ),
        },
        {
            title: 'Data utworzenia',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date: string) => <Text className="text-gray-500">{formatDateTime(date)}</Text>,
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
                            okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-600' }}
                        >
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={payingItemId === record.id}
                                size="small"
                                className="flex items-center bg-green-500 hover:bg-green-600 border-green-500"
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
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size={24} className="w-full">
                <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <Title level={3} className="m-0 text-2xl font-bold text-gray-800">
                            Moje zamówienia
                        </Title>
                        {orders[0]?.order?.user && (
                            <div className="mt-4 md:mt-0 space-y-2">
                                <div className="flex items-center text-gray-700">
                                    <UserOutlined className="mr-2 text-blue-500" />
                                    <span className="font-medium">Zamawiajający:</span>
                                    <span className="ml-1">{orders[0].order.user.name}</span>
                                </div>
                                <div className="flex items-center text-gray-700">
                                    <PhoneOutlined className="mr-2 text-blue-500" />
                                    <span className="font-medium">Telefon:</span>
                                    <span className="ml-1">{orders[0].order.user.phone}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Row gutter={[16, 16]} justify="center" className="w-full">
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Łączna kwota"
                                    value={totalAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#3f8600' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Zapłacone"
                                    value={paidOrders.length}
                                    suffix={`/ ${orders.length}`}
                                    valueStyle={{ color: '#52c41a' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Kwota zapłacona"
                                    value={paidAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#52c41a' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Niezapłacone"
                                    value={unpaidOrders.length}
                                    valueStyle={{ color: '#faad14' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Kwota niezapłacona"
                                    value={unpaidAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#faad14' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title={<span className="text-lg font-semibold text-gray-800">Lista zamówień</span>}
                    className="rounded-xl shadow-sm border-0"
                    styles={{
                        header: {borderBottom: '1px solid #f0f0f0'}
                    }}
                >
                    {groupedOrders.map(group => (
                        <div key={group.created_by.id} className="mb-6">
                            <div className="flex justify-between items-center mb-2 p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <Text strong className="text-lg mr-2">
                                        {group.created_by.name}
                                    </Text>
                                    <Tag color="blue" className="ml-2">
                                        Łącznie: {group.totalAmount.toFixed(2)} zł
                                    </Tag>
                                    <Tag color="green" className="ml-2">
                                        Zapłacone: {group.orders
                                        .filter(o => o.status === 'paid')
                                        .reduce((sum, o) => sum + parseAmount(o.final_amount), 0)
                                        .toFixed(2)} zł
                                    </Tag>
                                    <Tag color="orange" className="ml-2">
                                        Niezapłacone: {group.orders
                                        .filter(o => o.status === 'unpaid')
                                        .reduce((sum, o) => sum + parseAmount(o.final_amount), 0)
                                        .toFixed(2)} zł
                                    </Tag>

                                </div>

                                {group.orders.some(order => order.status === 'unpaid') && (
                                    <Popconfirm
                                        title={`Czy na pewno chcesz oznaczyć niezapłacone zamówienia ${group.created_by.name} jako opłacone?`}
                                        onConfirm={() => markGroupAsPaid(group.created_by.id)}
                                        okText="Tak"
                                        cancelText="Nie"
                                        okButtonProps={{ className: 'bg-blue-500 hover:bg-blue-600' }}
                                    >
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            loading={payingGroupId === group.created_by.id}
                                            size="small"
                                            className="flex items-center bg-green-500 hover:bg-green-600 border-green-500"
                                        >
                                            Opłać nieopłacone
                                        </Button>
                                    </Popconfirm>
                                )}
                            </div>
                            <Table
                                columns={columns}
                                dataSource={group.orders}
                                rowKey="id"
                                pagination={false}
                                bordered
                                scroll={{ x: 'max-content' }}
                                className="rounded-lg overflow-hidden"
                                rowClassName="hover:bg-blue-50 transition-colors"
                            />
                        </div>
                    ))}
                </Card>
            </Space>
        </div>
    );
};

MyOrders.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje zamówienia" />
);

export default MyOrders;
