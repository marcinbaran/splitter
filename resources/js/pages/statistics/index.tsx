import { ReactNode, useState } from 'react';
import Layout from '@/layouts/Layout';
import { Card, Col, Divider, Row, Select, Space, Statistic, Typography } from 'antd';
import { PageProps } from '@inertiajs/inertia';
import { Column } from '@ant-design/charts';

const { Title, Text } = Typography;
const { Option } = Select;

const getMonthName = (monthNumber: number): string => {
    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];
    return months[monthNumber - 1] || '';
};

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
    };
    availableYears: number[];
}

function Statistics({ stats, filters, availableYears }: StatisticsPageProps) {
    const [year, setYear] = useState<number>(filters.year);

    const handleYearChange = (value: number) => {
        setYear(value);
        window.location.href = `/statistics?year=${value}`;
    };

    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);

    const chartData = allMonths.map(monthNumber => {
        const existing = stats.monthlyStats.find(item => item.month === monthNumber);

        const paid = existing ? existing.paid_amount : 0;
        const unpaid = existing ? existing.unpaid_amount : 0;

        return {
            month: getMonthName(monthNumber),
            'Opłacone': paid,
            'Nieopłacone': unpaid,
            'Łącznie': paid + unpaid,
        };
    });

    const sortedChartData = [...chartData].sort((a, b) => {
        const monthsOrder = [
            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
        ];
        return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
    });

    const config = {
        data: sortedChartData,
        xField: 'month',
        yField: 'Łącznie',
        seriesField: 'month',
        color: '#1890ff',
        legend: false,
        yAxis: {
            label: {
                formatter: (v: string) => `${parseFloat(v).toFixed(2)} zł`,
            },
        },
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        tooltip: {
            showTitle: true,
            title: 'month',
            formatter: (datum: any) => {
                return {
                    name: 'Łącznie',
                    value: `${datum['Łącznie'].toFixed(2)} zł`,
                };
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

            {sortedChartData.length > 0 ? (
                <Row gutter={16}>
                    <Col span={24}>
                        <Card title={`Wartość zamówień w roku ${year}`}>
                            <Column {...config} />
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Card>
                    <Text type="warning">Brak danych do wyświetlenia dla wybranego roku</Text>
                </Card>
            )}
        </div>
    );
}

Statistics.layout = (page: ReactNode) => (
    <Layout children={page} title="Moje statystyki" />
);

export default Statistics;
