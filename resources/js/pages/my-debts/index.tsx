import Layout from '@/layouts/Layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography, Collapse, Button, Popconfirm, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { ReactNode, useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface SettlementItem {
    id: number;
    amount: number | string | null;
    final_amount: number | string | null;
    status: 'paid' | 'unpaid';
    paid_at?: string;
    created_at: string;
    user_id: number;
    settlement_id: number;
    settlement?: {
        restaurant_name: string;
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
        phone: string;
    };
}

interface PageProps {
    myDebts: Record<number, SettlementItem[]>;
    auth: {
        user: {
            id: number;
        };
    };
}

function MyDebts() {
    const { props } = usePage<PageProps>();
    const [groupedDebts, setGroupedDebts] = useState<Record<number, SettlementItem[]>>(props.myDebts || {});
    const [payingItemId, setPayingItemId] = useState<number | null>(null);
    const [payingGroupId, setPayingGroupId] = useState<number | null>(null);

    useEffect(() => {
        setGroupedDebts(props.myDebts || {});
    }, [props.myDebts]);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

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
                router.reload({ only: ['myDebts'] });
            },
            onError: () => {
                message.error('Błąd podczas aktualizacji');
            },
            onFinish: () => setPayingItemId(null),
        });
    };

    const markGroupAsPaid = (groupId: number, debts: SettlementItem[]) => {
        setPayingGroupId(groupId);
        const unpaidDebts = debts.filter(debt => debt.status === 'unpaid');
        const unpaidDebtIds = unpaidDebts.map(debt => debt.id);
        const totalUnpaidAmount = unpaidDebts.reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);

        if (unpaidDebtIds.length === 0) {
            message.warning('Brak niezapłaconych długów w tej grupie');
            setPayingGroupId(null);
            return;
        }

        router.post(route('settlements.items.bulkMarkAsPaid'), { settlement_ids: unpaidDebtIds }, {
            preserveScroll: true,
            onSuccess: () => {
                message.success(`Opłacono ${unpaidDebtIds.length} długów za ${totalUnpaidAmount.toFixed(2)} zł`);
                router.reload({ only: ['myDebts'] });
            },
            onError: () => {
                message.error('Błąd przy aktualizacji');
            },
            onFinish: () => setPayingGroupId(null),
        });
    };

    let totalAmount = 0;
    let totalUnpaidCount = 0;
    let totalUnpaidAmount = 0;

    Object.values(groupedDebts).forEach(debts => {
        debts.forEach(debt => {
            const amount = parseAmount(debt.final_amount);
            totalAmount += amount;
            if (debt.status === 'unpaid') {
                totalUnpaidCount++;
                totalUnpaidAmount += amount;
            }
        });
    });

    const columns = [
        {
            title: 'Numer zamówienia',
            dataIndex: ['settlement', 'uuid'],
            key: 'uuid',
            render: (uuid: string, record: SettlementItem) => (
                uuid ? (
                    <Link href={route('settlements.show', { settlement: record.settlement_id })}>
                        <Text strong className="text-blue-500 hover:text-blue-600 transition-colors">
                            #{uuid}
                        </Text>
                    </Link>
                ) : (
                    <Text className="text-gray-400">Brak numeru</Text>
                )
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['settlement', 'restaurant_name'],
            key: 'restaurant_name',
            render: (restaurant_name: string) => (
                <Text className="font-medium">{restaurant_name || 'Brak nazwy'}</Text>
            ),
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
            render: (status: string, record: SettlementItem) => (
                <Tag color={status === 'paid' ? 'green' : 'red'} className="rounded-full px-3 py-1">
                    {status === 'paid' ? `Zapłacone - ${formatDateTime(record.paid_at || record.created_at)}` : 'Do zapłaty'}
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
            render: (record: SettlementItem) => (
                <Space>
                    {record.status !== 'paid' && (
                        <Popconfirm
                            title={`Oznaczyć jako opłacone?`}
                            description={`Kwota: ${parseAmount(record.final_amount).toFixed(2)} zł`}
                            onConfirm={() => markAsPaid(record.id)}
                            okText="Tak"
                            cancelText="Nie"
                        >
                            <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                loading={payingItemId === record.id}
                                size="small"
                                className="bg-green-500 border-green-500 hover:bg-green-600"
                            >
                                Opłać
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    const getCreditorName = (debts: SettlementItem[]) => {
        if (debts[0]?.created_by?.name) {
            return debts[0].created_by.name;
        }
        const creditorId = debts[0]?.created_by;
        return `Wierzyciel #${creditorId}`;
    };

    const getCreditorId = (debts: SettlementItem[]) => {
        return debts[0]?.created_by?.id;
    };

    const getUnpaidAmountForGroup = (debts: SettlementItem[]) => {
        return debts
            .filter(debt => debt.status === 'unpaid')
            .reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);
    };

    const getUnpaidCountForGroup = (debts: SettlementItem[]) => {
        return debts.filter(debt => debt.status === 'unpaid').length;
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Space direction="vertical" size={24} className="w-full">
                <Card className="rounded-xl shadow-sm border-0 bg-gradient-to-r from-red-50 to-pink-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <Title level={3} className="m-0 text-2xl font-bold text-gray-800">
                            Moje długi
                        </Title>
                    </div>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Łączna kwota długów"
                                    value={totalAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#f5222d' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Liczba niezapłaconych"
                                    value={totalUnpaidCount}
                                    valueStyle={{ color: '#fa541c' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Do zapłacenia"
                                    value={totalUnpaidAmount}
                                    precision={2}
                                    suffix="zł"
                                    valueStyle={{ color: '#cf1322' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title={<span className="text-lg font-semibold text-gray-800">Lista moich długów</span>}
                    className="rounded-xl shadow-sm border-0"
                    styles={{header: {borderBottom: '1px solid #f0f0f0'}}}
                >
                    {Object.keys(groupedDebts).length > 0 ? (
                        <Collapse
                            accordion
                            bordered={false}
                            className="bg-white"
                            expandIconPosition="end"
                        >
                            {Object.entries(groupedDebts).map(([creditorId, debts]) => {
                                if (!debts || debts.length === 0) return null;

                                const creditorName = getCreditorName(debts);
                                const creditorIdValue = getCreditorId(debts);
                                const creditorTotal = debts.reduce((sum, debt) => sum + parseAmount(debt.final_amount), 0);
                                const unpaidCount = getUnpaidCountForGroup(debts);
                                const unpaidAmount = getUnpaidAmountForGroup(debts);
                                const hasUnpaid = unpaidCount > 0;

                                return (
                                    <Panel
                                        key={creditorId}
                                        header={
                                            <div className="flex justify-between items-center w-full">
                                                <Space size="large">
                                                    <Text strong>Wierzyciel: {creditorName}</Text>
                                                    <Text strong>Suma: {creditorTotal.toFixed(2)} zł</Text>
                                                    <Tag color="red">{unpaidCount} do zapłaty</Tag>
                                                </Space>
                                                {hasUnpaid && creditorIdValue && (
                                                    <div onClick={stopPropagation}>
                                                        <Popconfirm
                                                            title={`Opłacić wszystkie niezapłacone długi u ${creditorName}?`}
                                                            description={`Łączna kwota do zapłaty: ${unpaidAmount.toFixed(2)} zł (${unpaidCount} pozycji)`}
                                                            onConfirm={() => markGroupAsPaid(creditorIdValue, debts)}
                                                            okText="Tak"
                                                            cancelText="Nie"
                                                        >
                                                            <Button
                                                                icon={<CheckOutlined />}
                                                                loading={payingGroupId === creditorIdValue}
                                                                size="small"
                                                                className="bg-green-500 border-green-500 hover:bg-green-600"
                                                            >
                                                                Opłać wszystkie
                                                            </Button>
                                                        </Popconfirm>
                                                    </div>
                                                )}
                                            </div>
                                        }
                                        className="mb-2 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                    >
                                        <Table
                                            columns={columns}
                                            dataSource={debts}
                                            rowKey="id"
                                            bordered
                                            scroll={{ x: 'max-content' }}
                                            className="rounded-lg overflow-hidden"
                                            rowClassName="hover:bg-red-50 transition-colors"
                                            pagination={false}
                                        />
                                    </Panel>
                                );
                            })}
                        </Collapse>
                    ) : (
                        <div className="text-center py-8">
                            <Text className="text-gray-500 text-lg">
                                Brak niezapłaconych długów. Świetna robota! 🎉
                            </Text>
                        </div>
                    )}
                </Card>
            </Space>
        </div>
    );
}

MyDebts.layout = (page: ReactNode) => <Layout children={page} title="Moje długi" />;

export default MyDebts;
