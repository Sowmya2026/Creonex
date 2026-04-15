import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import api from '../services/api';
import '../styles/catalog.css';
import { FileText, ShoppingBag, X, MessageCircle, Mail } from 'lucide-react';

const getImageUrl = (url) => {
    if (!url) return '';
    // Handle full URLs
    if (url.startsWith('http') || url.startsWith('data:')) {
        // Fix double URL issue if present
        const match = url.match(/(\/uploads\/.*)/);
        if (match) {
            url = match[1];
        } else {
            return url;
        }
    }
    
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${serverUrl}${cleanUrl}`;
};

const CatalogPage = () => {
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewItem, setViewItem] = useState(null);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const res = await api.get('/catalogs');
                setCatalogs(res.data.data || []);
            } catch (error) {
                console.error('Failed to fetch catalogs', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCatalogs();
        window.scrollTo(0, 0); // Scroll to top on mount
    }, []);

    const handleBuyClick = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const waNumber = '918555074387'; // Indian format
            const text = `*New Catalog Inquiry*\n\n*Catalog:* ${selectedItem.title}\n*Name:* ${formData.name}\n*Email:* ${formData.email || 'N/A'}\n*WhatsApp:* ${formData.phone}\n\n*Message:*\n${formData.message || 'I am interested in purchasing this catalog.'}`;
            
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                handleCloseModal();
                setFormData({ name: '', email: '', phone: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error('Failed to prepare WhatsApp message', error);
            alert('Failed to prepare WhatsApp message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="catalog-section page-padding">
            <div className="container">
                <ScrollReveal animation="fade-up">
                    <div className="section-header">
                        <h2 className="section-title">Design Catalogs</h2>
                        <p className="section-description">
                            Explore our exclusive collection of ready-to-use fashion design catalogs (PDFs).
                        </p>
                    </div>
                </ScrollReveal>

                {loading ? (
                    <div className="loading-container" style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="spinner"></div>
                        <p>Loading designs...</p>
                    </div>
                ) : catalogs.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>Coming Soon</h3>
                        <p>We are currently curating our exclusive design catalogs.</p>
                    </div>
                ) : (
                    <div className="catalog-grid">
                        {catalogs.map((item, index) => (
                            <ScrollReveal key={item.id} animation="fade-up" delay={index * 100}>
                                <div 
                                    className="catalog-card" 
                                    onClick={() => setViewItem(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="catalog-cover-wrapper">
                                        <img
                                            src={getImageUrl(item.coverImageUrl)}
                                            alt={item.title}
                                            className="catalog-cover"
                                            onError={(e) => e.target.src = 'https://placehold.co/600x800?text=Catalog+Cover'}
                                        />
                                    </div>
                                    <div className="catalog-content">
                                        <div className="catalog-header">
                                            <h3 className="catalog-title">{item.title}</h3>
                                        </div>
                                        <div className="catalog-meta">
                                            <div className="catalog-meta-item">
                                                <FileText size={14} />
                                                <span>{item.pageCount} Pages</span>
                                            </div>
                                            <div className="catalog-meta-item">
                                                <span>•</span>
                                                <span>PDF Format</span>
                                            </div>
                                        </div>
                                        <p className="catalog-description">
                                            {item.description}
                                        </p>
                                        <div className="catalog-footer">
                                            <div className="catalog-price">
                                                <span className="catalog-currency">$</span>
                                                {item.price}
                                            </div>
                                            <button
                                                className="btn-buy"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBuyClick(item);
                                                }}
                                            >
                                                <ShoppingBag size={18} />
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </div>

            {/* Purchase Modal */}
            {selectedItem && (
                <div className="purchase-modal" onClick={handleCloseModal}>
                    <div className="purchase-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={handleCloseModal}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <h3 className="purchase-title">Purchase Inquiry</h3>
                            <p className="modal-subtitle">Complete the form below to connect with us.</p>
                        </div>

                        <div className="inquiry-item-preview">
                            <div className="inquiry-item-image-wrapper">
                                <img
                                    src={getImageUrl(selectedItem.coverImageUrl)}
                                    alt={selectedItem.title}
                                    className="inquiry-item-image"
                                    onError={(e) => e.target.src = 'https://placehold.co/600x800?text=Catalog+Cover'}
                                />
                            </div>
                            <div className="inquiry-item-details">
                                <h4>{selectedItem.title}</h4>
                                <div className="inquiry-item-price">
                                    <span className="currency-symbol">$</span>{selectedItem.price}
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
                                <button className="btn-close-success" onClick={handleCloseModal}>
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
                                    <label>Email (Optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email address"
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
                                        placeholder="I'm interested in purchasing this catalog..."
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

            {/* View Details Modal */}
            {viewItem && (
                <div className="purchase-modal" onClick={() => setViewItem(null)}>
                    <div className="purchase-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setViewItem(null)}>
                            <X size={24} />
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ backgroundColor: '#f5f5f5', borderRadius: '12px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={getImageUrl(viewItem.coverImageUrl)}
                                    alt={viewItem.title}
                                    style={{ width: '100%', height: 'auto', maxHeight: '50vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    onError={(e) => e.target.src = 'https://placehold.co/600x800?text=Catalog+Cover'}
                                />
                            </div>
                            
                            <div>
                                <h3 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--primary-color)', fontWeight: '700' }}>{viewItem.title}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><FileText size={16} /> {viewItem.pageCount} Pages</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>• PDF Format</span>
                                </div>
                                <p style={{ lineHeight: '1.7', color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                                    {viewItem.description}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #ebebeb' }}>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                        <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>$</span>{viewItem.price}
                                    </div>
                                    <button
                                        className="btn-buy"
                                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                                        onClick={() => {
                                            setSelectedItem(viewItem);
                                            setViewItem(null);
                                        }}
                                    >
                                        <ShoppingBag size={20} />
                                        Buy Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
