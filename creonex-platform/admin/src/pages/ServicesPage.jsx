import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Power, FileUp, CheckCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { compressImage } from '../utils/imageCompressor';

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;

    // Get the configured API base URL
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    if (url.startsWith('http')) {
        // Replace localhost with production server if needed
        if (!serverUrl.includes('localhost') && url.includes('localhost:5000')) {
            return url.replace('http://localhost:5000', serverUrl);
        }
        return url;
    }

    return `${serverUrl}${url}`;
};

const ServicesPage = () => {
    const { showSuccess, showError } = useToast();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);

    const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive

    // Image Upload State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'Package',
        image: '',
        category: 'customization',
        features: '',
        price: '',
        isActive: true,
        order: 0
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/services/admin/all');
            setServices(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            showError('Failed to load services. Please refresh the page.');
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
            showError(`File is not a valid image type`);
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError(`File is too large (max 5MB)`);
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
            // COMPRESS AND CONVERT TO BASE64 FOR FIRESTORE
            const base64Image = await compressImage(imageFile, {
                maxWidth: 600,
                maxHeight: 600,
                quality: 0.7
            });
            return base64Image;
        } catch (error) {
            console.error('Image processing failed:', error);
            showError('Failed to process image');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            let imageUrl = formData.image;

            if (imageFile) {
                const uploadedUrl = await handleImageUpload();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            const serviceData = {
                ...formData,
                image: imageUrl,
                features: formData.features.split('\n').filter(f => f.trim()),
                order: parseInt(formData.order) || 0
            };

            if (editingId) {
                await api.put(`/services/${editingId}`, serviceData);
                showSuccess('Service updated successfully!');
            } else {
                await api.post('/services', serviceData);
                showSuccess('Service created successfully!');
            }

            await fetchServices();
            resetForm();
        } catch (error) {
            console.error('Failed to save service:', error);
            showError('Failed to save service: ' + (error.response?.data?.message || error.message));
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (service) => {
        try {
            const newStatus = service.isActive === false; // Toggle logic (if false, become true)

            // Optimistic update
            setServices(services.map(s =>
                s.id === service.id ? { ...s, isActive: newStatus } : s
            ));

            await api.put(`/services/${service.id}`, { isActive: newStatus });
        } catch (error) {
            console.error('Failed to toggle status:', error);
            showError('Failed to update status');
            // Revert on error
            fetchServices();
        }
    };

    const handleEdit = (service) => {
        setFormData({
            title: service.title,
            description: service.description,
            icon: service.icon || 'Package',
            image: service.image || '',
            category: service.category || 'customization',
            features: (service.features || []).join('\n'),
            price: service.price || '',
            isActive: service.isActive !== false,
            order: service.order || 0
        });
        setImageFile(null);
        setImagePreview(service.image ? getImageUrl(service.image) : null);
        setEditingId(service.id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = (id) => {
        setShowDeleteConfirm(id);
    };

    const handleDeleteConfirm = async () => {
        if (!showDeleteConfirm) return;

        try {
            await api.delete(`/services/${showDeleteConfirm}`);
            showSuccess('Service deleted successfully!');
            await fetchServices();
        } catch (error) {
            console.error('Failed to delete service:', error);
            showError('Failed to delete service');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const handleImportData = async (data) => {
        let successCount = 0;
        for (const item of data) {
            try {
                if (!item.title || !item.description) continue;
                await api.post('/services', item);
                successCount++;
            } catch (err) {
                console.error('Import item error:', err);
            }
        }
        showSuccess(`Successfully imported ${successCount} of ${data.length} items.`);
        fetchServices();
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            icon: 'Package',
            image: '',
            category: 'customization',
            features: '',
            price: '',
            isActive: true,
            order: 0
        });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setEditingId(null);
        setShowAddForm(false);
    };

    if (loading) {
        return <div style={{ padding: '2rem' }}>Loading services...</div>;
    }

    return (
        <div className="page-padding">
            <div className="header-actions">
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>Services Management</h1>
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
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
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
                        {showAddForm ? <X size={20} /> : <Plus size={20} />}
                        {showAddForm ? 'Cancel' : 'Add Service'}
                    </button>
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
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                        {editingId ? 'Edit Service' : 'Add New Service'}
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
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Icon</label>
                                <input
                                    type="text"
                                    name="icon"
                                    value={formData.icon}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Package, Palette, Sparkles"
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>


                        {/* Image Upload Area */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Service Image (Optional)
                            </label>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="file-dropzone"
                                style={{
                                    border: '2px dashed #ddd',
                                    borderRadius: '8px',
                                    padding: '1.5rem',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: '#fafafa',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {imagePreview ? (
                                    <div style={{ position: 'relative', width: '100%', maxWidth: '200px', margin: '0 auto' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ width: '100%', borderRadius: '8px', border: '1px solid #eee' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setImageFile(null);
                                                setImagePreview(null);
                                                setFormData({ ...formData, image: '' });
                                                if (fileInputRef.current) fileInputRef.current.value = '';
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
                                ) : (
                                    <>
                                        <div style={{
                                            width: '50px',
                                            height: '50px',
                                            background: '#f0f0f0',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Upload size={24} color="#888" />
                                        </div>
                                        <p style={{ margin: 0, fontWeight: '500', color: '#333' }}>Click to upload image</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
                                            PNG, JPG (max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="grid-3" style={{ marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category</label>
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
                                    <option value="customization">Customization</option>
                                    <option value="catalog">Other Services we provide</option>
                                    <option value="brand">Brand Services</option>
                                    <option value="product">Product Services</option>
                                    <option value="general">General</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Price</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Starting at ₹999"
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

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
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

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                Features (one per line)
                            </label>
                            <textarea
                                name="features"
                                value={formData.features}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                />
                                <span style={{ fontWeight: '500' }}>Active (visible on client website)</span>
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
                                {submitting ? 'Saving...' : (editingId ? 'Update Service' : 'Create Service')}
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
                    All ({services.length})
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
                    <CheckCircle size={14} /> Active ({services.filter(s => s.isActive !== false).length})
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
                    <XCircle size={14} /> Inactive ({services.filter(s => s.isActive === false).length})
                </button>
            </div>

            {/* Services List */}
            {/* Services Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                {(() => {
                    const filteredServices = services.filter(service => {
                        if (statusFilter === 'active') return service.isActive !== false;
                        if (statusFilter === 'inactive') return service.isActive === false;
                        return true; // 'all'
                    });

                    if (filteredServices.length === 0) {
                        return (
                            <div style={{
                                gridColumn: '1 / -1',
                                background: 'white',
                                padding: '3rem',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                {statusFilter === 'all'
                                    ? 'No services yet. Click "Add Service" to create one.'
                                    : statusFilter === 'active'
                                        ? 'No active services.'
                                        : 'No inactive services.'}
                            </div>
                        );
                    }

                    return filteredServices.map(service => (
                        <div
                            key={service.id}
                            style={{
                                background: 'white',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                opacity: service.isActive === false ? 0.7 : 1,
                                border: service.isActive === false ? '1px dashed #ccc' : 'none'
                            }}
                        >
                            {/* Card Image */}
                            <div style={{
                                height: '200px',
                                background: '#f5f5f5',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {service.image ? (
                                    <img
                                        src={getImageUrl(service.image)}
                                        alt={service.title}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                        }}
                                    />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#ccc' }}>
                                        <ImageIcon size={48} />
                                        <span style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>No Image Set</span>
                                    </div>
                                )}

                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.9)',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#333',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}>
                                    {service.category}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{service.title}</h3>
                                </div>

                                <p style={{ color: '#8B6F47', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                    {service.price || 'Price on Request'}
                                </p>

                                <p style={{
                                    color: '#666',
                                    fontSize: '0.9rem',
                                    marginBottom: '1rem',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                }}>
                                    {service.description}
                                </p>

                                {service.features && service.features.length > 0 && (
                                    <div style={{ marginTop: 'auto', marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888', marginBottom: '0.25rem' }}>FEATURES:</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                            {service.features.slice(0, 3).map((feature, idx) => (
                                                <span key={idx} style={{
                                                    background: '#f0f0f0',
                                                    padding: '0.1rem 0.4rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.7rem',
                                                    color: '#555'
                                                }}>
                                                    {feature}
                                                </span>
                                            ))}
                                            {service.features.length > 3 && (
                                                <span style={{ fontSize: '0.7rem', color: '#888', alignSelf: 'center' }}>+{service.features.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginTop: 'auto',
                                    paddingTop: '1rem',
                                    borderTop: '1px solid #eee'
                                }}>
                                    <button
                                        onClick={() => handleToggleStatus(service)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: service.isActive === false ? '#ffefef' : '#f0fdf4',
                                            color: service.isActive === false ? '#d32f2f' : '#15803d',
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
                                        {service.isActive === false ? (
                                            <><Power size={14} /> Enable</>
                                        ) : (
                                            <><Power size={14} /> Disable</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(service)}
                                        style={{
                                            padding: '0.5rem',
                                            background: '#f5f5f5',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#666'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(service.id)}
                                        style={{
                                            padding: '0.5rem',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            color: '#dc2626'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ));
                })()}
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
                            Are you sure you want to delete this service? This action cannot be undone.
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

export default ServicesPage;
