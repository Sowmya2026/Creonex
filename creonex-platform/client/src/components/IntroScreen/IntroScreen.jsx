import { useEffect } from 'react';

const IntroScreen = () => {
    useEffect(() => {
        const hasSeenIntro = localStorage.getItem('hasSeenIntro');

        if (hasSeenIntro) {
            document.body.classList.add('intro-seen');
        } else {
            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            const timer = setTimeout(() => {
                localStorage.setItem('hasSeenIntro', 'true');
                document.body.classList.add('intro-seen');
                document.body.style.overflow = '';
            }, 3300);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = '';
            };
        }
    }, []);

    return (
        <div className="intro-screen" id="introScreen">
            <div className="intro-content">
                <div className="intro-icon">
                    👋
                </div>
                <h1 className="intro-text">
                    <span className="intro-line">Hi, this is</span>
                    <span className="intro-brand">Creonex.viz</span>
                </h1>
            </div>
        </div>
    );
};

export default IntroScreen;

