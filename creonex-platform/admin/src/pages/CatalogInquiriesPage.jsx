import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
    Search,
    Trash2,
    Mail,
    Phone,
    User,
    Calendar,
    MessageCircle,
    Eye,
    X,
    CheckCircle,
    Clock
} from 'lucide-react';
import './CatalogInquiriesPage.css';

const CatalogInquiriesPage = () => {
    const { showSuccess, showError } = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [viewInquiry, setViewInquiry] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const res = await api.get('/catalog-inquiries/admin/all');
            setInquiries(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
            showError('Failed to fetch inquiries');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/catalog-inquiries/${showDeleteConfirm}`);
            showSuccess('Inquiry deleted successfully');
            setShowDeleteConfirm(null);
            if (viewInquiry && viewInquiry.id === showDeleteConfirm) {
                setViewInquiry(null);
            }
            fetchInquiries();
        } catch (error) {
            console.error('Delete error:', error);
            showError('Failed to delete inquiry');
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await api.put(`/catalog-inquiries/${id}`, { status: newStatus });
            // Optimistic update
            setInquiries(inquiries.map(item =>
                item.id === id ? { ...item, status: newStatus } : item
            ));

            // Also update view details if open
            if (viewInquiry && viewInquiry.id === id) {
                setViewInquiry({ ...viewInquiry, status: newStatus });
            }

            showSuccess('Status updated successfully');
        } catch (error) {
            console.error('Update status error:', error);
            showError('Failed to update status');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'Invalid Date';
        }
    };

    // Filter by search term
    const searchFilteredInquiries = inquiries.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.catalogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by active tab
    const filteredInquiries = activeTab === 'All'
        ? searchFilteredInquiries
        : searchFilteredInquiries.filter(item =>
            (item.status || 'New') === activeTab
        );

    // Count inquiries by status
    const statusCounts = {
        All: inquiries.length,
        New: inquiries.filter(i => (i.status || 'New') === 'New').length,
        Contacted: inquiries.filter(i => i.status === 'Contacted').length,
        Sold: inquiries.filter(i => i.status === 'Sold').length,
        Closed: inquiries.filter(i => i.status === 'Closed').length
    };

    const tabs = ['All', 'New', 'Contacted', 'Sold', 'Closed'];

    return (
        <div className="page-padding">
            <div className="header-actions">
                <div>
                    <h1 className="page-title">Catalog Inquiries</h1>
                    <p className="page-subtitle">Track interest in your design catalogs</p>
                </div>
                <div className="search-wrapper" style={{ minWidth: '250px' }}>
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="filter-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === tab ? '#8B6F47' : 'white',
                            color: activeTab === tab ? 'white' : '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        {tab} <span style={{ opacity: 0.8, fontSize: '0.85em', marginLeft: '4px' }}>({statusCounts[tab]})</span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="loading-state">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
                <div className="empty-state">
                    <MessageCircle size={48} />
                    <h3>No inquiries found</h3>
                    <p>
                        {searchTerm
                            ? 'No inquiries match your search criteria.'
                            : `No ${activeTab.toLowerCase()} inquiries at the moment.`}
                    </p>
                </div>
            ) : (
                <div className="inquiries-list">
                    {filteredInquiries.map(item => (
                        <div key={item.id} className="inquiry-card">
                            <div className="inquiry-header">
                                <div className="user-info">
                                    <h3 className="user-name">
                                        <User size={16} /> {item.name}
                                    </h3>
                                    <div className="contact-details">
                                        <span className="info-badge">
                                            <Mail size={14} /> {item.email}
                                        </span>
                                        {item.phone && (
                                            <span className="info-badge">
                                                <Phone size={14} /> {item.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="inquiry-meta">
                                    <span className="date-badge">
                                        <Calendar size={14} /> {formatDate(item.createdAt)}
                                    </span>
                                    <select
                                        className={`status-select ${(item.status || 'New').toLowerCase()}`}
                                        value={item.status || 'New'}
                                        onChange={(e) => updateStatus(item.id, e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Sold">Sold</option>
                                        <option value="Closed">Closed</option>
                                    </select>

                                    <button
                                        className="btn-icon"
                                        style={{ background: '#f3f4f6', color: '#4b5563', marginRight: '0.5rem' }}
                                        onClick={() => setViewInquiry(item)}
                                        title="View Details"
                                    >
                                        <Eye size={18} />
                                    </button>

                                    <button
                                        className="btn-icon danger"
                                        onClick={() => setShowDeleteConfirm(item.id)}
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="inquiry-content">
                                <div className="catalog-ref">
                                    <strong>Interested in:</strong> {item.catalogTitle || 'Unknown Catalog'}
                                </div>
                                {item.message && (
                                    <div className="message-box">
                                        <p>{item.message}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Inquiry Modal */}
            {viewInquiry && (
                <div className="modal-overlay">
                    <div style={{
                        background: 'white',
                        padding: '2rem',
                        borderRadius: '12px',
                        maxWidth: '600px',
                        width: '90%',
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
                            Catalog Inquiry Details
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>From:</span>
                                <div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{viewInquiry.name}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Interested In:</span>
                                <div>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        backgroundColor: '#e3f2fd',
                                        color: '#0d47a1',
                                        borderRadius: '4px',
                                        fontWeight: '600'
                                    }}>
                                        {viewInquiry.catalogTitle || 'Unknown Catalog'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
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

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Status:</span>
                                <div>
                                    <select
                                        className={`status-select ${(viewInquiry.status || 'New').toLowerCase()}`}
                                        value={viewInquiry.status || 'New'}
                                        onChange={(e) => updateStatus(viewInquiry.id, e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Sold">Sold</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, auto) 1fr', gap: '1rem', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: '600', color: '#666' }}>Date:</span>
                                <span>{formatDate(viewInquiry.createdAt)}</span>
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                                <h4 style={{ margin: '0 0 1rem', color: '#374151' }}>Message</h4>
                                <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {viewInquiry.message || 'No message provided.'}
                                </p>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <a
                                href={`mailto:${viewInquiry.email}?subject=Re: Inquiry for ${viewInquiry.catalogTitle}`}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#8B6F47',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '6px',
                                    fontWeight: '600',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Mail size={18} /> Reply via Email
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
                                    cursor: 'pointer'
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
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Delete Inquiry?</h3>
                        <p>This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleDelete}
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

export default CatalogInquiriesPage;
