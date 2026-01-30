import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Image as ImageIcon,
    Filter,
    X,
    ZoomIn,
    Star,
    Palette,
    Package,
    Sparkles,
    Heart,
    Cake,
    PartyPopper,
    Building2,
    Folder,
    Eye,
    Play
} from 'lucide-react';
import api from '../services/api';
import ProjectModal from '../components/ProjectModal/ProjectModal';
import LoadingSpinner from '../components/LoadingSpinner/LoadingSpinner';
import '../styles/portfolio.css';

const getImageUrl = (url) => {
    if (!url) return '';

    // Handle legacy localhost URLs stored in database
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
        // Extract the path part (e.g., /uploads/...)
        const match = url.match(/(\/uploads\/.*)/);
        if (match) {
            url = match[1]; // Convert to relative path
        }
    }

    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Prepend API URL (stripping /api if present)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    // Ensure url starts with /
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${serverUrl}${cleanUrl}`;
};

const PortfolioPage = () => {
    const location = useLocation();
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageLoadedStates, setImageLoadedStates] = useState({});

    useEffect(() => {
        fetchPortfolio();
    }, []);

    // Handle category filter from navigation (from Services page "View Samples" button)
    useEffect(() => {
        if (location.state?.filterCategory && items.length > 0) {
            const categoryFromState = location.state.filterCategory;
            const categoryExists = items.some(item => item.category === categoryFromState);
            if (categoryExists) {
                setSelectedCategory(categoryFromState);
            }
            window.history.replaceState({}, document.title);
        }
    }, [location.state, items]);

    useEffect(() => {
        if (selectedCategory === 'all') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.category === selectedCategory));
        }
    }, [selectedCategory, items]);

    const fetchPortfolio = async () => {
        try {
            const response = await api.get('/portfolio');
            const portfolioItems = response.data.data || [];

            // Filter only active items for client display
            // Items are active by default (isActive !== false)
            const activeItems = portfolioItems.filter(item => item.isActive !== false);

            // Sort by order and featured status
            const sortedItems = activeItems.sort((a, b) => {
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return (a.order || 0) - (b.order || 0);
            });
            setItems(sortedItems);
            setFilteredItems(sortedItems);

            // Extract unique categories
            const uniqueCategories = [...new Set(sortedItems.map(item => item.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Failed to fetch portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            'catalog': 'Other Services',
            'customization': 'Customization',
            'wedding': 'Wedding',
            'birthday': 'Birthday',
            'events': 'Events',
            'brand': 'Brand Services',
            'collab': 'Collab Services',
            'product_services': 'Product Services'
        };
        return labels[category] || category;
    };

    const getCategoryIcon = (category) => {
        const iconProps = { size: 16 };
        const icons = {
            'catalog': <Package {...iconProps} />,
            'customization': <Sparkles {...iconProps} />,
            'wedding': <Heart {...iconProps} />,
            'birthday': <Cake {...iconProps} />,
            'events': <PartyPopper {...iconProps} />,
            'brand': <Building2 {...iconProps} />,
            'product_services': <ImageIcon {...iconProps} />
        };
        return icons[category] || <Folder {...iconProps} />;
    };

    const handleImageLoad = (itemId) => {
        setImageLoadedStates(prev => ({ ...prev, [itemId]: true }));
    };

    if (loading) {
        return <LoadingSpinner fullScreen message="Loading portfolio..." />;
    }

    const handleCardClick = (item) => {
        setSelectedProject(item);
    };

    return (
        <>
            <section className="portfolio-page page-padding">
                <div className="container">
                    {/* Section Header - consistent with other pages */}
                    <div className="section-header">
                        <h2 className="section-title">Our Portfolio</h2>
                        <p className="section-description">
                            Discover our collection of stunning creations and visualizations
                        </p>
                    </div>

                    {/* Category Filter */}
                    <div className="portfolio-filter-section">
                        <div className="portfolio-filter-header">
                            <Filter size={20} />
                            <span>Filter by Category</span>
                        </div>
                        <div className="portfolio-filter-buttons">
                            <button
                                className={`portfolio-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                <span className="filter-icon"><Palette size={16} /></span>
                                All Work
                                <span className="filter-count">{items.length}</span>
                            </button>
                            {categories.map(category => {
                                const count = items.filter(i => i.category === category).length;
                                return (
                                    <button
                                        key={category}
                                        className={`portfolio-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(category)}
                                    >
                                        <span className="filter-icon">{getCategoryIcon(category)}</span>
                                        {getCategoryLabel(category)}
                                        <span className="filter-count">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedCategory !== 'all' && (
                            <button
                                className="portfolio-clear-filter"
                                onClick={() => setSelectedCategory('all')}
                            >
                                <X size={16} />
                                Clear Filter
                            </button>
                        )}
                    </div>

                    {/* Results Count */}
                    <div className="portfolio-results-info">
                        <span className="results-count">
                            Showing <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'item' : 'items'}
                            {selectedCategory !== 'all' && (
                                <> in <strong>{getCategoryLabel(selectedCategory)}</strong></>
                            )}
                        </span>
                    </div>

                    {/* Portfolio Grid */}
                    {filteredItems.length === 0 ? (
                        <div className="portfolio-empty">
                            <div className="portfolio-empty-icon">
                                <ImageIcon size={64} />
                            </div>
                            <h3>No items found</h3>
                            <p>
                                {selectedCategory === 'all'
                                    ? 'Our portfolio is being updated. Check back soon!'
                                    : `No ${getCategoryLabel(selectedCategory).toLowerCase()} items available yet.`}
                            </p>
                            {selectedCategory !== 'all' && (
                                <button
                                    className="portfolio-view-all-btn"
                                    onClick={() => setSelectedCategory('all')}
                                >
                                    View All Work
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="portfolio-grid">
                            {filteredItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className={`portfolio-card ${!item.imageUrl || imageLoadedStates[item.id] ? 'loaded' : ''}`}
                                    onClick={() => handleCardClick(item)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    {/* Image Container */}
                                    <div className="portfolio-card-image">
                                        {!imageLoadedStates[item.id] && item.imageUrl && (
                                            <div className="portfolio-image-skeleton" />
                                        )}
                                        {item.imageUrl ? (
                                            <img
                                                src={getImageUrl(item.imageUrl)}
                                                alt={item.title}
                                                onLoad={() => handleImageLoad(item.id)}
                                                onError={(e) => {
                                                    console.warn('Image load failed:', getImageUrl(item.imageUrl));
                                                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
                                                    handleImageLoad(item.id);
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '100%',
                                                height: '100%',
                                                minHeight: '260px',
                                                background: '#1a1a1a',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#E1306C'
                                            }}>
                                                <Play size={48} />
                                                <span style={{ marginTop: '0.5rem', fontWeight: '500' }}>Watch Reel</span>
                                            </div>
                                        )}

                                        <div className="portfolio-card-overlay">
                                            <div className="portfolio-zoom-icon">
                                                {item.reelLink ? <Play size={28} fill="currentColor" /> : <ZoomIn size={28} />}
                                            </div>
                                            <span className="portfolio-view-text">
                                                {item.reelLink ? 'Watch Reel' : 'View Details'}
                                            </span>
                                        </div>

                                        {/* Top Badges Container */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '0.75rem',
                                            right: '0.75rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '0.5rem',
                                            zIndex: 2
                                        }}>
                                            {/* Featured Badge */}
                                            {item.isFeatured && (
                                                <div className="portfolio-featured-badge" style={{ position: 'relative', top: 0, right: 0 }}>
                                                    <Star size={14} fill="currentColor" />
                                                    Featured
                                                </div>
                                            )}

                                            {/* Views Count Badge */}
                                            {item.viewsCount > 0 && (
                                                <div style={{
                                                    background: 'rgba(0, 0, 0, 0.7)',
                                                    backdropFilter: 'blur(4px)',
                                                    color: 'white',
                                                    padding: '0.35rem 0.6rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}>
                                                    <Eye size={12} />
                                                    {item.viewsCount}
                                                </div>
                                            )}
                                        </div>

                                        {/* Category Badge */}
                                        <div className="portfolio-category-badge">
                                            {getCategoryIcon(item.category)} {getCategoryLabel(item.category)}
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="portfolio-card-content">
                                        <h3 className="portfolio-card-title">{item.title}</h3>
                                        {item.description && (
                                            <p className="portfolio-card-description">
                                                {item.description.length > 100
                                                    ? item.description.substring(0, 100) + '...'
                                                    : item.description}
                                            </p>
                                        )}
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="portfolio-card-tags">
                                                {item.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="portfolio-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {item.tags.length > 3 && (
                                                    <span className="portfolio-tag-more">
                                                        +{item.tags.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Project Details Modal */}
            {selectedProject && (
                <ProjectModal
                    item={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </>
    );
};

export default PortfolioPage;
