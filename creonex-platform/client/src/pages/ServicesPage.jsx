import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Palette, Eye, Scissors, Clock, Package,
    Cake, Gem, PartyPopper, BookOpen, Crown,
    Shirt, Star, Award, Zap, Images, X, MessageCircle, ShoppingBag, FileText, CheckCircle
} from 'lucide-react';
import api from '../services/api';
import ServiceSkeleton from '../components/ServiceSkeleton';
import '../styles/services.css';

// Map of available icons to prevent importing the entire library
const ICON_MAP = {
    Palette, Eye, Scissors, Clock, Package,
    Cake, Gem, PartyPopper, BookOpen, Crown,
    Shirt, Star, Award, Zap
};

const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');
    return `${serverUrl}${url}`;
};

const ServicesPage = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [viewService, setViewService] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        fetchServices();
        window.scrollTo(0, 0);
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/services');
            const data = response.data.data || [];
            setServices(data);
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const waNumber = '918555074387'; // Indian format
            const text = `*New Service Inquiry*\n\n*Service:* ${selectedService.title}\n*Category:* ${selectedService.category || 'General'}\n*Name:* ${formData.name}\n*Email:* ${formData.email || 'N/A'}\n*WhatsApp:* ${formData.phone}\n\n*Message:*\n${formData.message || `I am interested in your ${selectedService.title} service.`}`;
            
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                setSelectedService(null);
                setFormData({ name: '', email: '', phone: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error('Failed to prepare WhatsApp message', error);
            alert('Failed to prepare WhatsApp message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper function to get icon component from string name
    const getIconComponent = (iconName) => {
        return ICON_MAP[iconName] || Package;
    };

    // Group services by category
    const groupedServices = useMemo(() => {
        return services.reduce((acc, service) => {
            const category = service.category || 'general';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(service);
            return acc;
        }, {});
    }, [services]);

    const renderServiceSection = (title, categoryKey) => {
        if (loading) {
            return (
                <div style={{ marginBottom: '4rem' }}>
                    {title && <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>{title}</h3>}
                    <div className="services-grid">
                        {[1, 2, 3].map(i => <ServiceSkeleton key={i} />)}
                    </div>
                </div>
            );
        }

        const categoryServices = groupedServices[categoryKey];
        if (!categoryServices || categoryServices.length === 0) return null;

        return (
            <div key={categoryKey} style={{ marginBottom: '4rem' }}>
                {title && (
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '800' }}>
                        {title}
                    </h3>
                )}
                <div className="services-grid">
                    {categoryServices.map((service) => {
                        const Icon = getIconComponent(service.icon);
                        return (
                            <div 
                                key={service.id} 
                                className="service-card" 
                                onClick={() => setViewService(service)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="service-image-wrapper">
                                    {service.image ? (
                                        <img
                                            src={getImageUrl(service.image)}
                                            alt={service.title}
                                            className="service-image"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="service-icon-wrapper">
                                            <div className="service-icon">
                                                <Icon />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="service-content">
                                    <h3 className="service-title">{service.title}</h3>
                                    <p className="service-description">
                                        {service.description}
                                    </p>
                                    
                                    <div className="service-card-footer">
                                        {service.price && (
                                            <div style={{
                                                color: 'var(--accent-color)',
                                                fontWeight: '700',
                                                fontSize: '1rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                {/^\d+$/.test(service.price) ? `₹${service.price}` : service.price}
                                            </div>
                                        )}

                                        <button
                                            className="service-connect-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedService(service);
                                            }}
                                            style={{
                                                padding: '0.65rem 1rem',
                                                backgroundColor: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Let's Connect
                                        </button>

                                        <button
                                            className="service-samples-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/portfolio', { state: { filterCategory: service.category } });
                                            }}
                                            style={{
                                                padding: '0.65rem 1rem',
                                                backgroundColor: 'transparent',
                                                color: 'var(--accent-color)',
                                                border: '1.5px solid var(--accent-color)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            <Images size={16} />
                                            View Samples
                                        </button>
                                    </div>
                                </div>
                                <div className="service-overlay"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            <section className="services-section page-padding">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Our Services</h2>
                        <p className="section-description">
                            Transform your fabric into stunning outfit concepts and create professional product catalogs for any
                            occasion
                        </p>
                    </div>

                    {loading && services.length === 0 ? (
                        <>
                            <div style={{ marginBottom: '4rem' }}>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>Customization Services</h3>
                                <div className="services-grid">
                                    {[1, 2, 3].map(i => <ServiceSkeleton key={i} />)}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {services.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    <p>No services available at the moment. Please check back later.</p>
                                </div>
                            ) : (
                                <>
                                    {renderServiceSection('Customization Services', 'customization')}
                                    {renderServiceSection('Catalog & Other Services', 'catalog')}
                                    {renderServiceSection('General Services', 'general')}
                                    {Object.keys(groupedServices)
                                        .filter(key => !['customization', 'catalog', 'general'].includes(key))
                                        .map(key => renderServiceSection(key.charAt(0).toUpperCase() + key.slice(1), key))
                                    }
                                </>
                            )}
                        </>
                    )}

                    <div className="benefits-section">
                        <h3 className="benefits-title">What You Get</h3>
                        <div className="benefits-grid">
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Palette />
                                </div>
                                <p>Outfit design concepts made from your fabric</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Eye />
                                </div>
                                <p>Clear visual reference before stitching</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Scissors />
                                </div>
                                <p>Perfect explanation tool for your tailor</p>
                            </div>
                            <div className="benefit-item">
                                <div className="benefit-icon">
                                    <Clock />
                                </div>
                                <p>Saves time, fabric, and rework</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* View Details Modal - Catalog Style */}
            {viewService && (
                <div className="purchase-modal" style={{ display: 'flex' }} onClick={() => setViewService(null)}>
                    <div className="purchase-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setViewService(null)}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                {viewService.image ? (
                                    <img
                                        src={getImageUrl(viewService.image)}
                                        alt={viewService.title}
                                        style={{ width: '100%', height: 'auto', maxHeight: '40vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        onError={(e) => e.target.src = 'https://placehold.co/600x400?text=No+Image'}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary-color)', borderRadius: '8px', color: 'white' }}>
                                        {(() => {
                                            const Icon = getIconComponent(viewService.icon);
                                            return <Icon size={64} />;
                                        })()}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--primary-color)', fontWeight: '700' }}>{viewService.title}</h3>
                                <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem', textTransform: 'capitalize' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle size={16} color="var(--accent-color)" /> {viewService.category} Service</span>
                                </div>
                                <p style={{ lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                                    {viewService.description}
                                </p>

                                {viewService.features && viewService.features.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Key Features:</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            {viewService.features.map((feature, idx) => (
                                                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                    <CheckCircle size={14} color="var(--accent-color)" /> {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #ebebeb' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        {viewService.price ? (
                                            /^\d+$/.test(viewService.price) ? `₹${viewService.price}` : viewService.price
                                        ) : 'Custom Quote'}
                                    </div>
                                    <button
                                        className="btn-buy"
                                        style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                                        onClick={() => {
                                            setSelectedService(viewService);
                                            setViewService(null);
                                        }}
                                    >
                                        Let's Connect
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Service Inquiry Modal - Direct WhatsApp */}
            {selectedService && (
                <div className="purchase-modal" style={{ display: 'flex' }} onClick={() => setSelectedService(null)}>
                    <div className="purchase-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedService(null)}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <h3 className="purchase-title">Service Inquiry</h3>
                            <p className="modal-subtitle">Connect with us specifically for this service.</p>
                        </div>

                        <div className="inquiry-item-preview">
                            {selectedService.image ? (
                                <div className="inquiry-item-image-wrapper" style={{ width: '60px', height: '60px' }}>
                                    <img
                                        src={getImageUrl(selectedService.image)}
                                        alt={selectedService.title}
                                        className="inquiry-item-image"
                                    />
                                </div>
                            ) : (
                                <div className="inquiry-item-image-wrapper" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-color)', color: 'white' }}>
                                    {(() => {
                                        const Icon = getIconComponent(selectedService.icon);
                                        return <Icon size={32} />;
                                    })()}
                                </div>
                            )}
                            <div className="inquiry-item-details">
                                <h4>{selectedService.title}</h4>
                                <div className="inquiry-item-price" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                    {selectedService.category} Service
                                </div>
                            </div>
                        </div>

                        {submitSuccess ? (
                            <div className="success-state">
                                <div className="success-icon">
                                    <MessageCircle size={32} />
                                </div>
                                <h3>WhatsApp Link Ready!</h3>
                                <p>You will be redirected to WhatsApp to send your inquiry.</p>
                                <button className="btn-close-success" onClick={() => setSelectedService(null)}>
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleConnect} className="inquiry-form">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="form-input"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        required
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter your WhatsApp number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea
                                        name="message"
                                        rows="3"
                                        className="form-textarea"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder={`I'm interested in the ${selectedService.title} service...`}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="btn btn-primary btn-submit"
                                >
                                    {submitting ? 'Sending...' : "Let's Connect"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ServicesPage;
