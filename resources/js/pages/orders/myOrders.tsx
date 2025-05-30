import { useEffect, useState, ReactNode } from 'react';
import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Table, Typography, Card, Space, Tag, Popconfirm, Button, message } from 'antd';
import { CheckOutlined} from '@ant-design/icons';

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
        restaurant_name: string;
        date?: string,
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

interface PageProps {
    groupedOrders: {
        created_by: {
            id: number;
            name: string;
        };
        orders: Order[];
    }[];
}

const MyOrders = () => {
    const { props } = usePage<PageProps>();
    const [groupedOrders, setGroupedOrders] = useState<GroupedOrders[]>([]);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    useEffect(() => {
        const transformed = props.groupedOrders.map(group => {
            const totalAmount = group.orders.reduce((sum, order) => sum + parseAmount(order.final_amount), 0);
            const allUnpaid = group.orders.every(order => order.status === 'unpaid');
            return {
                ...group,
                totalAmount,
                allUnpaid,
                selected: false,
            };
        });

        setGroupedOrders(transformed);
    }, [props.groupedOrders]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL'); // Tylko data
    };

    const markAsPaid = (itemId: number) => {
        setPayingItemId(itemId);
        router.post(route('orders.items.markAsPaid', { id: itemId }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Status pozycji zaktualizowany');
                router.reload({ only: ['groupedOrders'] });
            },
            onError: () => {
                message.error('Błąd podczas aktualizacji');
            },
            onFinish: () => setPayingItemId(null),
        });
    };

    const markGroupAsPaid = (groupId: number) => {
        setPayingGroupId(groupId);
        const group = groupedOrders.find(g => g.created_by.id === groupId);
        if (!group) return;

        const unpaidOrderIds = group.orders.filter(order => order.status === 'unpaid').map(order => order.id);

        if (unpaidOrderIds.length === 0) {
            message.warning('Brak niezapłaconych zamówień w tej grupie');
            setPayingGroupId(null);
            return;
        }

        router.post(route('orders.items.bulkMarkAsPaid'), { order_ids: unpaidOrderIds }, {
            preserveScroll: true,
            onSuccess: () => {
                message.success(`Opłacono ${unpaidOrderIds.length} zamówień`);
                router.reload({ only: ['groupedOrders'] });
            },
            onError: () => {
                message.error('Błąd przy aktualizacji');
            },
            onFinish: () => setPayingGroupId(null),
        });
    };

    const columns = [
        {
            title: 'Numer zamówienia',
            dataIndex: ['order', 'uuid'],
            render: (uuid: string, record: Order) => (
                <Link href={route('orders.show', { orderId: record.order_id })}>
                    <Text strong className="text-blue-500 hover:text-blue-600">#{uuid}</Text>
                </Link>
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['order', 'restaurant_name'],
            render: (name: string) => <Text className="font-medium">{name}</Text>,
        },
        {
            title: 'Data zamówienia',
            render: (record: Order) => (
                <Text className="text-gray-500">
                    {formatDateTime(record.order?.date || record.created_at)}
                </Text>
            ),
        },
        {
            title: 'Kwota',
            dataIndex: 'final_amount',
            render: (amount: number | string | null) => (
                <Text className="text-gray-600">{parseAmount(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: string, record: Order) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? `Zapłacone - ${formatDateTime(record.paid_at || record.created_at)}` : 'Niezapłacone'}
                </Tag>
            ),
        },
        // {
        //     title: 'Data',
        //     dataIndex: 'created_at',
        //     render: (date: string) => <Text className="text-gray-500">{formatDateTime(date)}</Text>,
        // },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (record: Order) => (
                <Space>
                    {record.status !== 'paid' && (
                        <Popconfirm
                            title="Oznaczyć jako opłacone?"
                            onConfirm={() => markAsPaid(record.id)}
                            okText="Tak"
                            cancelText="Nie"
                        >
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={payingItemId === record.id}
                                size="small"
                                className="bg-green-500 border-green-500"
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
                <Title level={3}>Moje zamówienia</Title>
                {groupedOrders.map(group => (
                    <Card
                        key={group.created_by.id}
                        title={
                            <div className="flex justify-between items-center">
                                <div>
                                    <Text strong>{group.created_by.name}</Text>
                                    <Tag color="blue" className="ml-2">
                                        Łącznie: {group.totalAmount.toFixed(2)} zł
                                    </Tag>
                                </div>
                                {group.orders.some(o => o.status === 'unpaid') && (
                                    <Popconfirm
                                        title={`Opłacić wszystkie niezapłacone od ${group.created_by.name}?`}
                                        onConfirm={() => markGroupAsPaid(group.created_by.id)}
                                        okText="Tak"
                                        cancelText="Nie"
                                    >
                                        <Button
                                            icon={<CheckOutlined />}
                                            loading={payingGroupId === group.created_by.id}
                                            size="small"
                                            className="bg-green-500 border-green-500"
                                        >
                                            Opłać nieopłacone
                                        </Button>
                                    </Popconfirm>
                                )}
                            </div>
                        }
                        className="rounded-xl shadow-sm"
                    >
                        <Table
                            columns={columns}
                            dataSource={group.orders}
                            rowKey="id"
                            pagination={false}
                            bordered
                        />
                    </Card>
                ))}
            </Space>
        </div>
    );
};

MyOrders.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje zamówienia" />
);

export default MyOrders;
