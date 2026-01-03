import { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react';
import './Lightbox.css';

const Lightbox = ({ images = [], initialIndex = 0, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const currentImage = images[currentIndex];

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    useEffect(() => {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Handle keyboard navigation
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') handlePrevious();
            if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [currentIndex, onClose]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsZoomed(false);
    };

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsZoomed(false);
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = currentImage.src;
        link.download = currentImage.title || 'image';
        link.click();
    };

    // Touch handlers for swipe gestures
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrevious();
        }
    };

    return (
        <div className="lightbox-overlay" onClick={onClose}>
            <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="lightbox-header">
                    <div className="lightbox-info">
                        <h3 className="lightbox-title">{currentImage.title}</h3>
                        <p className="lightbox-counter">
                            {currentIndex + 1} / {images.length}
                        </p>
                    </div>
                    <div className="lightbox-actions">
                        <button
                            className="lightbox-btn"
                            onClick={toggleZoom}
                            aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
                        >
                            {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                        </button>
                        <button
                            className="lightbox-btn"
                            onClick={handleDownload}
                            aria-label="Download image"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            className="lightbox-btn lightbox-close"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Image Container */}
                <div
                    className="lightbox-image-wrapper"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <img
                        src={currentImage.src}
                        alt={currentImage.title}
                        className={`lightbox-image ${isZoomed ? 'zoomed' : ''}`}
                        onClick={toggleZoom}
                    />
                </div>

                {/* Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            className="lightbox-nav lightbox-nav-prev"
                            onClick={handlePrevious}
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            className="lightbox-nav lightbox-nav-next"
                            onClick={handleNext}
                            aria-label="Next image"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </>
                )}

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="lightbox-thumbnails">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                className={`lightbox-thumbnail ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsZoomed(false);
                                }}
                            >
                                <img src={image.src} alt={image.title} />
                            </button>
                        ))}
                    </div>
                )}

                {/* Swipe Indicator for Mobile */}
                <div className="lightbox-swipe-hint">
                    Swipe left or right to navigate
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
