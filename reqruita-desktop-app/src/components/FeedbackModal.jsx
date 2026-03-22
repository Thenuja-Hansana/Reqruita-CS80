import React, { useState } from "react";
import "./FeedbackModal.css";

/**
 * FeedbackModal Component
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} role - "join" (Interviewee) or "conduct" (Interviewer)
 * @param {function} onSubmit - Called with { rating, feedback } or { status, feedback }
 * @param {function} onClose - Called when the modal is dismissed
 * @param {function} addToast - App toast helper
 */
export default function FeedbackModal({ isOpen, role, onSubmit, onClose, addToast }) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [status, setStatus] = useState(""); // For interviewer: "positive" | "negative" | "neutral"

    if (!isOpen) return null;

    const isInterviewee = role === "join";

    const handleRating = (r) => setRating(r);

    const handleSubmit = () => {
        if (isInterviewee) {
            onSubmit({ rating, feedback });
        } else {
            if (!status) {
                addToast?.("Please select Positive, Neutral, or Negative", "warning");
                return;
            }
            onSubmit({ status, feedback });
        }
    };

    return (
        <div className="fb-overlay">
            <div className="fb-card">
                <button className="fb-close-btn" onClick={onClose} title="Close">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="fb-icon-wrap">
                    <div className="fb-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                </div>

                <h2 className="fb-title">How was the interview?</h2>
                <p className="fb-message">
                    {isInterviewee 
                        ? "Thank you for attending! Please share your experience with us." 
                        : "Session ended. Add any final notes or feedback for this candidate."}
                </p>

                <div className="fb-content">
                    {isInterviewee ? (
                        <div className="fb-rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    className={`fb-star ${rating >= star ? "active" : ""}`}
                                    onClick={() => handleRating(star)}
                                >
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="fb-status-options">
                            {["positive", "neutral", "negative"].map((opt) => (
                                <button
                                    key={opt}
                                    className={`fb-opt-btn ${status === opt ? "active" : ""} ${opt}`}
                                    onClick={() => setStatus(opt)}
                                >
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    <textarea
                        className="fb-textarea"
                        placeholder="Write your feedback here..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                </div>

                <div className="fb-actions">
                    {!isInterviewee && (
                        <button className="fb-btn-secondary" onClick={() => addToast?.("Summary feature coming soon!", "info")}>
                            View Summary
                        </button>
                    )}
                    <button className="fb-btn-primary" onClick={handleSubmit}>
                        Submit & Finish
                    </button>
                </div>
            </div>
        </div>
    );
}
