import { XCircle, CheckCircle, MessageCircle } from 'lucide-react';

const HowItWorks = () => {
    return (
        <section className="how-it-works page-padding" id="how-it-works">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">How We Work</h2>
                </div>

                <div className="work-process">
                    <div className="process-card">
                        <div className="process-number">01</div>
                        <h3>We Design & Visualise</h3>
                        <p>AI-powered outfit visualization from your fabric</p>
                    </div>
                    <div className="process-arrow">→</div>
                    <div className="process-card">
                        <div className="process-number">02</div>
                        <h3>You Receive Visuals</h3>
                        <p>High-quality design concepts as reference images</p>
                    </div>
                    <div className="process-arrow">→</div>
                    <div className="process-card">
                        <div className="process-number">03</div>
                        <h3>Share with Tailor</h3>
                        <p>Perfect reference for accurate stitching</p>
                    </div>
                </div>

                <div className="important-note">
                    <div className="note-content">
                        <h4>Important to Note</h4>
                        <div className="note-items">
                            <div className="note-item">
                                <XCircle className="note-icon note-icon-no" />
                                <span>No stitching services</span>
                            </div>
                            <div className="note-item">
                                <XCircle className="note-icon note-icon-no" />
                                <span>No garment selling</span>
                            </div>
                            <div className="note-item">
                                <CheckCircle className="note-icon note-icon-yes" />
                                <span>Design & visualization only</span>
                            </div>
                        </div>
                        <p className="note-footer">
                            <MessageCircle className="note-footer-icon" />
                            Charges are based on individual requirements
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
