import Layout from '@/layouts/Layout';
import { ReactNode, useState, useEffect } from 'react';
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
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';
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

interface User {
    id: number;
    name: string;
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
    const [loading, setLoading] = useState(false);
    const [payingItemId, setPayingItemId] = useState<number | null>(null);

    const refreshItems = () => {
        router.reload({ only: ['items'], preserveScroll: true });
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
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'Kwota podstawowa',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount: number) => (
                <Text>{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Kwota po rabacie',
            dataIndex: 'discounted_amount',
            key: 'discounted_amount',
            render: (amount: number) => (
                <Text>{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Do zapłaty',
            dataIndex: 'final_amount',
            key: 'final_amount',
            render: (amount: number) => (
                <Text strong>{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: OrderItem) => (
                <Tag color={status === 'paid' ? 'green' : 'orange'}>
                    {status === 'paid' ? 'Zapłacona' : 'Niezapłacona'}
                </Tag>
            ),
        },
        {
            title: 'Dodane przez',
            dataIndex: ['createdBy', 'name'],
            key: 'created_by',
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
                        Zamówienie #{props.order.uuid}
                    </Title>

                    <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                        <Descriptions.Item label="Restauracja">
                            <Text strong>{props.order.restaurant_name}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Zamawiający">
                            {props.order.user.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Telefon">
                            {props.order.user.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Data utworzenia">
                            {new Date(props.order.created_at).toLocaleString()}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Podsumowanie finansowe">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title="Rabat"
                                value={props.order.discount}
                                suffix="%"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title="Voucher"
                                value={props.order.voucher.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title="Dostawa"
                                value={props.order.delivery.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Statistic
                                title="Transakcja"
                                value={props.order.transaction.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Suma podstawowa"
                                value={totals.baseAmount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Po zniżkach"
                                value={totals.amountAfterDiscount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Suma końcowa"
                                value={totals.totalAmount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title="Pozycje zamówienia">
                    <Table
                        columns={itemsColumns}
                        dataSource={props.items}
                        rowKey="id"
                        pagination={false}
                        bordered
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
