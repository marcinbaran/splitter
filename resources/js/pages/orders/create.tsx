import Layout from '@/layouts/Layout';
import { ReactNode, useState } from 'react';
import {
    Button,
    Table,
    Form,
    Input,
    Select,
    Typography,
    message,
    Card,
    Space,
    Statistic,
    Row,
    Col,
    Divider
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import { usePage, router } from '@inertiajs/react';

const { Option } = Select;
const { Title, Text } = Typography;

interface OrderItem {
    id?: number;
    user_id: number;
    amount: number;
    discounted_amount?: number;
    final_amount?: number;
    status?: 'paid' | 'unpaid';
    created_by?: number;
    user?: {
        id: number;
        name: string;
    };
    createdBy?: {
        id: number;
        name: string;
    };
}

interface User {
    id: number;
    name: string;
}

interface PageProps {
    users: User[];
    auth: {
        user: {
            id: number;
        };
    };
}

const OrderCreate = () => {
    const { props } = usePage<PageProps>();
    const [form] = Form.useForm();
    const [itemsForm] = Form.useForm();
    const [temporaryItems, setTemporaryItems] = useState<OrderItem[]>([]);
    const [saving, setSaving] = useState(false);

    const [restaurantName, setRestaurantName] = useState('');
    const [discount, setDiscount] = useState(0);
    const [voucher, setVoucher] = useState(0);
    const [delivery, setDelivery] = useState(0);
    const [transaction, setTransaction] = useState(0);

    const baseAmount = temporaryItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const discountAmount = baseAmount * (discount / 100);
    const amountAfterDiscount = baseAmount - discountAmount - voucher;
    const totalAmount = amountAfterDiscount + delivery + transaction;

    const addTemporaryItem = (values: { user_id: number; amount: string }) => {
        const user = props.users.find(u => u.id === values.user_id);
        if (!user) return;

        const newItem: OrderItem = {
            user_id: values.user_id,
            amount: parseFloat(values.amount),
            user: {
                id: user.id,
                name: user.name
            }
        };

        setTemporaryItems([...temporaryItems, newItem]);
        itemsForm.resetFields();
    };

    const removeTemporaryItem = (index: number) => {
        const newItems = [...temporaryItems];
        newItems.splice(index, 1);
        setTemporaryItems(newItems);
    };

    const createOrder = () => {
        if (temporaryItems.length === 0) {
            message.warning('Brak pozycji do zapisania');
            return;
        }

        if (!restaurantName) {
            message.warning('Podaj nazwę restauracji');
            return;
        }

        setSaving(true);

        const itemsWithCalculations = temporaryItems.map(item => {
            const itemBase = parseFloat(item.amount.toString());
            const itemDiscount = itemBase * (discount / 100);
            const itemVoucher = voucher / temporaryItems.length;
            const itemDelivery = delivery / temporaryItems.length;
            const itemTransaction = transaction / temporaryItems.length;

            return {
                ...item,
                discounted_amount: itemBase - itemDiscount - itemVoucher,
                final_amount: itemBase - itemDiscount - itemVoucher + itemDelivery + itemTransaction
            };
        });

        router.post(
            route('orders.store'),
            {
                restaurant_name: restaurantName,
                items: itemsWithCalculations,
                discount,
                voucher,
                delivery,
                transaction
            },
            {
                onSuccess: () => {
                    message.success('Zamówienie zostało utworzone');
                    setTemporaryItems([]);
                    setRestaurantName('');
                    form.resetFields();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas tworzenia zamówienia');
                },
                onFinish: () => {
                    setSaving(false);
                },
            }
        );
    };

    const columns = [
        {
            title: 'Użytkownik',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (name: string) => <Text strong>{name}</Text>,
        },
        {
            title: 'Cena podstawowa',
            dataIndex: 'amount',
            key: 'base_amount',
            render: (amount: number) => (
                <Text>{Number(amount).toFixed(2)} zł</Text>
            ),
        },
        {
            title: 'Cena ze zniżką',
            key: 'discounted_amount',
            render: (_: any, record: OrderItem) => {
                const itemBase = parseFloat(record.amount.toString());
                const itemDiscount = itemBase * (discount / 100);
                const itemVoucher = voucher / temporaryItems.length;
                const discounted = itemBase - itemDiscount - itemVoucher;
                return <Text>{discounted.toFixed(2)} zł</Text>;
            },
        },
        {
            title: 'Do zapłaty',
            key: 'final_amount',
            render: (_: any, record: OrderItem) => {
                const itemBase = parseFloat(record.amount.toString());
                const itemDiscount = itemBase * (discount / 100);
                const itemVoucher = voucher / temporaryItems.length;
                const itemDelivery = delivery / temporaryItems.length;
                const itemTransaction = transaction / temporaryItems.length;
                const final = itemBase - itemDiscount - itemVoucher + itemDelivery + itemTransaction;
                return <Text strong>{final.toFixed(2)} zł</Text>;
            },
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (_: any, record: OrderItem, index: number) => (
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeTemporaryItem(index)}
                    size="small"
                />
            ),
        },
    ];

    return (
        <div className="order-create-container">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Title level={3} style={{ marginBottom: 24 }}>
                        Nowe zamówienie
                    </Title>
                </Card>

                <Card title="Podstawowe informacje">
                    <Form layout="vertical">
                        <Form.Item
                            label="Nazwa restauracji"
                            required
                            rules={[{ required: true, message: 'Podaj nazwę restauracji' }]}
                        >
                            <Input
                                prefix={<ShopOutlined />}
                                value={restaurantName}
                                onChange={(e) => setRestaurantName(e.target.value)}
                                placeholder="Wprowadź nazwę restauracji"
                            />
                        </Form.Item>
                    </Form>
                </Card>

                <Card title="Parametry zamówienia">
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Rabat (%)">
                                <Input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    suffix="%"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Voucher (zł)">
                                <Input
                                    type="number"
                                    value={voucher}
                                    onChange={(e) => setVoucher(Number(e.target.value))}
                                    suffix="zł"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Dostawa (zł)">
                                <Input
                                    type="number"
                                    value={delivery}
                                    onChange={(e) => setDelivery(Number(e.target.value))}
                                    suffix="zł"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label="Transakcja (zł)">
                                <Input
                                    type="number"
                                    value={transaction}
                                    onChange={(e) => setTransaction(Number(e.target.value))}
                                    suffix="zł"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Suma podstawowa"
                                value={baseAmount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Po zniżkach"
                                value={amountAfterDiscount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Statistic
                                title="Suma końcowa"
                                value={totalAmount.toFixed(2)}
                                suffix="zł"
                            />
                        </Col>
                    </Row>
                </Card>

                <Card title="Dodaj uczestników zamówienia">
                    <Form
                        form={itemsForm}
                        layout="inline"
                        onFinish={addTemporaryItem}
                        style={{ marginBottom: 24 }}
                    >
                        <Form.Item
                            name="user_id"
                            rules={[{ required: true, message: 'Wybierz użytkownika' }]}
                            style={{ width: 250 }}
                        >
                            <Select
                                placeholder="Wybierz użytkownika"
                                showSearch
                                optionFilterProp="children"
                            >
                                {props.users.map((user) => (
                                    <Option key={user.id} value={user.id}>
                                        {user.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="amount"
                            rules={[
                                { required: true, message: 'Podaj kwotę' },
                                {
                                    pattern: /^\d+(\.\d{1,2})?$/,
                                    message: 'Podaj poprawną kwotę (np. 10.50)',
                                },
                            ]}
                            normalize={(value) => value.replace(',', '.')}
                            style={{ width: 200 }}
                        >
                            <Input
                                placeholder="Kwota"
                                suffix="zł"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<PlusOutlined />}
                            >
                                Dodaj
                            </Button>
                        </Form.Item>
                    </Form>

                    {temporaryItems.length > 0 && (
                        <>
                            <Table
                                columns={columns}
                                dataSource={temporaryItems}
                                rowKey={(record, index) => `${record.user_id}-${index}`}
                                pagination={false}
                                bordered
                                style={{ marginBottom: 16 }}
                            />
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={createOrder}
                                loading={saving}
                                block
                                size="large"
                            >
                                Utwórz zamówienie
                            </Button>
                        </>
                    )}
                </Card>
            </Space>
        </div>
    );
};

OrderCreate.layout = (page: ReactNode) => (
    <Layout children={page} title="Nowe zamówienie" />
);

export default OrderCreate;
