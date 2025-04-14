import Layout from '@/layouts/Layout';
import { ReactNode } from 'react';

function OrderShow() {
    return (
        <>
            <h1>OrderShow</h1>
        </>
    );
}

OrderShow.layout = (page: ReactNode) => <Layout children={page} title="Szczegóły zamówienia" />;
export default OrderShow;
