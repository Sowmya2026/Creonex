import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Image as ImageIcon, ExternalLink, Link as LinkIcon, Upload, Wand2, Eye, EyeOff, CheckCircle, XCircle, Star } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const LinksPage = () => {
    const { showSuccess, showError } = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetchingMeta, setFetchingMeta] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        url: '',
        imageUrl: '',
        price: '',
        rating: '',
        description: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/links');
            setItems(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch links:', error);
            showError('Failed to load links. Please refresh the page.');
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
            showError(`File ${file.name} is not a valid image type`);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError(`File ${file.name} is too large (max 5MB)`);
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
            // Important: 'folder' must be appended BEFORE 'image' for Multer to read it in time
            formDataUpload.append('folder', 'links');
            formDataUpload.append('image', imageFile);

            const response = await api.post('/upload/image', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Return relative path (e.g., /uploads/links/filename.jpg)
                return response.data.data.url;
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

    const handleFetchMeta = async () => {
        if (!formData.url) {
            showError('Please enter a URL first');
            return;
        }

        setFetchingMeta(true);
        try {
            const res = await api.post('/links/meta', { url: formData.url });
            if (res.data.success) {
                const { title, description, imageUrl, price } = res.data.data;

                if (!title && !imageUrl) {
                    showError('Could not fetch significant data. Please fill manually.');
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    title: title || prev.title,
                    description: description || prev.description,
                    imageUrl: imageUrl || prev.imageUrl,
                    price: price || prev.price
                }));

                if (imageUrl) setImagePreview(imageUrl);
                showSuccess('Auto-filled from URL!');
            }
        } catch (err) {
            console.error('Meta fetch error:', err);
            showError('Failed to fetch info from URL.');
        } finally {
            setFetchingMeta(false);
        }
    };

    const handleToggleActive = async (item) => {
        try {
            const newStatus = item.isActive === false ? true : false;

            // Optimistic update
            setItems(items.map(i =>
                i.id === item.id ? { ...i, isActive: newStatus } : i
            ));

            await api.put(`/links/${item.id}`, { isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle active status:', error);
            showError('Failed to update status');
            fetchLinks(); // Revert
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.imageUrl;

            if (imageFile) {
                const uploadedUrl = await handleImageUpload();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    throw new Error('Failed to upload image');
                }
            }

            const linkData = {
                ...formData,
                imageUrl,
                order: parseInt(formData.order) || 0
            };

            if (editingId) {
                await api.put(`/links/${editingId}`, linkData);
                showSuccess('Link updated successfully!');
            } else {
                await api.post('/links', linkData);
                showSuccess('Link created successfully!');
            }

            await fetchLinks();
            resetForm();
        } catch (error) {
            console.error('Failed to save link:', error);
            showError('Failed to save link: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            title: item.title,
            url: item.url,
            imageUrl: item.imageUrl || '',
            price: item.price || '',
            rating: item.rating || '',
            description: item.description || '',
            isActive: item.isActive !== false,
            order: item.order || 0
        });
        setImagePreview(item.imageUrl || null);
        setImageFile(null);
        setEditingId(item.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm(id);
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;

        try {
            await api.delete(`/links/${showDeleteConfirm}`);
            showSuccess('Link deleted successfully!');
            await fetchLinks();
        } catch (error) {
            console.error('Failed to delete link:', error);
            showError('Failed to delete link');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            url: '',
            imageUrl: '',
            price: '',
            rating: '',
            description: '',
            isActive: true,
            order: 0
        });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowAddForm(false);
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading links...</div>;
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Affiliate Links</h1>
                {!showAddForm ? (
                    <button
                        onClick={() => {
                            resetForm();
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
                        Add Link
                    </button>
                ) : (
                    <button
                        onClick={resetForm}
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

            {showAddForm && (
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <LinkIcon size={24} color="#8B6F47" />
                        {editingId ? 'Edit Link' : 'Add New Link'}
                    </h2>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ gridColumn: '1 / span 1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., Canon EOS R5"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price (Optional)</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g., $3,500"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rating (0-5)</label>
                                <input
                                    type="number"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 4.5"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Affiliate URL *</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="url"
                                    name="url"
                                    value={formData.url}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="https://amazon.com/dp/..."
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleFetchMeta}
                                    disabled={fetchingMeta || !formData.url}
                                    title="Auto-fill details from URL"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0 1rem',
                                        background: '#E6FFFA',
                                        color: '#319795',
                                        border: '1px solid #B2F5EA',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.875rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    {fetchingMeta ? <Loader className="spin" size={16} /> : <Wand2 size={16} />}
                                    {fetchingMeta ? 'Fetching...' : 'Auto-Fill'}
                                </button>
                                {formData.url && (
                                    <a
                                        href={formData.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '45px',
                                            background: '#f5f5f5',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        <ExternalLink size={20} color="#666" />
                                    </a>
                                )}
                            </div>
                            <small style={{ color: '#666', marginTop: '0.25rem', display: 'block' }}>
                                Click 'Auto-Fill' to try fetching image and title from the link.
                            </small>
                        </div>

                        {/* Image Upload Area */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Product Image (Optional)
                            </label>

                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        border: '2px dashed #ddd',
                                        borderRadius: '8px',
                                        padding: '1.5rem',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: '#fafafa',
                                        transition: 'all 0.2s ease',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        minHeight: '150px'
                                    }}
                                >
                                    <Upload size={28} color="#888" />
                                    <p style={{ margin: '0.5rem 0 0', fontWeight: '500', color: '#333' }}>
                                        Click or drag to upload
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {imagePreview && (
                                    <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                        <img
                                            src={
                                                imagePreview.startsWith('data:') || imagePreview.startsWith('http')
                                                    ? imagePreview
                                                    : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + imagePreview
                                            }
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                border: '1px solid #eee',
                                                borderRadius: '8px'
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/150x150?text=Error';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImageFile(null);
                                                setImagePreview(null);
                                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                background: '#ff4d4f',
                                                color: 'white',
                                                borderRadius: '50%',
                                                width: '24px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Order</label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    style={{
                                        width: '100px',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span style={{ fontWeight: '500' }}>Active (Show on live site)</span>
                                </label>
                            </div>
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
                                {submitting ? 'Saving...' : (editingId ? 'Update Link' : 'Create Link')}
                            </button>
                        </div>
                    </form>
                </div>
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

            {/* List of Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {items.filter(item => {
                    if (statusFilter === 'active') return item.isActive !== false;
                    if (statusFilter === 'inactive') return item.isActive === false;
                    return true;
                }).map(item => (
                    <div key={item.id} style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{
                            height: '200px',
                            background: '#f9f9f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                        }}>
                            {item.imageUrl ? (
                                <img
                                    src={item.imageUrl.startsWith('http') ? item.imageUrl : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '') + item.imageUrl}
                                    alt={item.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                    }}
                                />
                            ) : (
                                <LinkIcon size={48} color="#ccc" />
                            )}
                            {!item.isActive && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem'
                                }}>
                                    Hidden
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h3>
                            {item.price && (
                                <p style={{ color: '#8B6F47', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.price}</p>
                            )}
                            {item.rating > 0 && (
                                <p style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B7791F', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                    <Star size={14} fill="#B7791F" /> {item.rating}
                                </p>
                            )}
                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{
                                color: '#666',
                                fontSize: '0.875rem',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '1rem',
                                display: 'block'
                            }}>
                                {item.url}
                            </a>

                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '1rem',
                                borderTop: '1px solid #eee'
                            }}>
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
                                            <><EyeOff size={12} /> Make Inactive</>
                                        ) : (
                                            <><Eye size={12} /> Make Active</>
                                        )}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'transparent',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(item.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: 'transparent',
                                            border: '1px solid #feebc8',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#c05621'
                                        }}
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <p>No links added yet. Click "Add Link" to get started.</p>
                </div>
            )}

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
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>Are you sure you want to delete this link? This action cannot be undone.</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f5f5f5',
                                    border: 'none',
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
                                    background: '#e53e3e',
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

export default LinksPage;
