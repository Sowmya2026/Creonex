import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Image as ImageIcon, Star, Eye, EyeOff, FileUp, Upload, CheckCircle, XCircle, Video } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../utils/imageCompressor';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;

    // Get the configured API base URL (e.g. https://creonex.onrender.com)
    // Remove /api suffix if present to get the root server URL
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    // If the URL is already absolute
    if (url.startsWith('http')) {
        // If we are in a deployed environment (serverUrl is not localhost)
        // and the image URL points to localhost, rewrite it to use the production server
        if (!serverUrl.includes('localhost') && url.includes('localhost:5000')) {
            return url.replace('http://localhost:5000', serverUrl);
        }
        return url;
    }

    // If relative, prepend server URL
    return `${serverUrl}${url}`;
};

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
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]); // Previews for NEW files
    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '', // Kept for legacy/main image reference
        images: [], // Array of image URLs
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
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newFiles = [];
        const newPreviews = [];

        files.forEach(file => {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                showError(`File ${file.name} is not a valid image type`);
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError(`File ${file.name} is too large (max 10MB)`);
                return;
            }

            newFiles.push(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });

        setImageFiles(prev => [...prev, ...newFiles]);
    };

    const removeNewImage = (index) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleImageUpload = async () => {
        if (imageFiles.length === 0) return [];

        setUploading(true);
        try {
            // COMPRESS AND CONVERT TO BASE64 FOR FIRESTORE
            const uploadPromises = imageFiles.map(file =>
                compressImage(file, {
                    maxWidth: 800,
                    maxHeight: 800,
                    quality: 0.7
                })
            );

            const base64Images = await Promise.all(uploadPromises);
            return base64Images;

        } catch (error) {
            console.error('Image processing failed:', error);
            showError('Failed to process one or more images');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let finalImages = [...formData.images]; // Start with existing images

            // If new image files are selected, process them
            if (imageFiles.length > 0) {
                const newImageBase64s = await handleImageUpload();
                if (!newImageBase64s) {
                    throw new Error('Failed to process images');
                }
                finalImages = [...finalImages, ...newImageBase64s];
            }

            // Validate that we have at least one image if not a reel
            if (finalImages.length === 0 && !formData.reelLink && !editingId) {
                showError('Please upload at least one image or provide a Reel link');
                setSubmitting(false);
                return;
            }

            const portfolioData = {
                ...formData,
                imageUrl: finalImages[0] || '', // Main image is the first one
                images: finalImages,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                order: parseInt(formData.order) || 0,
                reelLink: formData.reelLink,
                viewsCount: parseInt(formData.viewsCount) || 0,
                // Ensure imageUrl is updated if needed for legacy backend support logic
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
            images: item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []),
            category: item.category || 'catalog',
            tags: (item.tags || []).join(', '),
            isFeatured: item.isFeatured || false,
            isActive: item.isActive !== false,
            order: item.order || 0,
            reelLink: item.reelLink || '',
            viewsCount: item.viewsCount || 0
        });
        setImageFiles([]);
        setImagePreviews([]);
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
            images: [],
            category: 'catalog',
            tags: '',
            isFeatured: false,
            isActive: true,
            order: 0,
            reelLink: '',
            viewsCount: 0
        });
        setImageFiles([]);
        setImagePreviews([]);
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
        <div className="page-padding">
            <div className="header-actions">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Portfolio Management</h1>
                <div className="action-buttons">
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
                        <div className="grid-2" style={{ marginBottom: '1rem' }}>
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
                                    <option value="product_services">Product Services</option>
                                </select>
                            </div>
                        </div>

                        {addItemType === 'reel' && (
                            <div className="grid-2" style={{ marginBottom: '1rem', gridTemplateColumns: '2fr 1fr' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Video Link (Instagram, Drive, YouTube) *</label>
                                    <input
                                        type="text"
                                        name="reelLink"
                                        value={formData.reelLink}
                                        onChange={handleInputChange}
                                        placeholder="Paste Instagram, Google Drive, or YouTube link..."
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



                        {/* Image Upload Area */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                {addItemType === 'reel' ? 'Cover Image (Reference/Optional)' : 'Images * (Multiple allowed)'}
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="file-dropzone"
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#8B6F47';
                                    e.currentTarget.style.background = '#f5f0eb';
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#ddd';
                                    e.currentTarget.style.background = '#fafafa';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.style.borderColor = '#ddd';
                                    e.currentTarget.style.background = '#fafafa';
                                    const files = e.dataTransfer.files;
                                    if (files && files.length > 0) {
                                        const fakeEvent = { target: { files: files } };
                                        handleImageSelect(fakeEvent);
                                    }
                                }}
                            >
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

                                {uploading && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#8B6F47' }}>
                                        <Loader className="spin" size={18} />
                                        <span>Process...</span>
                                    </div>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            {/* Scrollable Image Previews */}
                            {(formData.images.length > 0 || imagePreviews.length > 0) && (
                                <div style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    marginTop: '1rem',
                                    overflowX: 'auto',
                                    paddingBottom: '0.5rem',
                                    paddingTop: '0.5rem',
                                    scrollbarWidth: 'thin'
                                }}>
                                    {/* Existing Images */}
                                    {formData.images.map((url, index) => (
                                        <div key={`existing-${index}`} style={{ position: 'relative', flexShrink: 0, width: '150px', height: '150px' }}>
                                            <img
                                                src={getImageUrl(url)}
                                                alt={`Existing ${index}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
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
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                            <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}>Saved</div>
                                        </div>
                                    ))}

                                    {/* New Previews */}
                                    {imagePreviews.map((preview, index) => (
                                        <div key={`new-${index}`} style={{ position: 'relative', flexShrink: 0, width: '150px', height: '150px' }}>
                                            <img
                                                src={preview}
                                                alt={`Preview ${index}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
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
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                            <div style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(46, 125, 50, 0.8)', color: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '10px' }}>New</div>
                                        </div>
                                    ))}
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
                    </form >
                </div >
            )}

            {/* Status Filter Tabs */}
            <div className="filter-tabs">
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

            {/* Portfolio Grid - Replaced CLASS with INLINE GRID STYLES */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {items.filter(item => {
                    if (statusFilter === 'active') return item.isActive !== false;
                    if (statusFilter === 'inactive') return item.isActive === false;
                    return true;
                }).map(item => (
                    <div key={item.id} style={{
                        background: 'white',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: item.isActive === false ? 0.7 : 1
                    }}>
                        {/* Image Wrapper */}
                        <div style={{
                            position: 'relative',
                            height: '240px',
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {item.imageUrl ? (
                                <img
                                    src={getImageUrl(item.imageUrl)}
                                    alt={item.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f0f0f0',
                                    color: '#ccc'
                                }}>
                                    {item.reelLink ? <Video size={48} /> : <ImageIcon size={48} />}
                                    <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                        {item.reelLink ? 'Video Reel' : 'No Image'}
                                    </span>
                                </div>
                            )}

                            {item.isFeatured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    left: '10px',
                                    background: 'rgba(255, 215, 0, 0.9)',
                                    color: '#333',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }} title="Featured on Homepage">
                                    <Star size={12} fill="#333" />
                                    Featured
                                </div>
                            )}
                            {item.isActive === false && (
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(220, 38, 38, 0.9)',
                                    color: 'white',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600'
                                }}>
                                    Inactive
                                </div>
                            )}
                            {item.reelLink && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    padding: '6px',
                                    borderRadius: '50%'
                                }}>
                                    <Video size={20} />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>{item.title}</h3>
                            <div style={{
                                display: 'inline-block',
                                background: '#f5f5f5',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: '#666',
                                textTransform: 'capitalize',
                                marginBottom: '0.75rem',
                                alignSelf: 'flex-start'
                            }}>
                                {item.category}
                            </div>

                            {item.tags && item.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1rem' }}>
                                    {item.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} style={{ fontSize: '0.7rem', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px', color: '#666' }}>#{tag}</span>
                                    ))}
                                </div>
                            )}

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #eee', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => handleToggleActive(item)}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        background: item.isActive !== false ? '#f0fdf4' : '#fef2f2',
                                        color: item.isActive !== false ? '#15803d' : '#dc2626',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.25rem'
                                    }}
                                >
                                    {item.isActive !== false ? (
                                        <><Eye size={14} /> Hide</>
                                    ) : (
                                        <><EyeOff size={14} /> Show</>
                                    )}
                                </button>
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
                                        border: '1px solid #ddd',
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
                ))}
            </div>

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
                        width: '90%',
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1a1a1a' }}>Confirm Delete</h3>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            Are you sure you want to delete this item? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: '#f5f5f5',
                                    color: '#333',
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

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportData}
            />
        </div>
    );
};

export default PortfolioPage;
