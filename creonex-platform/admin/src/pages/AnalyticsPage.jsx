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
        <div className="page-padding">
            <div className="header-actions">
                <h1 className="page-title">Analytics Dashboard</h1>
            </div>

            {loading ? (
                <div className="loading-state">Loading analytics...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Traffic Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <h3 className="chart-title">Traffic Overview (Last 7 Days)</h3>
                        </div>
                        <div style={{ height: '350px', width: '100%', minWidth: 0 }}>
                            <ResponsiveContainer width="100%" height="100%" debounce={100}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
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
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {topPages.map((page, index) => (
                                <div
                                    key={index}
                                    className="list-item-card"
                                    style={{
                                        borderLeft: `4px solid ${index < 3 ? '#8B6F47' : '#ddd'}`
                                    }}
                                >
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#3A2C27', margin: 0, wordBreak: 'break-all' }}>
                                                {page.page}
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: `${(page.views / Math.max(...topPages.map(p => p.views))) * 100}px`,
                                                    height: '6px',
                                                    background: '#3A2C27',
                                                    borderRadius: '3px',
                                                    maxWidth: '100px',
                                                    minWidth: '10px'
                                                }}></div>
                                                <span style={{ fontWeight: '700', color: '#3A2C27' }}>{page.views} views</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#666', flexWrap: 'wrap' }}>
                                            <div>
                                                <span style={{ fontWeight: '600' }}>Unique Visitors:</span> {page.visitors}
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: '600' }}>Views/Visitor:</span> {(page.views / page.visitors).toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {topPages.length === 0 && (
                                <div className="empty-state" style={{ background: 'white', padding: '2rem', textAlign: 'center', color: '#888' }}>
                                    No page data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
