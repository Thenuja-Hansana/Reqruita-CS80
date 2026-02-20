import React, { useEffect } from "react";
import "./auth-ui.css";

// SVG Icons for the cards
const UserIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const BriefcaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

const ArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export default function RoleSelect({ onPickRole }) {
    // Disable scrolling and set theme for this screen
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        const originalBg = document.body.style.background;
        document.body.style.background = "#ffffff";

        return () => {
            document.body.classList.remove("rq-noscr");
            document.body.style.background = originalBg;
        };
    }, []);

    return (
        <div className="rs-shell">
            <div className="rs-container">
                <div className="rs-left-premium">
                    <div className="rs-brand-tag rs-animate-1">Revolutionizing Recruitment</div>
                    <h1 className="rs-welcome-v2 rs-animate-2">
                        Welcome to <br />
                        <span>Reqruita.</span>
                    </h1>
                    <p className="rs-desc rs-animate-3">
                        Experience the future of remote interviews with our secure, AI-powered platform designed for excellence.
                    </p>
                </div>

                <div className="rs-options">
                    <div
                        className="rs-role-card rs-card-primary rs-animate-2"
                        onClick={() => onPickRole("join")}
                    >
                        <div className="rs-role-icon">
                            <UserIcon />
                        </div>
                        <div className="rs-role-info">
                            <span className="rs-role-title">Join as Candidate</span>
                            <span className="rs-role-sub">Access your scheduled interview session and showcase your talent.</span>
                        </div>
                        <div className="rs-role-arrow">
                            <ArrowRight />
                        </div>
                    </div>

                    <div
                        className="rs-role-card rs-animate-3"
                        onClick={() => onPickRole("conduct")}
                    >
                        <div className="rs-role-icon">
                            <BriefcaseIcon />
                        </div>
                        <div className="rs-role-info">
                            <span className="rs-role-title">Conduct Interview</span>
                            <span className="rs-role-sub">Connect with potential hires and manage your evaluation process.</span>
                        </div>
                        <div className="rs-role-arrow">
                            <ArrowRight />
                        </div>
                    </div>

                    <div className="rs-animate-4" style={{ marginTop: '20px', textAlign: 'center' }}>
                        <span style={{ color: '#4b5563', fontSize: '12px', fontWeight: '500' }}>
                            Secured & Encrypted Interview Sessions
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

