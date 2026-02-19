// src/pages/MeetingInterviewee.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth-ui.css";
import { BACKEND_URL } from "../config";
import { useWebRTC } from "../webrtc/useWebRTC";

/**
 * MeetingInterviewee.jsx (FINAL - WebRTC + Candidate Google Window + Screen Share)
 *
 * ✅ Candidate sends cam+mic to interviewer (two-way)
 * ✅ Candidate receives interviewer cam+audio
 * ✅ Candidate can screen share ("Share Screen") which shows on interviewer main stage
 * ✅ Still registers candidate in participants list (so interviewer sees them)
 *
 * IMPORTANT:
 * - meetingId MUST be a real id (not "—") and must match both sides.
 *   (Interviewer and interviewee must join same meetingId.)
 * - BACKEND_URL must be reachable from BOTH laptops (use LAN IP, not localhost).
 */

export default function MeetingInterviewee({ session, onLeave, addToast }) {
    const meetingId = useMemo(() => session?.meetingId || "", [session]);

    // Video refs
    const localCamRef = useRef(null);
    const remoteCamRef = useRef(null);
    const autoShareAttemptedRef = useRef(false);

    // UI toggles
    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [sharing, setSharing] = useState(false);

    // UI state
    const [error, setError] = useState("");
    const [googleOpen, setGoogleOpen] = useState(false);

    // Candidate display name (later replace with real input)
    const candidateName = session?.candidateName || session?.name || "Candidate";

    // ✅ WebRTC hook
    const {
        localCamStream,
        localScreenStream,
        remoteCamStream,
        startScreenShare,
        stopScreenShare,
        setMicEnabled,
        setCamEnabled,
    } = useWebRTC({ meetingId, role: "interviewee" });

    // 1) Enter/Exit interview mode (Electron)
    useEffect(() => {
        try {
            window.reqruita?.enterInterviewMode?.();
        } catch (e) {
            // ignore in browser dev
        }

        return () => {
            try {
                window.reqruita?.exitInterviewMode?.();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // 2) Prevent body scroll
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    // 3) Register candidate on backend (waiting room)
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setError("");

                await fetch(`${BACKEND_URL}/api/participants/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({ name: candidateName }),
                });
            } catch (e) {
                if (e.name === "AbortError") return; // normal cleanup
                console.log("Join backend failed:", e);
                setError("Could not connect to interview server. Check backend + Wi-Fi/IP.");
            }
        })();

        return () => controller.abort();
    }, [candidateName]);

    // 4) Attach local stream
    useEffect(() => {
        if (localCamRef.current && localCamStream) {
            localCamRef.current.srcObject = localCamStream;
        }
    }, [localCamStream]);

    // 5) Attach remote interviewer stream
    useEffect(() => {
        if (remoteCamRef.current && remoteCamStream) {
            remoteCamRef.current.srcObject = remoteCamStream;
        }
    }, [remoteCamStream]);

    // 6) Apply toggles to WebRTC tracks
    useEffect(() => {
        setMicEnabled(!micMuted);
    }, [micMuted, setMicEnabled]);

    useEffect(() => {
        setCamEnabled(!camOff);
    }, [camOff, setCamEnabled]);

    // 7) Track screen share state + auto-open Google when sharing starts
    useEffect(() => {
        const isSharing = !!localScreenStream;
        setSharing((prev) => {
            if (isSharing && !prev) addToast?.("Screen sharing started", "info");
            if (!isSharing && prev) addToast?.("Screen sharing stopped", "warning");
            return isSharing;
        });
        if (isSharing) {
            // Use functional updater so we don't need googleOpen in deps
            setGoogleOpen((prev) => prev || true);
        }
    }, [localScreenStream, addToast]);

    // Automatically share the desktop on join inside the Electron shell so the interviewer sees the full screen immediately
    useEffect(() => {
        const runningInDesktop = typeof window !== "undefined" && !!window.reqruita;
        if (!runningInDesktop) return;
        if (autoShareAttemptedRef.current) return;
        if (!meetingId || !localCamStream) return;

        autoShareAttemptedRef.current = true;
        (async () => {
            try {
                await startScreenShare();
            } catch (err) {
                console.error("Automatic screen share failed:", err);
                setError((prev) => prev || "Automatic screen share failed. Use Share Screen or grant permissions.");
            }
        })();
    }, [meetingId, localCamStream, startScreenShare]);

    function toggleMic() {
        setMicMuted((v) => !v);
    }

    function toggleVideo() {
        setCamOff((v) => !v);
    }

    async function toggleShare() {
        try {
            setError("");
            if (sharing) {
                await stopScreenShare();
            } else {
                await startScreenShare();
            }
        } catch (e) {
            console.error("Screen share failed:", e);
            setError("Screen share failed. Please check permissions / Electron settings.");
        }
    }

    function leave() {
        if (!window.confirm("Are you sure you want to leave the interview?")) return;
        try {
            window.reqruita?.exitInterviewMode?.();
        } catch (e) { }

        try {
            stopScreenShare();
        } catch (e) { }

        onLeave?.();
    }

    const hasRemote = !!remoteCamStream;

    return (
        <div className={`jm-wrap ${sharing ? "jm-sharing-active" : ""}`}>
            {error && (
                <div className="mt-err" style={{ background: "rgba(220,38,38,0.92)" }}>
                    {error}
                </div>
            )}

            {/* If meetingId is missing, show a clear warning */}
            {!meetingId && (
                <div className="mt-err" style={{ background: "rgba(245,158,11,0.95)" }}>
                    Missing meetingId. Both devices must join the SAME meetingId for video to work.
                </div>
            )}

            {/* Connection status indicator */}
            <div className="mt-conn-status">
                <span className={`mt-conn-dot ${hasRemote ? "mt-conn-on" : "mt-conn-pulse"}`} />
                <span className="mt-conn-text">
                    {hasRemote ? "Interviewer connected" : "Waiting for interviewer…"}
                </span>
                <span className="mt-conn-id">Meeting: {meetingId || "—"}</span>
            </div>

            <div className="jm-row">
                {/* Main area */}
                <div className="jm-main">
                    <div className="jm-google">
                        {!googleOpen && (
                            <div className="jm-google-launch">
                                <div className="jm-google-badge">G</div>
                                <div className="jm-google-title">Google app</div>
                                <div className="jm-google-sub">
                                    Open Google for quick searches during the interview.
                                </div>
                                <div className="jm-google-meta">Meeting: {meetingId || "—"}</div>

                                <button className="jm-google-btn" onClick={() => setGoogleOpen(true)}>
                                    Open Google
                                </button>
                            </div>
                        )}

                        {googleOpen && (
                            <div className="jm-google-shell">
                                <div className="jm-google-bar">
                                    <div className="jm-google-badge sm">G</div>
                                    <div style={{ flex: 1, fontWeight: 800, fontSize: 13, color: 'rgba(255,255,255,0.92)' }}>Google</div>
                                    <button className="jm-google-close" onClick={() => setGoogleOpen(false)} title="Close Google">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>

                                <iframe
                                    className="jm-google-frame"
                                    title="Google"
                                    src="https://www.google.com/webhp?igu=1"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Side videos */}
                <div className="jm-side">
                    {/* Candidate video */}
                    <div className="jm-tile">
                        <video ref={localCamRef} autoPlay playsInline muted />
                        <div className="jm-label">You (Candidate)</div>
                    </div>

                    {/* Interviewer remote video */}
                    <div className="jm-tile">
                        {hasRemote ? (
                            <video ref={remoteCamRef} autoPlay playsInline />
                        ) : (
                            <div className="mt-tile-ph">
                                <div className="mt-tile-ph-avatar mt-tile-ph-pulse">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <span className="mt-tile-ph-text">Connecting…</span>
                            </div>
                        )}
                        <div className="jm-label">Interviewer</div>
                    </div>
                </div>
            </div>

            {/* Footer Toolbar */}
            <div className="jm-footer">
                <div className="jm-left">
                    {/* Mic */}
                    <button className={`mt-icon-btn ${micMuted ? "mt-icon-off" : ""}`} onClick={toggleMic} title={micMuted ? "Unmute" : "Mute"}>
                        {micMuted ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                        <span className="mt-icon-label">{micMuted ? "Unmute" : "Mute"}</span>
                    </button>

                    {/* Camera */}
                    <button className={`mt-icon-btn ${camOff ? "mt-icon-off" : ""}`} onClick={toggleVideo} title={camOff ? "Turn on camera" : "Turn off camera"}>
                        {camOff ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34" />
                                <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        )}
                        <span className="mt-icon-label">{camOff ? "Start" : "Stop"}</span>
                    </button>

                    {/* Share Screen */}
                    <button className={`mt-icon-btn ${sharing ? "mt-icon-active" : ""}`} onClick={toggleShare} disabled={!meetingId} title={sharing ? "Stop Sharing" : "Share Screen"}>
                        {sharing ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3" />
                                <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                                <line x1="17" y1="3" x2="23" y2="9" /><line x1="23" y1="3" x2="17" y2="9" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                        )}
                        <span className="mt-icon-label">{sharing ? "Stop" : "Share"}</span>
                    </button>
                </div>

                <button className="mt-end" onClick={leave}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                        <line x1="23" y1="1" x2="1" y2="23" />
                    </svg>
                    <span>Leave</span>
                </button>
            </div>
        </div>
    );
}
