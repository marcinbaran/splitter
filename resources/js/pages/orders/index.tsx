import React from 'react';
import { Button, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import Layout from '@/layouts/Layout';
import { PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from '@inertiajs/react';
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
        render: (_, record) => (
            <Space size="middle">
                <Link href={route('orders', record.id)}>Szczegóły</Link>
                <a>Anuluj</a>
            </Space>
        ),
    },
];

interface OrderIndexProps {
    orders: DataType[];
}

function OrderIndex({ orders }: OrderIndexProps) {
    return (
        <>
            <HeaderCard
                title="Zamówienia"
                icon={<ShoppingCartOutlined />}
                extra={(
                    <Link href={route('orders')}>
                        <Button type="primary" icon={<PlusOutlined />}>Nowe zamówienie</Button>
                    </Link>
                )}
                expanded
            />

            <Table<DataType>
                columns={columns}
                dataSource={orders}
                rowKey="id"
            />
        </>
    );
}

OrderIndex.layout = (page: React.ReactNode) => <Layout children={page} title="Zamówienia" />;
export default OrderIndex;
