import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, Images } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import BookingModal from '../components/BookingModal';
import '../styles/client.css';

const ClientPage = () => {
    const navigate = useNavigate();
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

            <section id="collabs" className="brand-services">
                <div className="container">
                    <ScrollReveal animation="fade-up">
                        <div className="section-header">
                            <h2 className="section-title">Paid Collaboration Model</h2>
                            <p className="section-description">
                                Partner with fabric sellers, saree brands, and jewellery brands
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="brand-content">
                        {/* Collaboration Model */}
                        <ScrollReveal animation="fade-up" delay={200}>
                            <div className="collaboration-section">
                                <div className="collab-header">
                                    <div className="collab-icon">
                                        <Handshake size={32} strokeWidth={1.5} />
                                    </div>
                                    <h3>Collaboration Details</h3>
                                </div>

                                <div className="collab-grid">
                                    <ScrollReveal animation="slide-left" delay={400} className="h-100">
                                        <div className="collab-card">
                                            <h4>How It Works</h4>
                                            <ul className="collab-list">
                                                <li>I design outfit visuals using your products</li>
                                                <li>Visuals featured in my reels and posts</li>
                                                <li>You can repost on your brand page</li>
                                                <li>Direct customer redirects to your page</li>
                                            </ul>
                                        </div>
                                    </ScrollReveal>

                                    <ScrollReveal animation="slide-right" delay={400} className="h-100">
                                        <div className="collab-card">
                                            <h4>Why This Works</h4>
                                            <ul className="collab-list">
                                                <li>Shows product beyond traditional styling</li>
                                                <li>Helps customers visualise modern uses</li>
                                                <li>Increases engagement and clarity</li>
                                                <li>Builds trust before purchase</li>
                                            </ul>
                                        </div>
                                    </ScrollReveal>
                                </div>

                                <div className="collab-action">
                                    <button
                                        onClick={() => openBooking('collaboration')}
                                        className="btn btn-outline btn-lg"
                                    >
                                        Start Collaborating
                                    </button>
                                    <button
                                        onClick={() => navigate('/portfolio', { state: { filterCategory: 'collab' } })}
                                        className="btn btn-outline btn-lg"
                                    >
                                        <Images size={20} style={{ marginRight: '0.5rem' }} />
                                        View Collabs
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </div >
            </section >
        </>
    );
};

export default ClientPage;
