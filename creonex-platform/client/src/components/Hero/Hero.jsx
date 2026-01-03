import { Sparkles, Shirt, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section id="home" className="hero">
            <div className="hero-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        From <span className="gradient-text">Fabric</span> to <span className="gradient-text">Visual Design</span>
                    </h1>

                    <p className="hero-description">
                        I create outfit visual design concepts from saree and fabric materials, showing how a single saree
                        or fabric can be transformed into modern, Indo-western, and contemporary outfits.
                    </p>

                    <div className="hero-features">
                        <div className="feature-pill">
                            <Sparkles className="feature-icon" size={20} strokeWidth={2.5} />
                            <span>AI-Powered Visualization</span>
                        </div>
                        <div className="feature-pill">
                            <Shirt className="feature-icon" size={20} strokeWidth={2.5} />
                            <span>No Guesswork</span>
                        </div>
                        <div className="feature-pill">
                            <Palette className="feature-icon" size={20} strokeWidth={2.5} />
                            <span>Perfect Reference for Tailors</span>
                        </div>
                    </div>

                    <div className="hero-cta">
                        <Link to="/services" className="btn btn-primary">
                            Explore Services
                        </Link>
                        <Link to="/contact" className="btn btn-secondary">
                            Get in Touch
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
