import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, message = '' }) => {
    const sizes = {
        small: '24px',
        medium: '40px',
        large: '60px'
    };

    if (fullScreen) {
        return (
            <div className="loading-fullscreen">
                <div className="loading-spinner-wrapper">
                    <div
                        className="loading-spinner"
                        style={{ width: sizes[size], height: sizes[size] }}
                    ></div>
                    {message && <p className="loading-message">{message}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="loading-inline">
            <div
                className="loading-spinner"
                style={{ width: sizes[size], height: sizes[size] }}
            ></div>
            {message && <p className="loading-message">{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
