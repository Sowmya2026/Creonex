import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ExternalLink, Link as LinkIcon, AlertCircle, Star } from 'lucide-react';
import '../styles/LinksPage.css';

const getImageUrl = (url) => {
    if (!url) return '';
    // If it's a data URI or external URL, use as is
    if (url.startsWith('data:') || url.startsWith('http')) return url;

    // Otherwise construct absolute URL from API base
    const baseUrl = api.defaults.baseURL || 'http://localhost:5000/api';
    const serverRoot = baseUrl.replace(/\/api\/?$/, '');
    return `${serverRoot}${url}`;
};

const LinksPage = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                setLoading(true);
                const response = await api.get('/links');
                // Filter only active links
                const activeLinks = (response.data.data || []).filter(item => item.isActive);
                setLinks(activeLinks);
            } catch (err) {
                console.error('Failed to fetch links:', err);
                setError('Unable to load products at the moment.');
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, []);

    if (loading) {
        return (
            <div className="links-page page-padding fade-in">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">Our Recommendations</h1>
                        <p className="section-description">Curated products and tools we love.</p>
                    </div>
                    <div className="links-loading">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="links-page page-padding fade-in">
                <div className="container">
                    <div className="section-header">
                        <h1 className="section-title">Our Recommendations</h1>
                    </div>
                    <div className="links-error">
                        <AlertCircle size={48} />
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="links-page page-padding fade-in">
            <div className="container">
                <div className="section-header">
                    <h1 className="section-title">Curated Picks</h1>
                    <p className="section-description">
                        Explore our favorite products, tools, and accessories.
                        Handpicked just for you.
                    </p>
                </div>

                {links.length === 0 ? (
                    <div className="no-links">
                        <p>No products available right now. Check back soon!</p>
                    </div>
                ) : (
                    <div className="links-grid">
                        {links.map((link) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-card"
                            >
                                <div className="link-image-container">
                                    {link.imageUrl ? (
                                        <img
                                            src={getImageUrl(link.imageUrl)}
                                            alt={link.title}
                                            className="link-image"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                            }}
                                        />
                                    ) : (
                                        <div className="link-image-placeholder">
                                            <LinkIcon size={48} color="var(--text-muted)" />
                                        </div>
                                    )}
                                    {link.rating && Number(link.rating) > 0 && (
                                        <div className="link-rating-badge" title={`${link.rating} out of 5 stars`}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    fill={i < Math.round(Number(link.rating)) ? "white" : "transparent"}
                                                    color="white"
                                                    style={{ opacity: i < Math.round(Number(link.rating)) ? 1 : 0.3 }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <div className="link-overlay">
                                        <span>View Product <ExternalLink size={16} /></span>
                                    </div>
                                </div>
                                <div className="link-details">
                                    <h3 className="link-title">{link.title}</h3>
                                    {link.description && <p className="link-desc">{link.description}</p>}
                                    <div className="link-footer">
                                        {link.price && <span className="link-price">{link.price}</span>}
                                        <span className="link-cta">Buy Now</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksPage;
