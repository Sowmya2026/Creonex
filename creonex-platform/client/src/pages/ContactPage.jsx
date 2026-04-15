import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Mail, Loader } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import '../styles/contact.css';

const ContactPage = () => {
    const location = useLocation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        message: '',
        subject: ''
    });

    useEffect(() => {
        if (location.state?.serviceTitle) {
            setFormData(prev => ({
                ...prev,
                subject: `Inquiry about: ${location.state.serviceTitle}`,
                message: `Hi, I'm interested in the "${location.state.serviceTitle}" service. Please provide more details.`
            }));
        }
    }, [location.state]);

    const [status, setStatus] = useState('idle');
    const { showSuccess, showError } = useToast();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        try {
            const waNumber = '918555074387'; // Indian format
            const text = `*New Contact Inquiry*\n\n*Name:* ${formData.name}\n*Email:* ${formData.email || 'N/A'}\n*WhatsApp:* ${formData.phone}\n*Company:* ${formData.company || 'N/A'}\n*Subject:* ${formData.subject}\n\n*Message:*\n${formData.message}`;
            
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, '_blank');
            
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', company: '', message: '', subject: '' });
            showSuccess('Redirecting to WhatsApp...');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
            showError('Failed to prepare WhatsApp message. Please try again.');
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <section className="contact-section page-padding">
            <div className="container">
                <div className="contact-content">
                    <div className="contact-header">
                        <h2 className="section-title">Let's Create Something Amazing</h2>
                        <p className="section-description">
                            Ready to transform your fabric into stunning outfit concepts? Let's discuss your vision.
                        </p>
                    </div>

                    <div className="contact-grid">
                        <div className="contact-form-container">
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email (Optional)</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">WhatsApp Number *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Enter your WhatsApp number"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company / Brand Name</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Your Brand Name (Optional)"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Subject</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="How can we help?"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        placeholder="Tell us about your project..."
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="submit-btn" disabled={status === 'submitting'}>
                                    {status === 'submitting' ? <Loader className="spin" size={20} /> : "Let's Connect"}
                                </button>
                            </form>
                        </div>

                        <div className="contact-cards-grid">
                            {/* Email Card */}
                            <div className="contact-card">
                                <div className="contact-card-inner">
                                    <div className="contact-icon">
                                        <Mail />
                                    </div>
                                    <h3>Email Us</h3>
                                    <p>Send us an email for inquiries and collaborations</p>
                                    <a
                                        href="mailto:creonex.viz@gmail.com"
                                        className="contact-btn email-btn"
                                    >
                                        <Mail size={20} />
                                        creonex.viz@gmail.com
                                    </a>
                                </div>
                            </div>

                            {/* Instagram Card */}
                            <div className="contact-card">
                                <div className="contact-card-inner">
                                    <div className="contact-icon instagram-icon">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                    <h3>Instagram DM</h3>
                                    <p>Connect with us on Instagram for quick responses</p>
                                    <a
                                        href="https://instagram.com/creonex.viz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-btn instagram-btn"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                            <path
                                                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                        @creonex.viz
                                    </a>
                                </div>
                            </div>


                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactPage;
