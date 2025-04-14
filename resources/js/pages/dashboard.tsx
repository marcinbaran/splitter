import { ReactNode } from 'react';
import Layout from '@/layouts/Layout';
import HeaderCard from '@/components/HeaderCard';
import { PieChartOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

function Dashboard() {
    return (
        <>
            <HeaderCard title="Strona główna" icon={<PieChartOutlined/>} expanded />
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <Layout children={page} title="Strona główna" />;
export default Dashboard;
