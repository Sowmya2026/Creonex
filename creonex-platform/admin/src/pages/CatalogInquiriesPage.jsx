import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
    Search,
    Trash2,
    Mail,
    Phone,
    User,
    FileText,
    Calendar,
    MessageCircle
} from 'lucide-react';
import './CatalogInquiriesPage.css';

const CatalogInquiriesPage = () => {
    const { showSuccess, showError } = useToast();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

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
        } catch (error) {
            console.error('Update status error:', error);
            showError('Failed to update status');
        }
    };

    const filteredInquiries = inquiries.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.catalogTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Catalog Inquiries</h1>
                    <p className="page-subtitle">Track interest in your design catalogs</p>
                </div>
            </div>

            <div className="filters-bar">
                <div className="search-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or catalog..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading inquiries...</div>
            ) : filteredInquiries.length === 0 ? (
                <div className="empty-state">
                    <MessageCircle size={48} />
                    <h3>No inquiries found</h3>
                    <p>When clients express interest in catalogs, they will appear here.</p>
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
                                        className={`status-select ${item.status?.toLowerCase()}`}
                                        value={item.status || 'New'}
                                        onChange={(e) => updateStatus(item.id, e.target.value)}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Sold">Sold</option>
                                        <option value="Closed">Closed</option>
                                    </select>
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
