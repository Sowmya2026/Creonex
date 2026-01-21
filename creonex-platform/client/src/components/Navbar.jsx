import { useState, useEffect } from 'react';
import { Sun, Moon, X, Home, BookOpen, Briefcase, Users, Building2, FolderOpen, BookMarked, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import logoLight from '../assets/images/logo-light.svg';
import logoDark from '../assets/images/logo-dark.svg';


const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Helper to check if link is active
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    useEffect(() => {
        // Scroll listener
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Check initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileMenuOpen]);

    const toggleTheme = () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} id="navbar">
                <div className="container">
                    <div className="nav-content">
                        <Link to="/" className="logo" onClick={closeMobileMenu}>
                            <img src={logoLight} alt="Creonex.viz Logo" className="logo-img logo-light" />
                            <img src={logoDark} alt="Creonex.viz Logo" className="logo-img logo-dark" />
                        </Link>

                        <div className="nav-right">
                            {/* Desktop Navigation */}
                            <ul className="nav-links desktop-only">
                                <li><Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link></li>
                                <li><Link to="/our-story" className={`nav-link ${isActive('/our-story')}`}>Our Story</Link></li>
                                <li><Link to="/services" className={`nav-link ${isActive('/services')}`}>Services</Link></li>
                                <li><Link to="/clients" className={`nav-link ${isActive('/clients')}`}>For Collabs</Link></li>
                                <li><Link to="/brands" className={`nav-link ${isActive('/brands')}`}>For Brands</Link></li>

                                <li><Link to="/portfolio" className={`nav-link ${isActive('/portfolio')}`}>Portfolio</Link></li>
                                <li><Link to="/catalogs" className={`nav-link ${isActive('/catalogs')}`}>Catalogs</Link></li>
                                <li><Link to="/contact" className={`nav-link cta-link ${isActive('/contact')}`}>Let's Contact</Link></li>
                            </ul>

                            {/* Theme Toggle Button */}
                            <button className="theme-toggle desktop-only" id="themeToggle" aria-label="Toggle theme" onClick={toggleTheme}>
                                <Sun className="theme-icon sun-icon" />
                                <Moon className="theme-icon moon-icon" />
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
                                id="mobileMenuBtn"
                                aria-label="Toggle menu"
                                onClick={toggleMobileMenu}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-menu-backdrop"
                    onClick={closeMobileMenu}
                    aria-hidden="true"
                />
            )}

            {/* Mobile Menu Modal */}
            <div className={`mobile-menu-modal ${isMobileMenuOpen ? 'active' : ''}`}>
                <div className="mobile-menu-header">
                    <Link to="/" className="mobile-menu-logo" onClick={closeMobileMenu}>
                        <img src={logoLight} alt="Creonex.viz Logo" className="logo-img logo-light" />
                        <img src={logoDark} alt="Creonex.viz Logo" className="logo-img logo-dark" />
                    </Link>
                    <button
                        className="mobile-menu-close"
                        onClick={closeMobileMenu}
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav className="mobile-menu-content">
                    <ul className="mobile-nav-links">
                        <li>
                            <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={closeMobileMenu}>
                                <Home className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/our-story" className={`mobile-nav-link ${isActive('/our-story')}`} onClick={closeMobileMenu}>
                                <BookOpen className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Our Story</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/services" className={`mobile-nav-link ${isActive('/services')}`} onClick={closeMobileMenu}>
                                <Briefcase className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Services</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/portfolio" className={`mobile-nav-link ${isActive('/portfolio')}`} onClick={closeMobileMenu}>
                                <FolderOpen className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Portfolio</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/catalogs" className={`mobile-nav-link ${isActive('/catalogs')}`} onClick={closeMobileMenu}>
                                <BookMarked className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Catalogs</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/brands" className={`mobile-nav-link ${isActive('/brands')}`} onClick={closeMobileMenu}>
                                <Building2 className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">For Brands</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/clients" className={`mobile-nav-link ${isActive('/clients')}`} onClick={closeMobileMenu}>
                                <Users className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">For Collabs</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className={`mobile-nav-link mobile-nav-cta ${isActive('/contact')}`} onClick={closeMobileMenu}>
                                <Mail className="mobile-nav-icon" size={16} />
                                <span className="mobile-nav-text">Let's Contact</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div className="mobile-menu-footer">
                    {/* Theme Toggle in Mobile Menu */}
                    <button className="mobile-theme-toggle" aria-label="Toggle theme" onClick={toggleTheme}>
                        <Sun className="theme-icon sun-icon" />
                        <Moon className="theme-icon moon-icon" />
                        <span className="theme-toggle-text">Toggle Theme</span>
                    </button>
                    <p className="mobile-menu-tagline">From Fabric to Visual Design</p>
                </div>
            </div>
        </>
    );
};

export default Navbar;
