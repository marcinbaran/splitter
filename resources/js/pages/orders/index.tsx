import React, { useState } from 'react';
import { Button, Space, Table, Modal, Form, Input, message } from 'antd';
import type { TableProps } from 'antd';
import Layout from '@/layouts/Layout';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, router } from '@inertiajs/react';
import HeaderCard from '@/components/HeaderCard';

interface DataType {
    id: string;
    uuid: string;
    restaurant_name: string;
    created_at: string;
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
    },
    {
        title: 'Nazwa restauracji',
        dataIndex: 'restaurant_name',
        key: 'restaurant_name',
    },
    {
        title: 'Zamawiający',
        dataIndex: 'user',
        key: 'user',
        render: (_, record) => record.user.name,
    },
    {
        title: 'Data',
        dataIndex: 'created_at',
        key: 'created_at',
        render: (_, record) => new Date(record.created_at).toLocaleDateString(),
    },
    {
        title: 'Akcje',
        key: 'actions',
        render: (_, record) => {
            return (
                <Space size="middle">
                    <Link href={route('orders.show', {id: record.id})}>
                        <Button type="primary">Szczegóły</Button>
                    </Link>
                </Space>
            );
        },
    },
];

interface OrderIndexProps {
    orders: DataType[];
}

function OrderIndex({ orders }: OrderIndexProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = () => {
        form.validateFields()
            .then((values) => {
                router.post(route('orders.store'), values, {
                    onSuccess: () => {
                        message.success('Zamówienie zostało utworzone!');
                        setIsModalVisible(false);
                        form.resetFields();
                    },
                    onError: () => {
                        message.error('Wystąpił błąd podczas tworzenia zamówienia');
                    },
                });
            });
    };

    return (
        <>
            <HeaderCard
                title="Zamówienia"
                icon={<ShoppingCartOutlined />}
                extra={(
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={showModal}
                    >
                        Nowe zamówienie
                    </Button>
                )}
                expanded
            />

            <Table<DataType>
                columns={columns}
                dataSource={orders}
                rowKey="id"
            />

            <Modal
                title="Nowe zamówienie"
                open={isModalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                okText="Zapisz"
                cancelText="Anuluj"
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="restaurant_name"
                        label="Nazwa restauracji"
                        rules={[{ required: true, message: 'Proszę podać nazwę restauracji' }]}
                    >
                        <Input placeholder="Wprowadź nazwę restauracji" />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
}

OrderIndex.layout = (page: React.ReactNode) => <Layout children={page} title="Zamówienia" />;
export default OrderIndex;
