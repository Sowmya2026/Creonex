import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Mail, Calendar, Search, Briefcase, Phone, CheckCircle, Clock, Trash2, Video, Eye, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const BrandsCollabsPage = () => {
    const { showError } = useToast();
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [viewInquiry, setViewInquiry] = useState(null);

    const fetchInquiries = async () => {
        try {
            const res = await api.get('/contact');
            // Filter for brands and collaborations
            const brandsCollabs = res.data.filter(inquiry =>
                inquiry.type === 'collaboration' ||
                inquiry.company || // If company name exists, treat as Brand/Collab
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
                // Fetch inquiries FIRST
                await fetchInquiries();
                // Then mark as read in the background (don't block the UI)
                api.patch('/contact/read-all').catch(err => console.warn("Failed to mark all as read:", err));
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
            if (viewInquiry && viewInquiry.id === id) {
                setViewInquiry({ ...viewInquiry, status: newStatus });
            }
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
            if (viewInquiry && viewInquiry.id === showDeleteConfirm) {
                setViewInquiry(null);
            }
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
        <div className="page-padding">
            <div className="header-actions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
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
                            transition: 'background 0.2s',
                            whiteSpace: 'nowrap'
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
            <div className="filter-tabs">
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
                <>
                    {/* Desktop Table */}
                    <div className="table-container desktop-only">
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
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <button
                                                        onClick={() => setViewInquiry(inquiry)}
                                                        style={{
                                                            padding: '0.4rem',
                                                            background: '#f3f4f6',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            color: '#4b5563',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
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
                                                                color: '#dc2626',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
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

                    {/* Mobile Card View */}
                    <div className="mobile-only">
                        {filteredInquiries.length > 0 ? (
                            filteredInquiries.map((inquiry) => (
                                <div key={inquiry.id} className="mobile-inquiry-card" style={{
                                    borderLeft: inquiry.status === 'completed' ? '4px solid #059669' : '4px solid #f59e0b'
                                }}>
                                    <div className="mobile-card-header">
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{inquiry.name}</div>
                                            {inquiry.company && (
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    color: 'var(--accent-color)',
                                                    fontWeight: '600',
                                                    marginTop: '2px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    <Briefcase size={12} style={{ marginRight: '4px' }} />
                                                    {inquiry.company}
                                                </div>
                                            )}
                                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                                {formatDate(inquiry.createdAt)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleStatusChange(inquiry.id, inquiry.status === 'completed' ? 'pending' : 'completed')}
                                            style={{
                                                padding: '0.25rem 0.5rem',
                                                background: inquiry.status === 'completed' ? '#059669' : '#f59e0b',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {inquiry.status === 'completed' ? 'Completed' : 'Pending'}
                                        </button>
                                    </div>

                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Type:</span>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            color: inquiry.type === 'collaboration' ? '#1565c0' : '#e65100',
                                            textTransform: 'capitalize'
                                        }}>
                                            {inquiry.type || 'Collaboration'}
                                        </span>
                                    </div>

                                    <div className="mobile-card-row">
                                        <span className="mobile-card-label">Email:</span>
                                        <a href={`mailto:${inquiry.email}`} className="text-link" style={{ fontSize: '0.85rem' }}>{inquiry.email}</a>
                                    </div>

                                    <div style={{ margin: '0.75rem 0', background: '#f9f9f9', padding: '0.75rem', borderRadius: '4px', fontSize: '0.9rem', color: '#555' }}>
                                        {inquiry.message && inquiry.message.length > 100
                                            ? `${inquiry.message.substring(0, 100)}...`
                                            : inquiry.message}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                                        <button
                                            onClick={() => setViewInquiry(inquiry)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                background: '#f3f4f6',
                                                color: '#374151',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontWeight: '600'
                                            }}
                                        >
                                            <Eye size={16} /> View
                                        </button>

                                        {inquiry.status === 'completed' && (
                                            <button
                                                onClick={() => handleDeleteClick(inquiry.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    background: '#fee2e2',
                                                    color: '#991b1b',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    fontWeight: '600'
                                                }}
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No inquiries found</div>
                        )}
                    </div>
                </>
            )}


            {/* View Inquiry Modal */}
            {viewInquiry && (
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
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        position: 'relative',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <button
                            onClick={() => setViewInquiry(null)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            <X size={24} />
                        </button>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1a1a1a', paddingRight: '2rem' }}>
                            Brand/Collab Inquiry Details
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>From:</span>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{viewInquiry.name}</div>
                                    {viewInquiry.company && <div style={{ color: '#666', fontWeight: '500' }}>{viewInquiry.company}</div>}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Type:</span>
                                <span style={{
                                    padding: '4px 12px',
                                    backgroundColor: viewInquiry.type === 'collaboration' ? '#e3f2fd' : '#fff3e0',
                                    color: viewInquiry.type === 'collaboration' ? '#1565c0' : '#e65100',
                                    borderRadius: '16px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    textTransform: 'capitalize'
                                }}>
                                    {viewInquiry.type || 'Collaboration'}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Contact:</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Mail size={16} color="#666" />
                                        <a href={`mailto:${viewInquiry.email}`} className="text-link" style={{ color: 'var(--primary-color)' }}>{viewInquiry.email}</a>
                                    </div>
                                    {viewInquiry.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={16} color="#666" />
                                            <a href={`tel:${viewInquiry.phone}`} className="text-link" style={{ color: 'var(--primary-color)' }}>{viewInquiry.phone}</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Status:</span>
                                <div>
                                    <button
                                        onClick={() => handleStatusChange(viewInquiry.id, viewInquiry.status === 'completed' ? 'pending' : 'completed')}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: viewInquiry.status === 'completed' ? '#059669' : '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {viewInquiry.status === 'completed' ? (
                                            <><CheckCircle size={16} /> Completed</>
                                        ) : (
                                            <><Clock size={16} /> Pending</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(100px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Date:</span>
                                <span>{formatDate(viewInquiry.createdAt)}</span>
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#374151' }}>Message</h4>
                                <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {viewInquiry.message}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                            <a
                                href={`mailto:${viewInquiry.email}`}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#8B6F47',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    flex: '1 0 140px',
                                    justifyContent: 'center'
                                }}
                            >
                                <Mail size={18} /> Reply
                            </a>
                            <button
                                onClick={() => setViewInquiry(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flex: '1 0 100px'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
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
