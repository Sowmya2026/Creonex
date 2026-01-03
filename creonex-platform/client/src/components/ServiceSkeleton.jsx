import '../styles/skeleton.css';

const ServiceSkeleton = () => {
    return (
        <div className="service-card skeleton-card">
            <div className="service-icon skeleton skeleton-icon"></div>
            <div className="skeleton skeleton-text skeleton-title"></div>
            <div className="skeleton skeleton-text skeleton-desc"></div>
            <div className="skeleton skeleton-text skeleton-desc-short"></div>

            <ul className="service-features" style={{ marginTop: '1.5rem' }}>
                <li className="skeleton skeleton-text skeleton-list-item"></li>
                <li className="skeleton skeleton-text skeleton-list-item"></li>
                <li className="skeleton skeleton-text skeleton-list-item"></li>
            </ul>
        </div>
    );
};

export default ServiceSkeleton;
