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
    Divider,
    Tag, DatePicker
} from 'antd';
import { PlusOutlined, DeleteOutlined, SaveOutlined, ShopOutlined } from '@ant-design/icons';
import { usePage, router } from '@inertiajs/react';
import dayjs from 'dayjs';

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
    const [orderDate, setOrderDate] = useState(dayjs());
    const [discount, setDiscount] = useState(0);
    const [voucher, setVoucher] = useState(0);
    const [delivery, setDelivery] = useState(0);
    const [transaction, setTransaction] = useState(0);

    const baseAmount = temporaryItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
    const discountAmount = baseAmount * (discount / 100);
    const amountAfterDiscount = baseAmount - discountAmount - voucher;
    const totalAmount = amountAfterDiscount + delivery + transaction;

    const availableUsers = props.users.filter(user =>
        !temporaryItems.some(item => item.user_id === user.id)
    );

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
                date: orderDate.format('YYYY-MM-DD'),
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
            render: (name: string) => <Text className="font-medium">{name}</Text>,
        },
        {
            title: 'Cena podstawowa',
            dataIndex: 'amount',
            key: 'base_amount',
            render: (amount: number) => (
                <Text className="text-gray-600">{Number(amount).toFixed(2)} zł</Text>
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
                return <Text className="text-blue-600">{discounted.toFixed(2)} zł</Text>;
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
                return <Text strong className="text-green-600">{final.toFixed(2)} zł</Text>;
            },
        },
        {
            title: 'Akcje',
            key: 'actions',
            align: 'right',
            render: (_: any, record: OrderItem, index: number) => (
                <Button
                    danger
                    type="text"
                    icon={<DeleteOutlined className="text-red-500" />}
                    onClick={() => removeTemporaryItem(index)}
                    size="small"
                    className="hover:bg-red-50"
                />
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-6">
            <Space direction="vertical" size="large" className="w-full">
                <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <Title level={3} className="m-0 text-gray-800">
                            <ShopOutlined className="mr-2 text-blue-500" />
                            Nowe zamówienie
                        </Title>
                        {temporaryItems.length > 0 && (
                            <Tag color="blue" className="text-sm font-semibold">
                                {temporaryItems.length} {temporaryItems.length === 1 ? 'osoba' : 'osoby'}
                            </Tag>
                        )}
                    </div>
                </Card>

                <Card
                    title="Podstawowe informacje"
                    className="shadow-sm border-0"
                    styles={{
                        header: {
                            borderBottom: '1px solid #f0f0f0'
                        }
                    }}
                >
                    <Form layout="vertical" className="max-w-3xl">
                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    label={<span className="font-medium text-gray-700">Nazwa restauracji</span>}
                                    required
                                    rules={[{ required: true, message: 'Podaj nazwę restauracji' }]}
                                >
                                    <Input
                                        prefix={<ShopOutlined className="text-gray-400" />}
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        placeholder="Wprowadź nazwę restauracji"
                                        className="py-2 hover:border-blue-400 focus:border-blue-500"
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={<span className="font-medium text-gray-700">Data zamówienia</span>}
                                    required
                                >
                                    <DatePicker
                                        value={orderDate}
                                        onChange={(date) => setOrderDate(date || dayjs())}
                                        className="w-full py-2 hover:border-blue-400 focus:border-blue-500"
                                        format="YYYY-MM-DD"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>

                <Card
                    title="Parametry zamówienia"
                    className="shadow-sm border-0"
                    styles={{
                        header: {
                            borderBottom: '1px solid #f0f0f0'
                        }
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label={<span className="font-medium text-gray-700">Rabat (%)</span>}>
                                <Input
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    suffix="%"
                                    className="py-2 hover:border-blue-400 focus:border-blue-500"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label={<span className="font-medium text-gray-700">Voucher (zł)</span>}>
                                <Input
                                    type="number"
                                    value={voucher}
                                    onChange={(e) => setVoucher(Number(e.target.value))}
                                    suffix="zł"
                                    className="py-2 hover:border-blue-400 focus:border-blue-500"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label={<span className="font-medium text-gray-700">Dostawa (zł)</span>}>
                                <Input
                                    type="number"
                                    value={delivery}
                                    onChange={(e) => setDelivery(Number(e.target.value))}
                                    suffix="zł"
                                    className="py-2 hover:border-blue-400 focus:border-blue-500"
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Form.Item label={<span className="font-medium text-gray-700">Transakcja (zł)</span>}>
                                <Input
                                    type="number"
                                    value={transaction}
                                    onChange={(e) => setTransaction(Number(e.target.value))}
                                    suffix="zł"
                                    className="py-2 hover:border-blue-400 focus:border-blue-500"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider className="my-6" />

                    <Row gutter={[16, 16]} className="mt-6">
                        <Col xs={24} sm={12} md={8}>
                            <Card variant={"borderless"} className="text-center shadow-none bg-gray-50">
                                <Statistic
                                    title={<span className="text-gray-600 font-medium">Suma podstawowa</span>}
                                    value={baseAmount.toFixed(2)}
                                    suffix="zł"
                                    valueStyle={{ color: '#4B5563' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card variant={"borderless"} className="text-center shadow-none bg-blue-50">
                                <Statistic
                                    title={<span className="text-blue-600 font-medium">Po zniżkach</span>}
                                    value={amountAfterDiscount.toFixed(2)}
                                    suffix="zł"
                                    valueStyle={{ color: '#2563EB' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Card variant={"borderless"} className="text-center shadow-none bg-green-50">
                                <Statistic
                                    title={<span className="text-green-600 font-medium">Suma końcowa</span>}
                                    value={totalAmount.toFixed(2)}
                                    suffix="zł"
                                    valueStyle={{ color: '#059669' }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Card>

                <Card
                    title="Dodaj zamawiającego"
                    className="shadow-sm border-0"
                    styles={{
                        header: {
                            borderBottom: '1px solid #f0f0f0'
                        }
                    }}
                >
                    <Form
                        form={itemsForm}
                        layout="inline"
                        onFinish={addTemporaryItem}
                        className="mb-6 flex flex-wrap gap-4"
                    >
                        <Form.Item
                            name="user_id"
                            rules={[{ required: true, message: 'Wybierz użytkownika' }]}
                            className="flex-1 min-w-[200px]"
                        >
                            <Select
                                placeholder="Wybierz użytkownika"
                                showSearch
                                optionFilterProp="children"
                                className="w-full"
                                popupClassName="shadow-lg"
                            >
                                {availableUsers.map((user) => (
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
                            className="flex-1 min-w-[150px]"
                        >
                            <Input
                                placeholder="Kwota"
                                suffix="zł"
                                className="py-2 hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<PlusOutlined />}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Dodaj
                            </Button>
                        </Form.Item>
                    </Form>

                    {temporaryItems.length > 0 && (
                        <div className="space-y-6">
                            <Table
                                columns={columns}
                                dataSource={temporaryItems}
                                rowKey={(record, index) => `${record.user_id}-${index}`}
                                pagination={false}
                                bordered
                                className="shadow-sm"
                                rowClassName="hover:bg-gray-50"
                            />
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                onClick={createOrder}
                                loading={saving}
                                block
                                size="large"
                                className="h-12 bg-green-500 hover:bg-green-600 border-green-500"
                            >
                                Utwórz zamówienie
                            </Button>
                        </div>
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
