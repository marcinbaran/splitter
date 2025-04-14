import { ReactNode, useState } from 'react';
import Layout from '@/layouts/Layout';
import { Card, Col, Divider, Row, Select, Space, Statistic, Typography } from 'antd';
import { PageProps } from '@inertiajs/inertia';
import { Line } from '@ant-design/charts';

const { Title } = Typography;
const { Option } = Select;

interface StatisticsPageProps extends PageProps {
    stats: {
        paidAmount: number;
        unpaidAmount: number;
        paidCount: number;
        unpaidCount: number;
        monthlyStats: Array<{
            month: number;
            paid_amount: number;
            unpaid_amount: number;
        }>;
    };
    filters: {
        year: number;
        month: number | null;
    };
    availableYears: number[];
}

function Statistics({ stats, filters, availableYears }: StatisticsPageProps) {
    const [year, setYear] = useState<number>(filters.year);
    const [month, setMonth] = useState<number | null>(filters.month);

    const handleYearChange = (value: number) => {
        setYear(value);
        window.location.href = `/statistics?year=${value}&month=${month || ''}`;
    };

    const handleMonthChange = (value: number | null) => {
        setMonth(value);
        window.location.href = `/statistics?year=${year}&month=${value || ''}`;
    };

    const monthOptions = [
        { value: null, label: 'Wszystkie miesiące' },
        { value: 1, label: 'Styczeń' },
        { value: 2, label: 'Luty' },
        { value: 3, label: 'Marzec' },
        { value: 4, label: 'Kwiecień' },
        { value: 5, label: 'Maj' },
        { value: 6, label: 'Czerwiec' },
        { value: 7, label: 'Lipiec' },
        { value: 8, label: 'Sierpień' },
        { value: 9, label: 'Wrzesień' },
        { value: 10, label: 'Październik' },
        { value: 11, label: 'Listopad' },
        { value: 12, label: 'Grudzień' },
    ];

    const monthlyChartData = stats.monthlyStats.map(item => ({
        month: `${item.month}/${year}`,
        paid: item.paid_amount,
        unpaid: item.unpaid_amount,
    }));

    const monthlyConfig = {
        data: monthlyChartData,
        xField: 'month',
        yField: ['paid', 'unpaid'],
        isStack: true,
        yAxis: {
            label: {
                formatter: (v: number) => `${v.toFixed(2)} zł`,
            },
        },
    };

    return (
        <div style={{ padding: 24 }}>
            <Title level={2}>Moje statystyki zamówień</Title>

            <Space size="large" style={{ marginBottom: 24 }}>
                <Select
                    value={year}
                    onChange={handleYearChange}
                    style={{ width: 120 }}
                >
                    {availableYears.map(y => (
                        <Option key={y} value={y}>{y}</Option>
                    ))}
                </Select>

                <Select
                    value={month}
                    onChange={handleMonthChange}
                    style={{ width: 180 }}
                    placeholder="Wybierz miesiąc"
                >
                    {monthOptions.map(m => (
                        <Option key={m.value || 0} value={m.value}>{m.label}</Option>
                    ))}
                </Select>
            </Space>

            <Divider />

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Opłacone zamówienia"
                            value={stats.paidCount}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Nieopłacone zamówienia"
                            value={stats.unpaidCount}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Łączna wartość"
                            value={(stats.paidAmount + stats.unpaidAmount).toFixed(2)}
                            suffix="zł"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Card title="Wartość zamówień w miesiącach">
                        <Line {...monthlyConfig} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

Statistics.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje statystyki" />
);

export default Statistics;
