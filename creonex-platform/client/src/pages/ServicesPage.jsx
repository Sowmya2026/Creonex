import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Palette, Eye, Scissors, Clock, Package,
    Cake, Gem, PartyPopper, BookOpen, Crown,
    Shirt, Star, Award, Zap, Images
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

const ServicesPage = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if we have cached services in sessionStorage to show immediately
        const cachedServices = sessionStorage.getItem('creonex_services');
        if (cachedServices) {
            try {
                const parsed = JSON.parse(cachedServices);
                setServices(parsed);
                setLoading(false); // If we have cache, don't show loading
                // Still fetch to update in background
                fetchServices(true);
                return;
            } catch (e) {
                console.error("Cache parse error", e);
            }
        }

        fetchServices();
    }, []);

    const fetchServices = async (isBackgroundUpdate = false) => {
        try {
            if (!isBackgroundUpdate) setLoading(true);
            const response = await api.get('/services');
            const data = response.data.data || [];

            // Only update state if data changed to avoid re-renders
            setServices(prev => {
                const isDiff = JSON.stringify(prev) !== JSON.stringify(data);
                if (isDiff) {
                    sessionStorage.setItem('creonex_services', JSON.stringify(data));
                    return data;
                }
                return prev;
            });
        } catch (error) {
            console.error('Failed to fetch services:', error);
        } finally {
            if (!isBackgroundUpdate) setLoading(false);
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
        // If loading, show skeletons
        if (loading) {
            // Only show skeletons for the first likely category if simplified, 
            // but here let's show a grid of skeletons
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
            <div style={{ marginBottom: '4rem' }}>
                {title && (
                    <h3 style={{ fontSize: '1.75rem', marginBottom: '2rem', textAlign: 'center' }}>
                        {title}
                    </h3>
                )}
                <div className="services-grid">
                    {categoryServices.map((service) => {
                        const Icon = getIconComponent(service.icon);
                        return (
                            <div key={service.id} className="service-card">
                                <div className="service-icon">
                                    <Icon />
                                </div>
                                <h3 className="service-title">{service.title}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                    {service.description}
                                </p>
                                {service.features && service.features.length > 0 && (
                                    <ul className="service-features">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx}>{feature}</li>
                                        ))}
                                    </ul>
                                )}
                                {service.price && (
                                    <p style={{
                                        color: 'var(--accent-color)',
                                        fontWeight: '600',
                                        marginTop: '1rem'
                                    }}>
                                        {/^\d+$/.test(service.price) ? `Starting from ₹${service.price}` : service.price}
                                    </p>
                                )}

                                <button
                                    className="service-connect-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/contact', { state: { serviceTitle: service.title } });
                                    }}
                                    style={{
                                        marginTop: '1.5rem',
                                        padding: '0.75rem 1.5rem',
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
                                        transition: 'background-color 0.2s'
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
                                        marginTop: '0.75rem',
                                        padding: '0.65rem 1.25rem',
                                        backgroundColor: 'transparent',
                                        color: 'var(--accent-color)',
                                        border: '2px solid var(--accent-color)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = 'var(--accent-color)';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = 'var(--accent-color)';
                                    }}
                                >
                                    <Images size={18} />
                                    View Samples
                                </button>

                                <div
                                    className="service-overlay"
                                    onClick={() => navigate('/contact', { state: { serviceTitle: service.title } })}
                                    style={{ cursor: 'pointer' }}
                                ></div>
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
                        <h2 className="section-title">Custom Outfit Visualisation & Other Services</h2>
                        <p className="section-description">
                            Transform your fabric into stunning outfit concepts and create professional product catalogs for any
                            occasion
                        </p>
                    </div>

                    {loading && services.length === 0 ? (
                        <>
                            {/* Show skeleton sections mimicking expected layout */}
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
                                    {renderServiceSection('Other Services We Provide', 'catalog')}
                                    {renderServiceSection('General Services', 'general')}
                                    {Object.keys(groupedServices)
                                        .filter(key => !['customization', 'catalog', 'general'].includes(key))
                                        .map(key => renderServiceSection(key.charAt(0).toUpperCase() + key.slice(1), key))
                                    }
                                </>
                            )}
                        </>
                    )}

                    {/* What You Get - Static Benefits Section */}
                    {/* Only show this if not loading OR if we want it to be always visible (better always visible) */}
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
        </>
    );
};

export default ServicesPage;
