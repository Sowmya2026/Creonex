import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play, Eye, Tag, Calendar } from 'lucide-react';
import { Image as ImageIcon, Sparkles, Heart, Cake, PartyPopper, Building2, Package, Folder } from 'lucide-react';
import './ProjectModal.css';

const getImageUrl = (url) => {
    if (!url) return '';

    // Handle legacy localhost URLs stored in database
    if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
        const match = url.match(/(\/uploads\/.*)/);
        if (match) {
            url = match[1];
        }
    }

    if (url.startsWith('http') || url.startsWith('data:')) return url;

    // Prepend API URL (stripping /api if present)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const serverUrl = apiBase.replace(/\/api\/?$/, '');

    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${serverUrl}${cleanUrl}`;
};

const ProjectModal = ({ item, onClose }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!item) return null;

    // Use images array if available, otherwise fallback to item.imageUrl
    const images = item.images && item.images.length > 0 ? item.images : (item.imageUrl ? [item.imageUrl] : []);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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

    // Helper to get embed URL for Instagram, Drive, or YouTube
    const getEmbedUrl = (url) => {
        if (!url) return '';

        // Instagram
        if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
            const cleanUrl = url.split('?')[0];
            const resultUrl = cleanUrl.endsWith('/') ? cleanUrl : `${cleanUrl}/`;
            return `${resultUrl}embed`;
        }

        // Google Drive
        if (url.includes('drive.google.com')) {
            // Extract the ID from various Drive URL formats
            const idMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
                return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
            }
        }

        // YouTube
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const videoId = url.includes('v=')
                ? url.split('v=')[1].split('&')[0]
                : url.split('/').pop().split('?')[0];
            // Autoplay and mute usually required for autoplay to work on many browsers
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
        }

        return url;
    };

    return (
        <div className="project-modal-overlay" onClick={onClose}>
            <div className="project-modal-container" onClick={e => e.stopPropagation()}>
                <button className="project-modal-close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="project-modal-content">
                    {/* Media Section (Left/Top) */}
                    <div className="project-media-section">
                        {item.reelLink ? (
                            <div className="project-video-wrapper">
                                <iframe
                                    className="instagram-embed"
                                    src={getEmbedUrl(item.reelLink)}
                                    title={item.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    style={{ border: 0 }}
                                ></iframe>
                            </div>
                        ) : (
                            <div className="project-image-slider">
                                {images.length > 0 ? (
                                    <>
                                        <div className="project-slide-container">
                                            <img
                                                src={getImageUrl(images[currentImageIndex])}
                                                alt={`${item.title} - view ${currentImageIndex + 1}`}
                                                className="project-slide-image"
                                            />
                                        </div>

                                        {images.length > 1 && (
                                            <>
                                                <button className="slider-nav prev" onClick={prevImage}>
                                                    <ChevronLeft size={24} />
                                                </button>
                                                <button className="slider-nav next" onClick={nextImage}>
                                                    <ChevronRight size={24} />
                                                </button>
                                                <div className="slider-dots">
                                                    {images.map((_, idx) => (
                                                        <span
                                                            key={idx}
                                                            className={`slider-dot ${idx === currentImageIndex ? 'active' : ''}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCurrentImageIndex(idx);
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-media-placeholder">
                                        <ImageIcon size={48} />
                                        <p>No images available</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details Section (Right/Bottom) */}
                    <div className="project-details-section">
                        <div className="project-header">
                            <div className="project-category-badge">
                                {getCategoryIcon(item.category)}
                                <span>{getCategoryLabel(item.category)}</span>
                            </div>
                            {item.isFeatured && (
                                <div className="project-featured-badge">Featured</div>
                            )}
                        </div>

                        <h2 className="project-title">{item.title}</h2>

                        {item.viewsCount > 0 && item.reelLink && (
                            <div className="project-stats">
                                <Eye size={16} />
                                <span>{item.viewsCount.toLocaleString()} views</span>
                            </div>
                        )}

                        <div className="project-description">
                            <p>{item.description || "No description provided."}</p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className="project-tags">
                                <div className="tags-label"><Tag size={14} /> Tags:</div>
                                <div className="tags-list">
                                    {item.tags.map((tag, idx) => (
                                        <span key={idx} className="project-tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {item.reelLink && (
                            <a
                                href={item.reelLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="project-external-link-btn"
                            >
                                <Play size={16} />
                                {item.reelLink.includes('instagram.com') ? 'Watch on Instagram' : 'Watch Video'}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
