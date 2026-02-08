import React, { useState, useEffect } from 'react';
import './SplashScreen.css';

function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        let frame;
        let start = null;
        const duration = 1500; // 1.5 seconds

        // Easing: fast at start, slow at end
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const t = Math.min(elapsed / duration, 1);
            const progress = easeOut(t) * 100;

            setProgress(progress);

            if (t < 1) {
                frame = requestAnimationFrame(animate);
            } else {
                // Mark as complete and trigger fade out
                setTimeout(() => {
                    setIsComplete(true);
                }, 200);
            }
        };

        frame = requestAnimationFrame(animate);

        return () => {
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    // Handle fade out completion
    useEffect(() => {
        if (isComplete) {
            const timer = setTimeout(() => {
                onComplete();
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isComplete, onComplete]);

    return (
        <div className={`splash-screen ${isComplete ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <h1 className="splash-title">Primal Note</h1>
                <div className="splash-loader">
                    <div
                        className="splash-loader-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SplashScreen;
