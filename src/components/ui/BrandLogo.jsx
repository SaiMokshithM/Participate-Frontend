import React from 'react';

export function BrandLogo({ className = "", size = "md" }) {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-10 h-10",
        lg: "w-12 h-12",
        xl: "w-16 h-16"
    };

    const iconClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6",
        xl: "w-8 h-8"
    };

    return (
        <div className={`relative flex items-center justify-center transform hover:scale-105 transition-transform duration-500 group ${sizeClasses[size]} ${className}`}>
            {/* Outer Glow — Silent Waters steel blue */}
            <div
                className="absolute inset-0 rounded-[28%] blur-[8px] opacity-55 group-hover:opacity-90 transition-opacity duration-500"
                style={{ background: 'linear-gradient(135deg, #8BAEBF, #4A6572)' }}
            />

            {/* Glassmorphic Core */}
            <div
                className="relative w-full h-full backdrop-blur-xl rounded-[28%] flex items-center justify-center shadow-inner overflow-hidden"
                style={{ backgroundColor: 'rgba(28,43,51,0.75)', border: '1px solid rgba(139,174,191,0.30)' }}
            >
                {/* Inner subtle gradient */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(232,244,248,0.12), transparent)' }} />

                {/* 3D Isometric Cube */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                    className={`${iconClasses[size]} relative z-10`}
                    style={{ filter: 'drop-shadow(0 0 8px rgba(139,174,191,0.75))' }}
                >
                    {/* Top face */}
                    <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="url(#swTop)" stroke="#E8F4F8" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* Left face */}
                    <path d="M3 7V17L12 22V12L3 7Z" fill="url(#swLeft)" stroke="#E8F4F8" strokeWidth="1.2" strokeLinejoin="round" />
                    {/* Right face */}
                    <path d="M21 7V17L12 22V12L21 7Z" fill="url(#swRight)" stroke="#E8F4F8" strokeWidth="1.2" strokeLinejoin="round" />
                    <defs>
                        <linearGradient id="swTop" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E8F4F8" />
                            <stop offset="100%" stopColor="#8BAEBF" />
                        </linearGradient>
                        <linearGradient id="swLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4A6572" />
                            <stop offset="100%" stopColor="#1C2B33" />
                        </linearGradient>
                        <linearGradient id="swRight" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8BAEBF" />
                            <stop offset="100%" stopColor="#4A6572" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
}
