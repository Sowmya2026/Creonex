import {
    Users,
    Eye,
    MousePointerClick,
    Clock
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import StatsCard from '../components/StatsCard';

import { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalVisitors: 0,
        totalPageViews: 0,
        activeUsers: 0
    });

    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, chartRes] = await Promise.all([
                    api.get('/visitors/stats'),
                    api.get('/visitors/analytics')
                ]);
                setStats(statsRes.data);
                setChartData(chartRes.data);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    const statsData = [
        { title: 'Total Visitors', value: stats.totalVisitors.toLocaleString(), change: '+', isPositive: true, icon: Users },
        { title: 'Page Views', value: stats.totalPageViews.toLocaleString(), change: '+', isPositive: true, icon: Eye },
        { title: 'Active Users', value: stats.activeUsers.toLocaleString(), change: 'Now', isPositive: true, icon: MousePointerClick },
        { title: 'Avg. Duration', value: 'N/A', change: '0%', isPositive: true, icon: Clock },
    ];

    return (
        <div className="page-padding">
            {/* Stats Grid */}
            <div className="stats-grid">
                {statsData.map((stat, index) => (
                    <StatsCard key={index} {...stat} />
                ))}
            </div>

            {/* Main Chart */}
            <div className="chart-container">
                <div className="header-actions" style={{ marginBottom: '1.5rem', justifyContent: 'space-between' }}>
                    <h3 className="chart-title" style={{ margin: 0 }}>Visitor Analytics</h3>
                    <select style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                    </select>
                </div>
                <div style={{ height: 350, width: '100%', minHeight: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
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
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                stroke="#8B6F47"
                                fillOpacity={1}
                                fill="url(#colorVisitors)"
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3A2C27"
                                fillOpacity={1}
                                fill="url(#colorViews)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
