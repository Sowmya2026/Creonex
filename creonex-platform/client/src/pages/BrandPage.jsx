import { useState } from 'react';
import { Briefcase, Calendar } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import BookingModal from '../components/BookingModal';
import '../styles/client.css';

const BrandPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingType, setBookingType] = useState('consultation');

    const openBooking = (type) => {
        setBookingType(type);
        setIsModalOpen(true);
    };

    return (
        <>
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialType={bookingType}
            />

            <section id="brands" className="brand-services">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2 className="section-title">Brand Services</h2>
                            <p className="section-description">
                                Exclusive outfit design concepts tailored to your brand identity
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="brand-content">
                        <ScrollReveal animation="fade-up" delay={200}>
                            <div className="brand-card">
                                <div className="brand-card-header">
                                    <div className="brand-icon">
                                        <Briefcase size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3>Brand Outfit Design & Visualisation</h3>
                                </div>
                                <div className="brand-card-body">
                                    <div className="ideal-for">
                                        <h4>Ideal For:</h4>
                                        <div className="brand-tags">
                                            <span className="brand-tag">Boutique Owners</span>
                                            <span className="brand-tag">Manufacturers</span>
                                            <span className="brand-tag">Sellers needing Visuals</span>
                                        </div>
                                    </div>
                                    <div className="what-we-do">
                                        <h4>What We Do:</h4>
                                        <ul className="brand-features">
                                            <li>We create unique designs based on your requirements</li>
                                            <li>Design visuals for your selling purpose</li>
                                            <li>Show multiple styling possibilities</li>
                                        </ul>
                                    </div>

                                    <div className="action-area" style={{ marginTop: '2rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => openBooking('consultation')}
                                            className="btn btn-primary btn-lg shine-effect"
                                        >
                                            <Calendar size={20} className="btn-icon" />
                                            Book a Consultation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
        </>
    );
};

export default BrandPage;
