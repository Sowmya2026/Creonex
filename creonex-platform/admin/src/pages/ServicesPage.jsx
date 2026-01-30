import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader, Power, FileUp, CheckCircle, XCircle } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'Package',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const serviceData = {
                ...formData,
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
            category: service.category || 'customization',
            features: (service.features || []).join('\n'),
            price: service.price || '',
            isActive: service.isActive !== false,
            order: service.order || 0
        });
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
            category: 'customization',
            features: '',
            price: '',
            isActive: true,
            order: 0
        });
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
                </div>
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
            <div style={{ display: 'grid', gap: '1rem' }}>
                {(() => {
                    const filteredServices = services.filter(service => {
                        if (statusFilter === 'active') return service.isActive !== false;
                        if (statusFilter === 'inactive') return service.isActive === false;
                        return true; // 'all'
                    });

                    if (filteredServices.length === 0) {
                        return (
                            <div style={{
                                background: 'white',
                                padding: '3rem',
                                borderRadius: '8px',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                {statusFilter === 'all'
                                    ? 'No services yet. Click "Add Service" to create one.'
                                    : statusFilter === 'active'
                                        ? 'No active services. Activate some services to show them on the client page.'
                                        : 'No inactive services.'}
                            </div>
                        );
                    }

                    return filteredServices.map(service => (
                        <div
                            key={service.id}
                            className="list-item-card"
                            style={{
                                opacity: service.isActive === false ? 0.6 : 1
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{service.title}</h3>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: service.isActive === false ? '#f5f5f5' : '#e8f5e9',
                                            color: service.isActive === false ? '#666' : '#2e7d32',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {service.isActive === false ? 'Inactive' : 'Active'}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            background: '#f5f5f5',
                                            color: '#666',
                                            borderRadius: '12px',
                                            fontSize: '0.75rem',
                                            textTransform: 'capitalize'
                                        }}>
                                            {service.category === 'catalog'
                                                ? 'Other Services'
                                                : service.category === 'product'
                                                    ? 'Product Services'
                                                    : service.category}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: '#666', marginBottom: '0.75rem' }}>{service.description}</p>
                                {service.features && service.features.length > 0 && (
                                    <ul style={{ color: '#888', fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
                                        {service.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                )}
                                {service.price && (
                                    <p style={{ color: '#8B6F47', fontWeight: '600', marginTop: '0.5rem' }}>
                                        {service.price}
                                    </p>
                                )}
                            </div>
                            <div className="list-item-actions">
                                <button
                                    onClick={() => handleToggleStatus(service)}
                                    style={{
                                        padding: '0.5rem',
                                        background: service.isActive === false ? '#ffebee' : '#e8f5e9',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        color: service.isActive === false ? '#c62828' : '#2e7d32'
                                    }}
                                    title={service.isActive === false ? "Activate" : "Deactivate"}
                                >
                                    <Power size={18} />
                                </button>
                                <button
                                    onClick={() => handleEdit(service)}
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
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(service.id)}
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
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ));
                })()}
            </div>

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
                                Are you sure you want to delete this service? This action cannot be undone.
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
                type="Services"
            />
        </div >
    );
};

export default ServicesPage;
