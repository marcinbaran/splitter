import Layout from '@/layouts/Layout';
import { ReactNode } from 'react';
import { Typography, Card, Space } from 'antd';
import { ShopOutlined, LinkOutlined } from '@ant-design/icons';
import { usePage } from '@inertiajs/react';

const { Title, Text } = Typography;

interface Order {
    id: number;
    restaurant_name: string;
    url: string;
}

interface PageProps {
    order: Order;
    auth: {
        user: {
            id: number;
        };
    };
}

const OrderEdit = () => {
    const { props } = usePage<PageProps>();
    const { order } = props;

    return (
        <div className="container mx-auto px-4 py-6">
            <Space direction="vertical" size="large" className="w-full">
                <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <Title level={2} className="m-0 text-gray-800">
                                <ShopOutlined className="mr-2 text-blue-500" />
                                {order.restaurant_name}
                            </Title>
                            {order.url && (
                                <div className="mt-2">
                                    <a
                                        href={order.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        <LinkOutlined className="mr-1" />
                                        {order.url}
                                    </a>
                                </div>
                            )}
                        </div>
                        <Text type="secondary" className="mt-2 md:mt-0">
                            ID zamówienia: #{order.id}
                        </Text>
                    </div>
                </Card>
            </Space>
        </div>
    );
};

OrderEdit.layout = (page: ReactNode) => (
    <Layout children={page} title="Szczegóły zamówienia" />
);

export default OrderEdit;
