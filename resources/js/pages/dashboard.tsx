import { ReactNode } from 'react';
import Layout from '@/layouts/Layout';

function Dashboard() {
    return (
        <h1>Dashfasfsboard</h1>
    );
}

Dashboard.layout = (page: ReactNode) => <Layout children={page} title="Dashboard" />;
export default Dashboard;
