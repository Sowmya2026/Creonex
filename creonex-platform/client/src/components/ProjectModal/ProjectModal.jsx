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
        <div className="purchase-modal" style={{ display: 'flex' }} onClick={onClose}>
            <div className="purchase-modal-content" onClick={e => e.stopPropagation()} style={{ 
                maxWidth: '800px', 
                height: 'auto', 
                maxHeight: '90vh', 
                overflowY: 'auto',
                borderRadius: '24px',
                padding: '0' // Content has its own padding
            }}>
                <button className="modal-close-btn" onClick={onClose} style={{ top: '1.25rem', right: '1.25rem', zIndex: 100 }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
                    {/* Media Section (Top) */}
                    <div style={{ backgroundColor: '#f5f5f5', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'center', width: '100%' }}>
                        {item.reelLink ? (
                            <div className="project-video-wrapper" style={{ width: '100%', aspectRatio: '9/16', maxHeight: '50vh', maxWidth: '350px' }}>
                                <iframe
                                    className="instagram-embed"
                                    src={getEmbedUrl(item.reelLink)}
                                    title={item.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    style={{ border: 0, width: '100%', height: '100%', borderRadius: '12px' }}
                                ></iframe>
                            </div>
                        ) : (
                            <div className="project-image-slider" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {images.length > 0 ? (
                                    <div style={{ position: 'relative', width: '100%' }}>
                                        <div className="project-slide-container" style={{ display: 'flex', justifyContent: 'center' }}>
                                            <img
                                                src={getImageUrl(images[currentImageIndex])}
                                                alt={`${item.title} - view ${currentImageIndex + 1}`}
                                                style={{ width: '100%', height: 'auto', maxHeight: '45vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                        </div>

                                        {images.length > 1 && (
                                            <>
                                                <button className="slider-nav prev" onClick={prevImage} style={{ left: '0.5rem' }}>
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button className="slider-nav next" onClick={nextImage} style={{ right: '0.5rem' }}>
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="no-media-placeholder">
                                        <ImageIcon size={48} />
                                        <p>No images available</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Details Section (Bottom) */}
                    <div className="project-details-section" style={{ padding: '0.5rem', flex: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div className="project-category-badge" style={{ margin: 0 }}>
                                {getCategoryIcon(item.category)}
                                <span>{getCategoryLabel(item.category)}</span>
                            </div>
                            {item.isFeatured && (
                                <div className="project-featured-badge" style={{ margin: 0 }}>Featured</div>
                            )}
                        </div>

                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--primary-color)', fontWeight: '700' }}>{item.title}</h2>

                        {item.viewsCount > 0 && item.reelLink && (
                            <div className="project-stats" style={{ marginBottom: '1rem' }}>
                                <Eye size={16} />
                                <span>{item.viewsCount.toLocaleString()} views</span>
                            </div>
                        )}

                        <div className="project-description" style={{ marginBottom: '1.5rem' }}>
                            <p style={{ lineHeight: '1.7', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{item.description || "No description provided."}</p>
                        </div>

                        {item.tags && item.tags.length > 0 && (
                            <div className="project-tags" style={{ marginBottom: '2rem', padding: '1rem' }}>
                                <div className="tags-label" style={{ marginBottom: '0.5rem' }}><Tag size={14} /> Tags:</div>
                                <div className="tags-list">
                                    {item.tags.map((tag, idx) => (
                                        <span key={idx} className="project-tag" style={{ border: '1px solid #eee' }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Standardized Footer - Same as Services Page */}
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            backgroundColor: '#fcfcfc', 
                            padding: '1.25rem', 
                            borderRadius: '12px', 
                            border: '1px solid #ebebeb',
                            marginTop: 'auto'
                        }}>
                             <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                Portfolio Sample
                            </div>
                            <button
                                className="btn-buy"
                                style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                                onClick={() => {
                                    const phone = '918555074387';
                                    const message = `Hello Creonex! I'm interested in a design similar to "${item.title}" from your portfolio. Can we discuss this?`;
                                    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                            >
                                Let's Connect
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;
