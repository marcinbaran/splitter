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
    Divider
} from 'antd';
import type { TableProps } from 'antd';
import Layout from '@/layouts/Layout';
import { PlusOutlined, ShoppingCartOutlined, UserOutlined, ShopOutlined, CalendarOutlined } from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import HeaderCard from '@/components/HeaderCard';

const { Text } = Typography;

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

const columns: TableProps<DataType>['columns'] = [
    {
        title: 'Numer zamówienia',
        dataIndex: 'uuid',
        key: 'uuid',
        render: (uuid: string, id: string) => (
            <Link href={route('orders.show', { orderId: id })}>
                <Text strong style={{ color: '#1890ff', transition: 'color 0.3s' }} className="hover:text-blue-600">
                    #{uuid}
                </Text>
            </Link>
        ),
    },
    {
        title: 'Restauracja',
        dataIndex: 'restaurant_name',
        key: 'restaurant_name',
        render: (name) => (
            <Space>
                <ShopOutlined />
                <Text>{name}</Text>
            </Space>
        )
    },
    {
        title: 'Zamawiający',
        dataIndex: 'user',
        key: 'user',
        render: (user) => (
            <Space>
                <UserOutlined />
                <Text>{user.name}</Text>
            </Space>
        )
    },
    {
        title: 'Data',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (date) => (
            <Space>
                <CalendarOutlined />
                <Text>{new Date(date).toLocaleDateString()}</Text>
            </Space>
        )
    },
    {
        title: 'Akcje',
        key: 'actions',
        align: 'right',
        render: (_, record) => (
            <Space size="middle">
                <Link href={route('orders.show', { id: record.id })}>
                    <Button type="primary" size="small">
                        Szczegóły
                    </Button>
                </Link>
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

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();

            await router.post(route('orders.store'), values, {
                onSuccess: () => {
                    message.success('Zamówienie zostało utworzone!');
                    setIsModalVisible(false);
                    form.resetFields();
                },
                onError: () => {
                    message.error('Wystąpił błąd podczas tworzenia zamówienia');
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-index-container">
            <HeaderCard
                title="Zamówienia"
                icon={<ShoppingCartOutlined style={{ fontSize: 24 }} />}
                extra={
                <Link href={route('orders.create')}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                    >
                        Nowe zamówienie
                    </Button>
                </Link>
                }
                expanded
            />

            <Card
                bordered={false}
                bodyStyle={{ padding: 0 }}
                style={{ marginTop: 24 }}
            >
                <Table<DataType>
                    columns={columns}
                    dataSource={orders}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        hideOnSinglePage: true
                    }}
                    scroll={{ x: true }}
                    locale={{
                        emptyText: 'Brak zamówień'
                    }}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Nowe zamówienie</span>
                    </Space>
                }
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText="Zapisz"
                cancelText="Anuluj"
                confirmLoading={loading}
                width={600}
            >
                <Divider />
                <Form
                    form={form}
                    layout="vertical"
                    requiredMark="optional"
                >
                    <Form.Item
                        name="restaurant_name"
                        label="Nazwa restauracji"
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
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

OrderIndex.layout = (page: React.ReactNode) => (
    <Layout children={page} title="Zamówienia" />
);

export default OrderIndex;
