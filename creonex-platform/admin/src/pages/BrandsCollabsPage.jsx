import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Calendar, Search, Briefcase, Phone, CheckCircle, Clock, Trash2, Video } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const BrandsCollabsPage = () => {
    const { showError } = useToast();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    const fetchInquiries = async () => {
        try {
            const res = await api.get('/contact');
            // Filter for brands and collaborations
            const brandsCollabs = res.data.filter(inquiry =>
                inquiry.type === 'collaboration' ||
                inquiry.subject?.toLowerCase().includes('brand') ||
                inquiry.subject?.toLowerCase().includes('collab')
            );
            setInquiries(brandsCollabs);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch brand inquiries", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeInquiries = async () => {
            try {
                // Mark all as read FIRST when page is visited
                await api.patch('/contact/read-all');
                await fetchInquiries();
            } catch (error) {
                console.error("Failed to fetch brand inquiries", error);
                setLoading(false);
            }
        };

        initializeInquiries();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/contact/${id}`, { status: newStatus });
            await fetchInquiries();
        } catch (error) {
            console.error('Failed to update status:', error);
            showError('Failed to update status');
        }
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm(id);
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/contact/${showDeleteConfirm}`);
            setShowDeleteConfirm(null);
            await fetchInquiries();
        } catch (error) {
            console.error('Failed to delete inquiry:', error);
            showError('Failed to delete inquiry');
        }
    };

    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.company?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'pending' && inquiry.status !== 'completed') ||
            (statusFilter === 'completed' && inquiry.status === 'completed');

        return matchesSearch && matchesStatus;
    });

    const formatDate = (timestamp) => {
        try {
            if (!timestamp) return 'N/A';
            let date;
            if (timestamp.toDate && typeof timestamp.toDate === 'function') {
                date = timestamp.toDate();
            } else if (timestamp._seconds || timestamp.seconds) {
                const seconds = timestamp._seconds || timestamp.seconds;
                date = new Date(seconds * 1000);
            } else {
                date = new Date(timestamp);
            }
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (error) {
            return 'N/A';
        }
    };

    const pendingCount = inquiries.filter(i => i.status !== 'completed').length;
    const completedCount = inquiries.filter(i => i.status === 'completed').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 className="page-title">Brands & Collaborations</h1>
                    <button
                        onClick={() => navigate('/portfolio')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: '#f3e8ff',
                            color: '#9333ea',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#e9d5ff'}
                        onMouseLeave={(e) => e.target.style.background = '#f3e8ff'}
                    >
                        <Video size={16} />
                        View Collabs Done
                    </button>
                </div>
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search brands/collabs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Status Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'white',
                padding: '0.5rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => setStatusFilter('all')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'all' ? '#8B6F47' : 'transparent',
                        color: statusFilter === 'all' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                    }}
                >
                    All ({inquiries.length})
                </button>
                <button
                    onClick={() => setStatusFilter('pending')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'pending' ? '#f59e0b' : 'transparent',
                        color: statusFilter === 'pending' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <Clock size={14} /> Pending ({pendingCount})
                </button>
                <button
                    onClick={() => setStatusFilter('completed')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'completed' ? '#059669' : 'transparent',
                        color: statusFilter === 'completed' ? 'white' : '#666',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                >
                    <CheckCircle size={14} /> Completed ({completedCount})
                </button>
            </div>

            {loading ? (
                <div className="loading-state">Loading brand inquiries...</div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name / Brand</th>
                                <th>Type</th>
                                <th>Contact Info</th>
                                <th>Message</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInquiries.length > 0 ? (
                                filteredInquiries.map((inquiry) => (
                                    <tr key={inquiry.id} style={{
                                        opacity: inquiry.status === 'completed' ? 0.7 : 1,
                                        background: inquiry.status === 'completed' ? '#f9fafb' : 'white'
                                    }}>
                                        <td>
                                            <div className="font-medium">{inquiry.name}</div>
                                            {inquiry.company && (
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--accent-color)',
                                                    fontWeight: '600',
                                                    marginTop: '2px'
                                                }}>
                                                    <Briefcase size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                    {inquiry.company}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                backgroundColor: inquiry.type === 'collaboration' ? '#e3f2fd' : '#fff3e0',
                                                color: inquiry.type === 'collaboration' ? '#1565c0' : '#e65100',
                                                fontWeight: '600',
                                                textTransform: 'capitalize'
                                            }}>
                                                {inquiry.type || 'Collaboration'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <a href={`mailto:${inquiry.email}`} className="text-link" style={{ fontSize: '0.9rem' }}>
                                                    {inquiry.email}
                                                </a>
                                                {inquiry.phone && (
                                                    <a href={`tel:${inquiry.phone}`} style={{
                                                        fontSize: '0.85rem',
                                                        color: 'var(--accent-color)',
                                                        textDecoration: 'none',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <span style={{
                                                            padding: '2px 6px',
                                                            background: 'var(--accent-light)',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem'
                                                        }}>CALL</span> {inquiry.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="message-cell">{inquiry.message}</td>
                                        <td className="date-cell">
                                            {formatDate(inquiry.createdAt)}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleStatusChange(inquiry.id, inquiry.status === 'completed' ? 'pending' : 'completed')}
                                                style={{
                                                    padding: '0.4rem 0.75rem',
                                                    background: inquiry.status === 'completed' ? '#059669' : '#f59e0b',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {inquiry.status === 'completed' ? (
                                                    <><CheckCircle size={12} /> Completed</>
                                                ) : (
                                                    <><Clock size={12} /> Pending</>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            {/* Only show delete button if completed */}
                                            {inquiry.status === 'completed' && (
                                                <button
                                                    onClick={() => handleDeleteClick(inquiry.id)}
                                                    style={{
                                                        padding: '0.4rem',
                                                        background: '#fee2e2',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#dc2626'
                                                    }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="empty-state">
                                        No brand or collaboration inquiries found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
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
                        borderRadius: '8px',
                        maxWidth: '400px',
                        width: '90%'
                    }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            Are you sure you want to delete this inquiry? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f5f5f5',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandsCollabsPage;
