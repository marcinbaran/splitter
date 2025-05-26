import React, { useState } from 'react';
import {
    Button,
    Space,
    Table,
    Modal,
    Form,
    Input,
    message,
    Card,
    Typography,
    Divider,
    Tag
} from 'antd';
import type { TableProps } from 'antd';
import Layout from '@/layouts/Layout';
import {
    PlusOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShopOutlined,
    CalendarOutlined,
    SearchOutlined,
    LinkOutlined
} from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import HeaderCard from '@/components/HeaderCard';

const { Text, Title } = Typography;

interface DataType {
    id: string;
    uuid: string;
    restaurant_name: string;
    created_at: string;
    status?: 'pending' | 'completed' | 'cancelled';
    user: {
        id: number;
        name: string;
        email?: string;
    };
}

const statusColors: Record<string, string> = {
    pending: 'orange',
    completed: 'green',
    cancelled: 'red'
};

const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Numer zamówienia',
        dataIndex: 'uuid',
        key: 'uuid',
        render: (uuid: string, record) => (
            <div className="flex flex-col">
                <Link href={route('orders.show', { order: record.id })}>
                    <Text strong className="text-blue-600 hover:text-blue-800 transition-colors">
                        #{uuid}
                    </Text>
                </Link>
                {record.status && (
                    <Tag color={statusColors[record.status]} className="mt-1 w-fit">
                        {record.status === 'pending' && 'Oczekujące'}
                        {record.status === 'completed' && 'Zakończone'}
                        {record.status === 'cancelled' && 'Anulowane'}
                    </Tag>
                )}
            </div>
        ),
    },
    {
        title: 'Restauracja',
        dataIndex: 'restaurant_name',
        key: 'restaurant_name',
        render: (name) => (
            <Space className="flex items-center">
                <ShopOutlined className="text-gray-500" />
                <Text className="text-gray-700">{name}</Text>
            </Space>
        )
    },
    {
        title: 'Zamawiający',
        dataIndex: 'user',
        key: 'user',
        render: (user) => (
            <Space className="flex items-center">
                <UserOutlined className="text-gray-500" />
                <Text className="text-gray-700">{user.name}</Text>
            </Space>
        )
    },
    {
        title: 'Data',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => (
            <Space className="flex items-center">
                <CalendarOutlined className="text-gray-500" />
                <Text className="text-gray-700">
                    {new Date(date).toLocaleDateString('pl-PL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </Space>
        )
    },
    {
        title: 'Akcje',
        key: 'actions',
        align: 'right',
        render: (_, record) => (
            <Space size="middle">
                {record.status === 'pending' ? (
                    <Link href={route('orders.edit', { order: record.id })}>
                        <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700">
                            Edytuj
                        </Button>
                    </Link>
                ) : (
                    <Link href={route('orders.show', { id: record.id })}>
                        <Button type="primary" size="small" className="bg-blue-600 hover:bg-blue-700">
                            Szczegóły
                        </Button>
                    </Link>
                )}
            </Space>
        )
    }
];

interface OrderIndexProps {
    orders: DataType[];
}

function OrderIndex({ orders }: OrderIndexProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const filteredOrders = orders.filter(order =>
        order.uuid.toLowerCase().includes(searchText.toLowerCase()) ||
        order.restaurant_name.toLowerCase().includes(searchText.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            router.visit(route('orders.create'), {
                method: 'get',
                data: {
                    restaurant_name: values.restaurant_name,
                    restaurant_url: values.restaurant_url
                },
                onSuccess: () => {
                    setIsModalVisible(false);
                    form.resetFields();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas przetwarzania żądania');
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-index-container p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <HeaderCard
                    title="Zamówienia"
                    icon={<ShoppingCartOutlined className="text-2xl text-blue-600" />}
                    extra={
                        <Space>
                            <Input
                                placeholder="Szukaj zamówień..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-64"
                                allowClear
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => setIsModalVisible(true)}
                            >
                                Utwórz zamówienie
                            </Button>
                        </Space>
                    }
                    expanded
                />

                <Card
                    variant={'borderless'}
                    className="mt-6 shadow-sm rounded-lg border border-gray-200"
                    styles={{body: {padding: 0}}}
                >
                    <Table<DataType>
                        columns={columns}
                        dataSource={filteredOrders}
                        rowKey="id"
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Razem ${total} zamówień`,
                            className: 'px-6 py-3'
                        }}
                        scroll={{ x: true }}
                        locale={{
                            emptyText: (
                                <div className="py-12 flex flex-col items-center">
                                    <ShoppingCartOutlined className="text-4xl text-gray-400 mb-4" />
                                    <Title level={4} className="text-gray-500">Brak zamówień</Title>
                                    <Text className="text-gray-400">Dodaj nowe zamówienie, klikając przycisk powyżej</Text>
                                </div>
                            )
                        }}
                        className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-600 [&_.ant-table-thead>tr>th]:font-semibold"
                    />
                </Card>

                <Modal
                    title={
                        <Space>
                            <PlusOutlined className="text-blue-500" />
                            <span className="text-lg font-medium">Nowe zamówienie</span>
                        </Space>
                    }
                    open={isModalVisible}
                    onOk={handleSubmit}
                    onCancel={handleCancel}
                    okText="Dalej"
                    cancelText="Anuluj"
                    confirmLoading={loading}
                    width={600}
                    footer={[
                        <Button key="back" onClick={handleCancel}>
                            Anuluj
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            loading={loading}
                            onClick={handleSubmit}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Dalej
                        </Button>,
                    ]}
                >
                    <Divider className="my-4" />
                    <Form
                        form={form}
                        layout="vertical"
                        requiredMark="optional"
                    >
                        <Form.Item
                            name="restaurant_name"
                            label={<span className="font-medium text-gray-700">Nazwa restauracji</span>}
                            rules={[
                                {
                                    required: true,
                                    message: 'Proszę podać nazwę restauracji'
                                },
                                {
                                    max: 100,
                                    message: 'Nazwa nie może być dłuższa niż 100 znaków'
                                }
                            ]}
                        >
                            <Input
                                placeholder="Wprowadź nazwę restauracji"
                                size="large"
                                allowClear
                                prefix={<ShopOutlined className="text-gray-400" />}
                                className="hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>

                        <Form.Item
                            name="restaurant_url"
                            label={<span className="font-medium text-gray-700">URL restauracji</span>}
                            rules={[
                                {
                                    type: 'url',
                                    message: 'Proszę podać poprawny URL (np. https://example.com)'
                                }
                            ]}
                        >
                            <Input
                                placeholder="Wprowadź URL menu restauracji"
                                size="large"
                                allowClear
                                prefix={<LinkOutlined className="text-gray-400" />}
                                className="hover:border-blue-400 focus:border-blue-500"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
}

OrderIndex.layout = (page: React.ReactNode) => (
    <Layout children={page} title="Zamówienia" />
);

export default OrderIndex;
