import Layout from '@/layouts/Layout';
import { Link, usePage } from '@inertiajs/react';
import { Card, Col, Row, Space, Statistic, Table, Tag, Typography, Collapse } from 'antd';
import { ReactNode, useEffect, useState } from 'react';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Settlement {
    id: number;
    amount: number | string | null;
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
    };
    user?: {
        name: string;
        phone: string;
    };
}

interface PageProps {
    settlements: Record<number, Settlement[]>; // Zmieniamy typ na obiekt grupujący
    auth: {
        user: {
            id: number;
        };
    };
}

function Debtors() {
    const { props } = usePage<PageProps>();
    const [groupedSettlements, setGroupedSettlements] = useState<Record<number, Settlement[]>>(props.settlements || {});

    useEffect(() => {
        setGroupedSettlements(props.settlements || {});
    }, [props.settlements]);

    const parseAmount = (amount: number | string | null): number => {
        if (amount === null || amount === undefined) return 0;
        return parseFloat(amount.toString()) || 0;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL');
    };

    let totalAmount = 0;
    let totalUnpaidCount = 0;
    let totalUnpaidAmount = 0;

    Object.values(groupedSettlements).forEach(settlements => {
        settlements.forEach(settlement => {
            const amount = parseAmount(settlement.amount);
            totalAmount += amount;
            if (settlement.status === 'unpaid') {
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
            render: (uuid: string, record: Settlement) => (
                <Link href={route('settlements.show', { settlement: record.settlement_id })}>
                    <Text strong className="text-blue-500 hover:text-blue-600 transition-colors">
                        #{uuid}
                    </Text>
                </Link>
            ),
        },
        {
            title: 'Restauracja',
            dataIndex: ['settlement', 'restaurant_name'],
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
                                    value={totalUnpaidCount}
                                    valueStyle={{ color: '#fa8c16' }}
                                    className="text-center"
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
                                <Statistic
                                    title="Kwota niezapłacona"
                                    value={totalUnpaidAmount}
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
                    <Collapse
                        accordion
                        bordered={false}
                        className="bg-white"
                        expandIconPosition="end"
                    >
                        {Object.entries(groupedSettlements).map(([userId, settlements]) => {
                            const user = settlements[0]?.user;
                            if (!user) return null;

                            const userTotal = settlements.reduce((sum, s) => sum + parseAmount(s.amount), 0);
                            const unpaidCount = settlements.filter(s => s.status === 'unpaid').length;

                            return (
                                <Panel
                                    key={userId}
                                    header={
                                        <Space size="large">
                                            <Text strong>{user.name}</Text>
                                            <Text>Telefon: {user.phone}</Text>
                                            <Text strong>Suma: {userTotal.toFixed(2)} zł</Text>
                                            <Tag color="orange">{unpaidCount} niezapłaconych</Tag>
                                        </Space>
                                    }
                                    className="mb-2 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                                >
                                    <Table
                                        columns={columns}
                                        dataSource={settlements}
                                        rowKey="id"
                                        bordered
                                        scroll={{ x: 'max-content' }}
                                        locale={{
                                            emptyText: 'Brak zamówień.',
                                        }}
                                        className="rounded-lg overflow-hidden"
                                        rowClassName="hover:bg-orange-50 transition-colors"
                                        pagination={false}
                                    />
                                </Panel>
                            );
                        })}
                    </Collapse>
                </Card>
            </Space>
        </div>
    );
}

Debtors.layout = (page: ReactNode) => <Layout children={page} title="Dłużnicy" />;

export default Debtors;
