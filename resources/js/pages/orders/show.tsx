import Layout from '@/layouts/Layout';
import { ReactNode, useState } from 'react';
import {
    Button,
    Table,
    Typography,
    message,
    Card,
    Space,
    Statistic,
    Tag,
    Popconfirm,
    Row,
    Col,
    Divider,
    Descriptions
} from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { usePage, router } from '@inertiajs/react';

const { Title, Text } = Typography;

interface OrderItem {
    id: number;
    user_id: number;
    amount: number;
    discounted_amount: number;
    final_amount: number;
    status: 'paid' | 'unpaid';
    created_by: number;
    user: {
        id: number;
        name: string;
    };
    createdBy: {
        id: number;
        name: string;
    };
}

interface Order {
    id: number;
    uuid: string;
    restaurant_name: string;
    user: {
        name: string;
        phone: string;
    };
    discount: number;
    voucher: number;
    delivery: number;
    transaction: number;
    created_at: string;
}

interface PageProps {
    order: Order;
    items: OrderItem[];
    auth: {
        user: {
            id: number;
            name: string;
        };
    };
}

const OrderShow = () => {
    const { props } = usePage<PageProps>();
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    const refreshItems = () => {
        router.reload({ only: ['items'], preserveScroll: true });
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

    const calculateTotals = () => {
        const baseAmount = props.items.reduce((sum, item) => sum + Number(item.amount), 0);
        const discountAmount = baseAmount * (Number(props.order.discount) / 100);
        const amountAfterDiscount = baseAmount - discountAmount - Number(props.order.voucher);
        const totalAmount = amountAfterDiscount + Number(props.order.delivery) + Number(props.order.transaction);

        return {
            baseAmount,
            discountAmount,
            amountAfterDiscount,
            totalAmount
        };
    };

    const totals = calculateTotals();

    const itemsColumns = [
        {
            title: 'Użytkownik',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (name: string) => <Text className="text-gray-800 font-medium">{name}</Text>,
        },
        {
            title: 'Kwota podstawowa',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <Text className="text-gray-600">{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Kwota po rabacie',
            dataIndex: 'discounted_amount',
            key: 'discounted_amount',
            render: (amount: number) => (
                <Text className="text-gray-600">{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Do zapłaty',
            dataIndex: 'final_amount',
            key: 'final_amount',
            render: (amount: number) => (
                <Text className="text-blue-600 font-medium">{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag
                    color={status === 'paid' ? 'green' : 'orange'}
                    className="rounded-full px-3 py-1"
                >
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
                                className="bg-blue-500 hover:bg-blue-600 border-blue-500"
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
        <div className="order-show-container p-4 md:p-6 max-w-6xl mx-auto">
            <Space direction="vertical" size="large" className="w-full">
                {/* Order Header Card */}
                <Card className="rounded-lg shadow-sm border-0 bg-white">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <Title level={3} className="m-0 text-2xl font-semibold text-gray-800">
                            Zamówienie <span className="text-blue-600">#{props.order.uuid}</span>
                        </Title>
                        <Text className="text-gray-500 mt-2 md:mt-0">
                            {new Date(props.order.created_at).toLocaleString()}
                        </Text>
                    </div>

                    <Descriptions
                        bordered
                        column={{ xs: 1, sm: 2, md: 3 }}
                        className="custom-descriptions"
                    >
                        <Descriptions.Item label="Restauracja" labelStyle={{ fontWeight: 500 }}>
                            <Text className="text-gray-800 font-medium">{props.order.restaurant_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Zamawiający" labelStyle={{ fontWeight: 500 }}>
                            {props.order.user.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Telefon" labelStyle={{ fontWeight: 500 }}>
                            {props.order.user.phone}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {/* Financial Summary Card */}
                <Card
                    title={<span className="text-lg font-semibold text-gray-800">Podsumowanie finansowe</span>}
                    className="rounded-lg shadow-sm border-0 bg-white"
                    headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                    <Row gutter={[16, 16]} className="mb-6">
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={<span className="text-gray-600">Rabat</span>}
                                value={props.order.discount}
                                suffix="%"
                                valueStyle={{ color: '#3B82F6' }}
                                className="border-r pr-4"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={<span className="text-gray-600">Voucher</span>}
                                value={props.order.voucher.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#10B981' }}
                                className="border-r pr-4"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={<span className="text-gray-600">Dostawa</span>}
                                value={props.order.delivery.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#6366F1' }}
                                className="border-r pr-4"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title={<span className="text-gray-600">Transakcja</span>}
                                value={props.order.transaction.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#F59E0B' }}
                            />
                        </Col>
                    </Row>

                    <Divider className="my-4" />

                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title={<span className="text-gray-600 font-medium">Suma podstawowa</span>}
                                value={totals.baseAmount.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#1F2937', fontSize: '1.25rem' }}
                                className="bg-gray-50 p-4 rounded"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title={<span className="text-gray-600 font-medium">Po zniżkach</span>}
                                value={totals.amountAfterDiscount.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#1F2937', fontSize: '1.25rem' }}
                                className="bg-gray-50 p-4 rounded"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title={<span className="text-gray-600 font-medium">Suma końcowa</span>}
                                value={totals.totalAmount.toFixed(2)}
                                suffix="zł"
                                valueStyle={{ color: '#3B82F6', fontSize: '1.25rem', fontWeight: 600 }}
                                className="bg-blue-50 p-4 rounded"
                            />
                        </Col>
                    </Row>
                </Card>

                {/* Order Items Card */}
                <Card
                    title={<span className="text-lg font-semibold text-gray-800">Pozycje zamówienia</span>}
                    className="rounded-lg shadow-sm border-0 bg-white"
                    headStyle={{ borderBottom: '1px solid #f0f0f0' }}
                >
                    <Table
                        columns={itemsColumns}
                        dataSource={props.items}
                        rowKey="id"
                        pagination={false}
                        bordered
                        className="custom-table"
                        rowClassName="hover:bg-gray-50"
                    />
                </Card>
            </Space>

            {/* Custom styles */}
            <style jsx global>{`
                .custom-descriptions .ant-descriptions-item-label {
                    background-color: #f8fafc !important;
                }
                .custom-table .ant-table-thead > tr > th {
                    background-color: #f8fafc !important;
                    font-weight: 600;
                    color: #374151;
                }
                .ant-card-head-title {
                    padding: 16px 0;
                }
            `}</style>
        </div>
    );
};

OrderShow.layout = (page: ReactNode) => (
    <Layout children={page} title="Szczegóły zamówienia" />
);

export default OrderShow;
