import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    FileText,
    Image as ImageIcon,
    BookOpen,
    Download,
    Eye,
    X,
    Upload,
    CheckCircle,
    AlertCircle,
    EyeOff,
    XCircle
} from 'lucide-react';
import './CatalogsPage.css';

const getImageUrl = (url) => {
    if (!url) return '';
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    if (url.startsWith('http') || url.startsWith('data:')) {
        if (!serverUrl.includes('localhost') && url.includes('localhost:5000')) {
            return url.replace('http://localhost:5000', serverUrl);
        }
        return url;
    }
    return `${serverUrl}${url}`;
};

const CatalogsPage = () => {
    const { showSuccess, showError } = useToast();
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        pageCount: '',
        isActive: true,
        coverImage: null
    });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchCatalogs();
    }, []);

    const fetchCatalogs = async () => {
        try {
            const res = await api.get('/catalogs/admin/all');
            setCatalogs(res.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch catalogs:', error);
            if (error.response?.status === 404) {
                showError('Server endpoint not found. Please restart the backend server to load new routes.');
            } else {
                showError('Failed to fetch catalogs');
            }
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                [type]: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);

        try {
            let coverImageUrl = editingItem?.coverImageUrl;

            // 1. Upload Cover Image if changed
            if (formData.coverImage) {
                const imageFormData = new FormData();
                imageFormData.append('image', formData.coverImage);
                imageFormData.append('folder', 'catalogs-covers');

                const imageRes = await api.post('/upload/image', imageFormData);
                coverImageUrl = imageRes.data.data.url;
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                price: formData.price,
                pageCount: formData.pageCount,
                isActive: formData.isActive,
                coverImageUrl
            };

            if (editingItem) {
                await api.put(`/catalogs/${editingItem.id}`, payload);
                showSuccess('Catalog updated successfully');
            } else {
                if (!coverImageUrl) {
                    throw new Error('Please provide a cover image');
                }
                await api.post('/catalogs', payload);
                showSuccess('Catalog created successfully');
            }

            setShowModal(false);
            setEditingItem(null);
            resetForm();
            fetchCatalogs();
        } catch (error) {
            console.error('Submit error:', error);
            showError(error.response?.data?.message || error.message || 'Failed to save catalog');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) return;
        try {
            await api.delete(`/catalogs/${showDeleteConfirm}`);
            showSuccess('Catalog deleted successfully');
            setShowDeleteConfirm(null);
            fetchCatalogs();
        } catch (error) {
            console.error('Delete error:', error);
            showError('Failed to delete catalog');
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const newStatus = item.isActive === false ? true : false;

            // Optimistic update
            setCatalogs(catalogs.map(i =>
                i.id === item.id ? { ...i, isActive: newStatus } : i
            ));

            await api.put(`/catalogs/${item.id}`, { isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showError('Failed to update status');
            fetchCatalogs(); // Revert
        }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            description: item.description,
            price: item.price,
            pageCount: item.pageCount,
            isActive: item.isActive,
            coverImage: null
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            price: '',
            pageCount: '',
            isActive: true,
            coverImage: null
        });
    };

    const filteredCatalogs = catalogs.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-padding">
            <div className="header-actions">
                <div>
                    <h1 className="page-title">Design Catalogs</h1>
                    <p className="page-subtitle">Manage your PDF design catalogs for sale</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingItem(null);
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={20} /> Add Catalog
                </button>
            </div>

            {/* Search and Filter */}
            <div className="filter-tabs">
                <div className="search-wrapper" style={{ marginRight: 'auto', minWidth: '200px' }}>
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search catalogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setStatusFilter('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: statusFilter === 'all' ? '#8B6F47' : 'white',
                            color: statusFilter === 'all' ? 'white' : '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem'
                        }}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: statusFilter === 'active' ? '#059669' : 'white',
                            color: statusFilter === 'active' ? 'white' : '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <CheckCircle size={14} /> Active
                    </button>
                    <button
                        onClick={() => setStatusFilter('inactive')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: statusFilter === 'inactive' ? '#dc2626' : 'white',
                            color: statusFilter === 'inactive' ? 'white' : '#666',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                        }}
                    >
                        <XCircle size={14} /> Inactive
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="loading-state">Loading catalogs...</div>
            ) : filteredCatalogs.length === 0 ? (
                <div className="empty-state">
                    <BookOpen size={48} />
                    <h3>No catalogs found</h3>
                    <p>Get started by creating your first design catalog.</p>
                </div>
            ) : (
                <div className="portfolio-grid">
                    {filteredCatalogs
                        .filter(item => {
                            if (statusFilter === 'active') return item.isActive !== false;
                            if (statusFilter === 'inactive') return item.isActive === false;
                            return true;
                        })
                        .map(item => (
                            <div key={item.id} className={`card ${!item.isActive ? 'opacity-75' : ''}`}>
                                <div className="card-image-wrapper">
                                    <img
                                        src={getImageUrl(item.coverImageUrl)}
                                        alt={item.title}
                                        className="card-image"
                                        onError={(e) => e.target.src = 'https://placehold.co/600x400?text=Cover+Image'}
                                    />
                                    <span className={`status-badge ${item.isActive !== false ? 'active' : 'inactive'}`}
                                        style={{
                                            background: item.isActive !== false ? '#059669' : '#dc2626',
                                            color: 'white',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            zIndex: 2
                                        }}>
                                        {item.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{item.title}</h3>
                                    <div className="card-meta">
                                        <span>${Number(item.price).toFixed(2)}</span>
                                        <span>•</span>
                                        <span>{item.pageCount} Pages</span>
                                    </div>
                                    <p className="card-description line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="card-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleToggleActive(item)}
                                            title={item.isActive !== false ? "Deactivate" : "Activate"}
                                            style={{ color: item.isActive !== false ? '#dc2626' : '#059669' }}
                                        >
                                            {item.isActive !== false ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => openEditModal(item)}
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
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
                            </div>
                        ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingItem ? 'Edit Catalog' : 'Add New Catalog'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Summer Collection 2026"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Page Count</label>
                                    <input
                                        type="number"
                                        name="pageCount"
                                        value={formData.pageCount}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Describe contents of this catalog..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Cover Image {editingItem && '(Leave empty to keep)'}</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'coverImage')}
                                            id="cover-upload"
                                            className="hidden-input"
                                        />
                                        <label htmlFor="cover-upload" className="file-drop-zone">
                                            {formData.coverImage ? (
                                                <div className="file-selected">
                                                    <ImageIcon size={24} />
                                                    <span>{formData.coverImage.name}</span>
                                                </div>
                                            ) : (
                                                <div className="file-placeholder">
                                                    <ImageIcon size={24} />
                                                    <span>Click to upload cover</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkbox-text">Active (Visible to clients)</span>
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={formLoading}
                                >
                                    {formLoading ? 'Saving...' : (editingItem ? 'Update Catalog' : 'Create Catalog')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <AlertCircle size={48} className="text-danger" />
                        <h3>Delete Catalog?</h3>
                        <p>This action cannot be undone. The catalog will be permanently removed.</p>
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

export default CatalogsPage;
