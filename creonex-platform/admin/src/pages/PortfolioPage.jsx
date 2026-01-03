import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Image as ImageIcon, Star, Eye, EyeOff, FileUp, Upload, CheckCircle, XCircle, Video } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const PortfolioPage = () => {
    const { showSuccess, showError } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addItemType, setAddItemType] = useState('portfolio'); // 'portfolio' or 'reel'
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        category: 'catalog',
        tags: '',
        isFeatured: false,
        isActive: true,
        order: 0,
        reelLink: '',
        viewsCount: 0
    });

    useEffect(() => {
        fetchPortfolio();
    }, []);

    const fetchPortfolio = async () => {
        try {
            setLoading(true);
            const response = await api.get('/portfolio/admin/all');
            setItems(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
            showError('Failed to load portfolio. Please refresh the page.');
        } finally {
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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Image size must be less than 10MB');
            return;
        }

        setImageFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUpload = async () => {
        if (!imageFile) return null;

        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('image', imageFile);
            formDataUpload.append('folder', 'portfolio');

            const response = await api.post('/upload/image', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // Prepend server URL to the relative path
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const serverUrl = apiUrl.replace('/api', '');
                const relativePath = response.data.data.url;
                return serverUrl + relativePath;
            } else {
                throw new Error(response.data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            throw error;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.imageUrl;

            // If a new image file is selected, upload it first
            if (imageFile) {
                imageUrl = await handleImageUpload();
                if (!imageUrl) {
                    throw new Error('Failed to upload image');
                }
            }

            // Validate that we have an image URL
            if (!imageUrl && !formData.reelLink && !editingId) {
                showError('Please upload an image or provide a Reel link');
                setSubmitting(false);
                return;
            }

            const portfolioData = {
                ...formData,
                imageUrl: imageUrl,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                order: parseInt(formData.order) || 0,
                reelLink: formData.reelLink,
                viewsCount: parseInt(formData.viewsCount) || 0
            };

            if (editingId) {
                await api.put(`/portfolio/${editingId}`, portfolioData);
                showSuccess('Portfolio item updated successfully!');
            } else {
                await api.post('/portfolio', portfolioData);
                showSuccess('Portfolio item created successfully!');
            }

            await fetchPortfolio();
            resetForm();
        } catch (error) {
            console.error('Failed to save portfolio item:', error);
            showError('Failed to save portfolio item: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            description: item.description || '',
            imageUrl: item.imageUrl,
            category: item.category || 'catalog',
            tags: (item.tags || []).join(', '),
            isFeatured: item.isFeatured || false,
            isActive: item.isActive !== false,
            order: item.order || 0,
            reelLink: item.reelLink || '',
            viewsCount: item.viewsCount || 0
        });
        setImageFile(null);
        setImagePreview(item.imageUrl || null);
        setEditingId(item.id);
        setAddItemType(item.reelLink ? 'reel' : 'portfolio');
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleActive = async (item) => {
        try {
            // Toggle logic: if currently false, become true; if true or undefined, become false
            const newStatus = item.isActive === false ? true : false;

            // Optimistic update for immediate UI feedback
            setItems(items.map(i =>
                i.id === item.id ? { ...i, isActive: newStatus } : i
            ));

            await api.put(`/portfolio/${item.id}`, { isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showError('Failed to update status');
            // Revert on error
            fetchPortfolio();
        }
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm(id);
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;

        try {
            await api.delete(`/portfolio/${showDeleteConfirm}`);
            showSuccess('Portfolio item deleted successfully!');
            await fetchPortfolio();
        } catch (error) {
            console.error('Failed to delete portfolio item:', error);
            showError('Failed to delete portfolio item');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const handleImportData = async (data) => {
        let successCount = 0;
        for (const item of data) {
            try {
                // Basic validation
                if (!item.title || !item.imageUrl) continue;

                const payload = { ...item };
                if (typeof payload.tags === 'string') {
                    payload.tags = payload.tags.split(',').map(t => t.trim()).filter(Boolean);
                }

                await api.post('/portfolio', payload);
                successCount++;
            } catch (err) {
                console.error('Import item error:', err);
            }
        }
        showSuccess(`Successfully imported ${successCount} of ${data.length} items.`);
        fetchPortfolio();
    };

    const clearFormFields = () => {
        setFormData({
            title: '',
            description: '',
            imageUrl: '',
            category: 'catalog',
            tags: '',
            isFeatured: false,
            isActive: true,
            order: 0,
            reelLink: '',
            viewsCount: 0
        });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setEditingId(null);
    };

    const resetForm = () => {
        clearFormFields();
        setShowAddForm(false);
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading portfolio...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Portfolio Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setShowImportModal(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            background: 'white',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        <FileUp size={20} />
                        Bulk Import
                    </button>
                    {!showAddForm && (
                        <>
                            <button
                                onClick={() => {
                                    clearFormFields();
                                    setAddItemType('portfolio');
                                    setShowAddForm(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: '#8B6F47',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                <Plus size={20} />
                                Add Work
                            </button>
                            <button
                                onClick={() => {
                                    clearFormFields();
                                    setAddItemType('reel');
                                    setShowAddForm(true);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: '#E1306C',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                <Video size={20} />
                                Add Reel
                            </button>
                        </>
                    )}
                    {showAddForm && (
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                resetForm();
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                background: '#f5f5f5',
                                color: '#333',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}
                        >
                            <X size={20} />
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {addItemType === 'reel' ? <Video size={28} color="#E1306C" /> : <ImageIcon size={28} color="#8B6F47" />}
                        {editingId ? `Edit ${addItemType === 'reel' ? 'Reel' : 'Portfolio Item'}` : `Add New ${addItemType === 'reel' ? 'Reel' : 'Work'}`}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Wedding Lehenga Design"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <option value="catalog">Other Services we provide</option>
                                    <option value="customization">Customization</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="birthday">Birthday</option>
                                    <option value="events">Events</option>
                                    <option value="brand">Brand Services</option>
                                    <option value="collab">Collab Services</option>
                                </select>
                            </div>
                        </div>

                        {addItemType === 'reel' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Instagram Reel Link *</label>
                                    <input
                                        type="text"
                                        name="reelLink"
                                        value={formData.reelLink}
                                        onChange={handleInputChange}
                                        placeholder="https://www.instagram.com/reel/..."
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Views Count</label>
                                    <input
                                        type="number"
                                        name="viewsCount"
                                        value={formData.viewsCount}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                {addItemType === 'reel' ? 'Cover Image (Reference/Optional)' : 'Image *'}
                            </label>

                            {/* Image Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: imagePreview ? '#f9f9f9' : '#fafafa',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#8B6F47';
                                    e.currentTarget.style.background = '#f5f0eb';
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#ddd';
                                    e.currentTarget.style.background = imagePreview ? '#f9f9f9' : '#fafafa';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#ddd';
                                    e.currentTarget.style.background = imagePreview ? '#f9f9f9' : '#fafafa';
                                    const file = e.dataTransfer.files[0];
                                    if (file) {
                                        const fakeEvent = { target: { files: [file] } };
                                        handleImageSelect(fakeEvent);
                                    }
                                }}
                            >
                                {imagePreview ? (
                                    <>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                objectFit: 'contain',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#666' }}>
                                            <Upload size={18} />
                                            <span>Click or drag to replace image</span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            background: '#f0f0f0',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Upload size={28} color="#888" />
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '500', color: '#333' }}>
                                                Click to upload or drag and drop
                                            </p>
                                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#888' }}>
                                                PNG, JPG, GIF or WebP (max 10MB)
                                            </p>
                                        </div>
                                    </>
                                )}

                                {uploading && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        color: '#8B6F47'
                                    }}>
                                        <Loader className="spin" size={18} />
                                        <span>Uploading...</span>
                                    </div>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            {imageFile && (
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '0.5rem',
                                    background: '#e8f5e9',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    color: '#2e7d32',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <ImageIcon size={16} />
                                    <span>{imageFile.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreview(editingId ? formData.imageUrl : null);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Brief description of this work..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    placeholder="e.g., lehenga, bridal, red"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleInputChange}
                                />
                                <span style={{ fontWeight: '500' }}>Featured (show on homepage)</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1.5rem',
                                    background: submitting ? '#ccc' : '#8B6F47',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                {submitting ? <Loader className="spin" size={20} /> : <Save size={20} />}
                                {submitting ? 'Saving...' : (editingId ? 'Update Item' : 'Create Item')}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                disabled={submitting}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f5f5f5',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div >
            )}

            {/* Status Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
                background: 'white',
                padding: '0.75rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <span style={{ fontWeight: '600', color: '#666', marginRight: '0.5rem' }}>Filter:</span>
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
                    All ({items.length})
                </button>
                <button
                    onClick={() => setStatusFilter('active')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'active' ? '#059669' : 'transparent',
                        color: statusFilter === 'active' ? 'white' : '#666',
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
                    <CheckCircle size={14} /> Active ({items.filter(i => i.isActive !== false).length})
                </button>
                <button
                    onClick={() => setStatusFilter('inactive')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: statusFilter === 'inactive' ? '#dc2626' : 'transparent',
                        color: statusFilter === 'inactive' ? 'white' : '#666',
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
                    <XCircle size={14} /> Inactive ({items.filter(i => i.isActive === false).length})
                </button>
            </div>

            {/* Portfolio Grid */}
            {
                (() => {
                    const filteredItems = items.filter(item => {
                        if (statusFilter === 'active') return item.isActive !== false;
                        if (statusFilter === 'inactive') return item.isActive === false;
                        return true; // 'all'
                    });

                    return (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {filteredItems.length === 0 ? (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    background: 'white',
                                    padding: '3rem',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: '#666'
                                }}>
                                    {statusFilter === 'all'
                                        ? 'No portfolio items yet. Click "Add Portfolio Item" to create one.'
                                        : statusFilter === 'active'
                                            ? 'No active portfolio items. Activate some items to show them on the client page.'
                                            : 'No inactive portfolio items.'}
                                </div>
                            ) : (
                                filteredItems.map(item => (
                                    <div
                                        key={item.id}
                                        style={{
                                            background: 'white',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem',
                                            alignItems: 'flex-end',
                                            zIndex: 1
                                        }}>
                                            {item.isFeatured && (
                                                <div style={{
                                                    background: '#FFD700',
                                                    color: '#333',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}>
                                                    <Star size={12} fill="currentColor" />
                                                    Featured
                                                </div>
                                            )}
                                            {item.reelLink && (
                                                <div style={{
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    backdropFilter: 'blur(4px)',
                                                    color: '#E1306C', // Instagram color
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                                                    </svg>
                                                    Reel
                                                </div>
                                            )}
                                            {item.viewsCount > 0 && (
                                                <div style={{
                                                    background: 'rgba(0, 0, 0, 0.7)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                }}>
                                                    <Eye size={12} />
                                                    {item.viewsCount}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            width: '100%',
                                            height: '200px',
                                            background: '#f5f5f5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden'
                                        }}>
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = '<div style="color: #999;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div>';
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    height: '100%',
                                                    color: '#ccc',
                                                    gap: '0.5rem'
                                                }}>
                                                    {item.reelLink ? <Video size={48} /> : <ImageIcon size={48} />}
                                                    {item.reelLink && <span style={{ fontSize: '0.75rem' }}>Reel Video</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ padding: '1rem' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{item.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: '#f5f5f5',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    color: '#666',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {item.category === 'catalog' ? 'Other Services we provide' : item.category}
                                                </span>
                                                {item.tags && item.tags.length > 0 && item.tags.slice(0, 2).map((tag, idx) => (
                                                    <span key={idx} style={{
                                                        padding: '0.25rem 0.5rem',
                                                        background: '#e8f5e9',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        color: '#2e7d32'
                                                    }}>
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            {item.description && (
                                                <p style={{
                                                    color: '#666',
                                                    fontSize: '0.875rem',
                                                    marginBottom: '1rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical'
                                                }}>
                                                    {item.description}
                                                </p>
                                            )}
                                            {/* Status indicator */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '0.75rem',
                                                padding: '0.5rem',
                                                background: item.isActive !== false ? '#ecfdf5' : '#fef2f2',
                                                borderRadius: '6px'
                                            }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: item.isActive !== false ? '#059669' : '#dc2626'
                                                }}>
                                                    {item.isActive !== false ? '● Active' : '○ Inactive'}
                                                </span>
                                                <button
                                                    onClick={() => handleToggleActive(item)}
                                                    style={{
                                                        padding: '0.35rem 0.75rem',
                                                        background: item.isActive !== false ? '#dc2626' : '#059669',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}
                                                >
                                                    {item.isActive !== false ? (
                                                        <><EyeOff size={12} /> Deactivate</>
                                                    ) : (
                                                        <><Eye size={12} /> Activate</>
                                                    )}
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    style={{
                                                        padding: '0.5rem',
                                                        background: '#f5f5f5',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        color: '#8B6F47'
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(item.id)}
                                                    style={{
                                                        padding: '0.5rem',
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
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    );
                })()
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteConfirm && (
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
                                Are you sure you want to delete this portfolio item? This action cannot be undone.
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
                )
            }

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportData}
                type="Portfolio"
            />
        </div >
    );
};

export default PortfolioPage;
