import { useState, useEffect } from 'react';
import ScrollReveal from '../components/ScrollReveal';
import api from '../services/api';
import '../styles/catalog.css';
import { FileText, ShoppingBag, X, MessageCircle, Mail } from 'lucide-react';

const CatalogPage = () => {
    const [catalogs, setCatalogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

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
            await api.post('/catalog-inquiries', {
                ...formData,
                catalogId: selectedItem.id,
                catalogTitle: selectedItem.title
            });
            setSubmitSuccess(true);
            setTimeout(() => {
                setSubmitSuccess(false);
                handleCloseModal();
                setFormData({ name: '', email: '', phone: '', message: '' });
            }, 3000);
        } catch (error) {
            console.error('Failed to send inquiry', error);
            alert('Failed to send message. Please try again.');
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
                                <div className="catalog-card">
                                    <div className="catalog-cover-wrapper">
                                        <img
                                            src={api.getUri() + item.coverImageUrl}
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
                                                onClick={() => handleBuyClick(item)}
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
                                    src={api.getUri() + selectedItem.coverImageUrl}
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
                                <h3>Inquiry Sent!</h3>
                                <p>We will contact you shortly with purchase details.</p>
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
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="form-input"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>WhatsApp Number</label>
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
        </div>
    );
};

export default CatalogPage;
