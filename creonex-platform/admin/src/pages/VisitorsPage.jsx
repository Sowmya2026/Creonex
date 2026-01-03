import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Globe, Clock, Smartphone } from 'lucide-react';

const VisitorsPage = () => {
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVisitors = async () => {
            try {
                const res = await api.get('/visitors');
                setVisitors(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch visitors", error);
                setLoading(false);
            }
        };

        fetchVisitors();
    }, []);

    const filteredVisitors = visitors.filter(visitor =>
        visitor.ip.includes(searchTerm) ||
        (visitor.userAgent && visitor.userAgent.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return 'N/A';

            // Handle Firestore Timestamp object
            let date;
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp._seconds || timestamp.seconds) {
                // Firestore Timestamp has seconds or _seconds property (serialized)
                const seconds = timestamp._seconds || timestamp.seconds;
                date = new Date(seconds * 1000);
            } else {
                date = new Date(timestamp);
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
        }
    };

    const getDeviceIcon = (ua) => {
        if (!ua) return <Globe size={16} />;
        if (ua.toLowerCase().includes('mobile')) return <Smartphone size={16} />;
        return <Globe size={16} />;
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Recent Visitors</h1>
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by IP or Agent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading visitors...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>IP Address</th>
                                <th>Device / Agent</th>
                                <th>Visits</th>
                                <th>Last Visit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVisitors.length > 0 ? (
                                filteredVisitors.map((visitor) => (
                                    <tr key={visitor.id}>
                                        <td className="font-medium">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                                {visitor.ip}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '0.9rem' }}>
                                                {getDeviceIcon(visitor.userAgent)}
                                                <span style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {visitor.userAgent || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'rgba(139, 111, 71, 0.1)',
                                                color: '#8B6F47',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {visitor.visitCount} visits
                                            </span>
                                        </td>
                                        <td className="date-cell">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} />
                                                {formatDate(visitor.lastVisit)}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="empty-state">
                                        No visitors found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default VisitorsPage;
