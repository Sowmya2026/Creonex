import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, MapPin, Globe, Clock, Smartphone, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const VisitorsPage = () => {
    const { showSuccess, showError } = useToast();
    const [visitors, setVisitors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            const res = await api.get('/visitors');
            setVisitors(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch visitors", error);
            showError('Failed to load visitors');
            setLoading(false);
        }
    };

    const handleClearData = async () => {
        try {
            setLoading(true);
            await api.delete('/visitors/clear');
            showSuccess('Visitor data cleared successfully');
            setShowClearConfirm(false);
            fetchVisitors();
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
        <div className="page-padding">
            <div className="header-actions">
                <div>
                    <h1 className="page-title">Recent Visitors</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '4px' }}>
                        Track monitoring and analytics
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
                        Clear Data
                    </button>
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
            </div>

            {loading ? (
                <div className="loading-state">Loading visitors...</div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {filteredVisitors.length > 0 ? (
                        filteredVisitors.map((visitor) => (
                            <div
                                key={visitor.id}
                                className="list-item-card"
                                style={{
                                    borderLeft: '4px solid #10b981'
                                }}
                            >
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                                            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{visitor.ip}</span>
                                        </div>
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
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getDeviceIcon(visitor.userAgent)}
                                            <span style={{ wordBreak: 'break-all' }}>
                                                {visitor.userAgent || 'Unknown'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
                                            <Clock size={16} />
                                            {formatDate(visitor.lastVisit)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ background: 'white', padding: '3rem', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
                            No visitors found
                        </div>
                    )}
                </div>
            )}

            {/* Clear Data Confirmation Modal */}
            {showClearConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: '#fee2e2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <AlertCircle size={32} color="#dc2626" />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 'bold' }}>Clear All Visitor Data?</h3>
                        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.5' }}>
                            This action cannot be undone. This will permanently delete all visitor tracking history and analytics data.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowClearConfirm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: '#4b5563'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleClearData}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#dc2626',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    color: 'white'
                                }}
                            >
                                Yes, Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisitorsPage;
