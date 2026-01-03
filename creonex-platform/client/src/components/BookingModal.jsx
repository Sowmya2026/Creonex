import { useState, useEffect } from 'react';
import { X, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import '../styles/modal.css';

export default function BookingModal({ isOpen, onClose, initialType = 'consultation' }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        type: initialType, // 'consultation' or 'collaboration'
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setFormData(prev => ({ ...prev, type: initialType }));
        } else {
            document.body.style.overflow = 'unset';
            // Reset form on close after a delay
            setTimeout(() => {
                setStatus('idle');
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    type: 'consultation',
                    message: ''
                });
            }, 300);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, initialType]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            await api.post('/contact', {
                ...formData,
                subject: `New ${formData.type === 'consultation' ? 'Consultation Request' : 'Collaboration Proposal'}`
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Booking error:', error);
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Failed to submit. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>
                        {formData.type === 'consultation' ? 'Book a Consultation' : 'Start Collaborating'}
                    </h2>
                    <p>
                        {formData.type === 'consultation'
                            ? 'Let\'s discuss how we can bring your brand\'s vision to life.'
                            : 'Partner with us to create stunning visuals for your products.'}
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="modal-success">
                        <CheckCircle size={64} className="success-icon" />
                        <h3>Request Sent!</h3>
                        <p>We'll get back to you shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="booking-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                />
                            </div>
                            <div className="form-group">
                                <label>Company / Brand *</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    disabled={status === 'submitting'}
                                    placeholder="Your WhatsApp Number"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>How can we help? *</label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                disabled={status === 'submitting'}
                                placeholder="Tell us a bit about your requirements..."
                            ></textarea>
                        </div>

                        {status === 'error' && (
                            <div className="form-error">
                                <AlertCircle size={16} />
                                <span>{errorMessage}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={status === 'submitting'}
                        >
                            {status === 'submitting' ? (
                                <><Loader className="spin" size={18} /> Sending...</>
                            ) : (
                                "Let's Connect"
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};


