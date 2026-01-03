import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

const AnalyticsPage = () => {
    const [chartData, setChartData] = useState([]);
    const [topPages, setTopPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [chartRes, pagesRes] = await Promise.all([
                    api.get('/visitors/analytics'),
                    api.get('/visitors/analytics/pages')
                ]);
                setChartData(chartRes.data);
                setTopPages(pagesRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch analytics data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="page-container">
            <h1 className="page-title">Analytics Dashboard</h1>

            {loading ? (
                <div className="loading-state">Loading analytics...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Traffic Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3 className="chart-title">Traffic Overview (Last 7 Days)</h3>
                        </div>
                        <div style={{ height: '350px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8B6F47" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8B6F47" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3A2C27" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3A2C27" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="visitors"
                                        name="Unique Visitors"
                                        stroke="#8B6F47"
                                        fillOpacity={1}
                                        fill="url(#colorVisitors)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="views"
                                        name="Page Views"
                                        stroke="#3A2C27"
                                        fillOpacity={1}
                                        fill="url(#colorViews)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Pages */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3 className="chart-title">Top Viewed Pages</h3>
                        </div>
                        <div className="table-container" style={{ boxShadow: 'none' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Page URL</th>
                                        <th>Total Views</th>
                                        <th>Unique Visitors</th>
                                        <th>Views per Visitor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topPages.map((page, index) => (
                                        <tr key={index}>
                                            <td className="font-medium" style={{ color: '#3A2C27' }}>{page.page}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: `${(page.views / Math.max(...topPages.map(p => p.views))) * 100}px`,
                                                        height: '6px',
                                                        background: '#3A2C27',
                                                        borderRadius: '3px',
                                                        maxWidth: '100px'
                                                    }}></div>
                                                    {page.views}
                                                </div>
                                            </td>
                                            <td>{page.visitors}</td>
                                            <td>{(page.views / page.visitors).toFixed(1)}</td>
                                        </tr>
                                    ))}
                                    {topPages.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="empty-state">No page data available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
