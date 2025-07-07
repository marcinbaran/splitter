import { useEffect, useState, ReactNode } from 'react';
import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Table, Typography, Card, Space, Tag, Popconfirm, Button, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Settlement {
    id: number;
    settlement_id: number;
    amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    final_amount: number;
    user_id: number;
    settlement?: {
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

interface GroupedSettlements {
    created_by: {
        id: number;
        name: string;
    };
    settlements: Settlement[];
    totalAmount: number;
    allUnpaid: boolean;
    selected: boolean;
}

interface PageProps {
    groupedSettlements: {
        created_by: {
            id: number;
            name: string;
        };
        settlements: Settlement[];
    }[];
}

const MySettlements = () => {
    const { props } = usePage<PageProps>();
    const [groupedSettlements, setGroupedSettlements] = useState<GroupedSettlements[]>([]);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    useEffect(() => {
        const transformed = props.groupedSettlements.map(group => {
            const totalAmount = group.settlements.reduce((sum, settlement) => sum + parseAmount(settlement.final_amount), 0);
            const allUnpaid = group.settlements.every(settlement => settlement.status === 'unpaid');
            return {
                ...group,
                totalAmount,
                allUnpaid,
                selected: false,
            };
        });

        setGroupedSettlements(transformed);
    }, [props.groupedSettlements]);

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    const markAsPaid = (itemId: number) => {
        setPayingItemId(itemId);
        router.post(route('settlements.items.markAsPaid', { id: itemId }), {}, {
            preserveScroll: true,
            onSuccess: () => {
                message.success('Status pozycji zaktualizowany');
                router.reload({ only: ['groupedSettlements'] });
            },
            onError: () => {
                message.error('Błąd podczas aktualizacji');
            },
            onFinish: () => setPayingItemId(null),
        });
    };

    const markGroupAsPaid = (groupId: number) => {
        setPayingGroupId(groupId);
        const group = groupedSettlements.find(g => g.created_by.id === groupId);
        if (!group) return;

        const unpaidSettlementIds = group.settlements.filter(settlement => settlement.status === 'unpaid').map(settlement => settlement.id);

        if (unpaidSettlementIds.length === 0) {
            message.warning('Brak niezapłaconych rozliczeń w tej grupie');
            setPayingGroupId(null);
            return;
        }

        router.post(route('settlements.items.bulkMarkAsPaid'), { settlement_ids: unpaidSettlementIds }, {
            preserveScroll: true,
            onSuccess: () => {
                message.success(`Opłacono ${unpaidSettlementIds.length} rozliczeń`);
                router.reload({ only: ['groupedSettlements'] });
            },
            onError: () => {
                message.error('Błąd przy aktualizacji');
            },
            onFinish: () => setPayingGroupId(null),
        });
    };

    const columns = [
        {
            title: 'Numer rozliczenia',
            dataIndex: ['settlement', 'uuid'],
            render: (uuid: string, record: Settlement) => (
                <Link href={route('settlements.show', { settlement: record.settlement_id })}>
                    <Text strong className="text-blue-500 hover:text-blue-600">#{uuid}</Text>
                </Link>
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['settlement', 'restaurant_name'],
            render: (name: string) => <Text className="font-medium">{name}</Text>,
        },
        {
            title: 'Data rozliczenia',
            render: (record: Settlement) => (
                <Text className="text-gray-500">
                    {formatDateTime(record.settlement?.date || record.created_at)}
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
            render: (status: string, record: Settlement) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? `Zapłacone - ${formatDateTime(record.paid_at || record.created_at)}` : 'Niezapłacone'}
                </Tag>
            ),
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (record: Settlement) => (
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
                <Title level={3}>Moje rozliczenia</Title>
                {groupedSettlements.map(group => (
                    <Card
                        key={group.created_by.id}
                        title={
                            <div className="flex justify-between items-center">
                                <div>
                                    <Text strong>{group.created_by.name}</Text>
                                    {' '}
                                    <Tag color="blue" className="ml-3">
                                        Łącznie:{group.totalAmount.toFixed(2)} zł
                                    </Tag>
                                </div>
                                {group.settlements.some(s => s.status === 'unpaid') && (
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
                            dataSource={group.settlements}
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

MySettlements.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje rozliczenia" />
);

export default MySettlements;
