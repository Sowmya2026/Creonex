import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    Search, MapPin, Globe, Clock, Smartphone, Trash2, AlertCircle, 
    Users, Eye, TrendingUp, Calendar, ChevronRight 
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const VisitorsPage = () => {
    const { showSuccess, showError } = useToast();
    const [visitors, setVisitors] = useState([]);
    const [stats, setStats] = useState({
        totalVisitors: 0,
        totalPageViews: 0,
        activeUsers: 0,
        todayVisitors: 0,
        monthVisitors: 0
    });
    const [topPages, setTopPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [visitorsRes, statsRes, topPagesRes] = await Promise.all([
                api.get('/visitors'),
                api.get('/visitors/stats'),
                api.get('/visitors/analytics/pages')
            ]);
            
            setVisitors(visitorsRes.data);
            setStats(statsRes.data);
            setTopPages(topPagesRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch visitor data", error);
            showError('Failed to load visitor data');
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        try {
            setLoading(true);
            await api.delete('/visitors/clear');
            showSuccess('Visitor data cleared successfully');
            setShowClearConfirm(false);
            fetchData();
        } catch (error) {
            console.error('Failed to clear data:', error);
            showError('Failed to clear data');
            setLoading(false);
        }
    };

    const filteredVisitors = visitors.filter(visitor =>
        visitor.ip.includes(searchTerm) ||
        (visitor.userAgent && visitor.userAgent.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return 'N/A';
            let date;
            if (timestamp.toDate) {
                date = timestamp.toDate();
            } else if (timestamp.seconds) {
                date = new Date(timestamp.seconds * 1000);
            } else if (timestamp._seconds) {
                date = new Date(timestamp._seconds * 1000);
            } else {
                date = new Date(timestamp);
            }

            if (isNaN(date.getTime())) return 'N/A';

            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const getDeviceIcon = (ua) => {
        if (!ua) return <Globe size={16} />;
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes('mobile') || lowerUA.includes('android') || lowerUA.includes('iphone')) {
            return <Smartphone size={16} />;
        }
        return <Globe size={16} />;
    };

    return (
        <div className="page-padding">
            <div className="header-actions">
                <div>
                    <h1 className="page-title">Visitor Analytics</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        Real-time visitor tracking and page view statistics
                    </p>
                </div>
                <div className="action-buttons">
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.6rem 1rem',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                    >
                        <Trash2 size={16} />
                        Clear All Data
                    </button>
                    <button 
                        onClick={fetchData}
                        className="btn-secondary"
                        style={{ padding: '0.6rem 1rem' }}
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Today's Visitors</h3>
                        <div className="stat-value">{stats.todayVisitors}</div>
                        <p className="stat-change positive">Active today</p>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                        <Users size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Monthly Visitors</h3>
                        <div className="stat-value">{stats.monthVisitors}</div>
                        <p className="stat-change positive">This current month</p>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <Calendar size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Total Page Views</h3>
                        <div className="stat-value">{stats.totalPageViews}</div>
                        <p className="stat-change positive">Cumulative views</p>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <Eye size={24} />
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Active Now</h3>
                        <div className="stat-value">{stats.activeUsers}</div>
                        <p className="stat-change positive">Last 15 minutes</p>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Visitors Table Section */}
                <div>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid #f0f0f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Recent Visitor Traffic</h2>
                            <div className="search-bar" style={{ width: '250px' }}>
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search IP or Device..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ padding: '0.5rem 1rem 0.5rem 2.5rem' }}
                                />
                            </div>
                        </div>

                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Device / Browser</th>
                                        <th>Visits</th>
                                        <th>Last Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" className="loading-state">Loading...</td></tr>
                                    ) : filteredVisitors.length > 0 ? (
                                        filteredVisitors.map((visitor) => (
                                            <tr key={visitor.id}>
                                                <td className="font-medium">{visitor.ip}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '300px' }}>
                                                        {getDeviceIcon(visitor.userAgent)}
                                                        <span style={{ 
                                                            fontSize: '0.85rem', 
                                                            color: '#666',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {visitor.userAgent || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ 
                                                        background: '#f3f4f6', 
                                                        padding: '2px 8px', 
                                                        borderRadius: '10px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        {visitor.visitCount}
                                                    </span>
                                                </td>
                                                <td className="date-cell">{formatDate(visitor.lastVisit)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="empty-state">No visitors found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Top Pages - Category Section */}
                <div>
                    <div style={{ 
                        background: 'white', 
                        borderRadius: '12px', 
                        padding: '1.5rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        border: '1px solid #f0f0f0',
                        position: 'sticky',
                        top: '90px'
                    }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} color="#8B6F47" />
                            Top Viewed Pages
                        </h2>
                        
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {topPages.length > 0 ? topPages.map((item, idx) => (
                                <div key={idx} style={{ 
                                    padding: '1rem', 
                                    background: '#fafafa', 
                                    borderRadius: '8px',
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444' }}>{item.page}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#8B6F47' }}>{item.views} Views</span>
                                    </div>
                                    {/* Progress bar */}
                                    <div style={{ width: '100%', height: '6px', background: '#e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ 
                                            width: `${Math.min(100, (item.views / (topPages[0]?.views || 1)) * 100)}%`, 
                                            height: '100%', 
                                            background: '#8B6F47',
                                            borderRadius: '3px'
                                        }}></div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'spaceBetween', marginTop: '0.4rem', fontSize: '0.75rem', color: '#888' }}>
                                        <span>{item.visitors} Unique Visitors</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="empty-state">No page data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear Data Confirmation Modal */}
            {showClearConfirm && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '12px',
                        width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{
                            width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                        }}>
                            <AlertCircle size={32} color="#dc2626" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>Clear All Business Data?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
                            You are about to delete all analytics and visitor tracking history. This action is permanent and cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowClearConfirm(false)} className="btn-secondary">Cancel</button>
                            <button onClick={handleClearData} style={{
                                padding: '0.75rem 1.5rem', background: '#dc2626', border: 'none',
                                borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: 'white'
                            }}>Yes, Clear Everything</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorsPage;
