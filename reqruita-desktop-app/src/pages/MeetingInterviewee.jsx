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

export default function MeetingInterviewee({ session, onLeave }) {
    const meetingId = useMemo(() => session?.meetingId || "", [session]);

    // Video refs
    const localCamRef = useRef(null);
    const remoteCamRef = useRef(null);

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

    // 7) Track screen share state
    useEffect(() => {
        setSharing(!!localScreenStream);
    }, [localScreenStream]);

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
        <div className="jm-wrap">
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
                                    <div className="jm-google-title">Google</div>
                                    <button className="jm-google-btn" onClick={() => setGoogleOpen(false)}>
                                        Close
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
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    background:
                                        "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
                                    display: "grid",
                                    placeItems: "center",
                                    color: "rgba(255,255,255,0.9)",
                                    fontWeight: 900,
                                    fontSize: 12,
                                    textAlign: "center",
                                    padding: 10,
                                }}
                            >
                                Interviewer video (waiting…)
                            </div>
                        )}
                        <div className="jm-label">Interviewer</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="jm-footer">
                <div className="jm-left" style={{ display: "flex", gap: 10 }}>
                    <button className={`mt-ctl ${micMuted ? "mt-ctl-off" : ""}`} onClick={toggleMic}>
                        {micMuted ? "Mic Off" : "Mic"}
                    </button>

                    <button className={`mt-ctl ${camOff ? "mt-ctl-off" : ""}`} onClick={toggleVideo}>
                        {camOff ? "Video Off" : "Video"}
                    </button>

                    <button className={`mt-ctl ${sharing ? "" : ""}`} onClick={toggleShare} disabled={!meetingId}>
                        {sharing ? "Stop Share" : "Share Screen"}
                    </button>
                </div>

                <button className="mt-end" onClick={leave}>
                    Leave interview
                </button>
            </div>
        </div>
    );
}
