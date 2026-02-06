// src/pages/MeetingInterviewee.jsx
import React, { useEffect, useRef, useState } from "react";
import "./auth-ui.css";

/**
 * Interviewee (Join) Meeting
 * - Enters "interview mode" (fullscreen + kiosk-ish) on mount via preload API
 * - Exits interview mode when leaving / unmounting
 * - Main area: REAL screen share (getDisplayMedia)
 * - Left tile: REAL interviewee camera (getUserMedia)
 * - Right tile: interviewer placeholder (image/box for now)
 * - Footer: Mic/Video toggles + Leave Interview
 *
 * Requires preload exposing:
 * window.reqruita.enterInterviewMode()
 * window.reqruita.exitInterviewMode()
 */

export default function MeetingInterviewee({ session, onLeave }) {
    const camRef = useRef(null);

    const [camStream, setCamStream] = useState(null);

    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);

    const [error, setError] = useState("");
    const [googleOpen, setGoogleOpen] = useState(false);

    // Enter full-screen "locked" mode when candidate joins
    useEffect(() => {
        try {
            window.reqruita?.enterInterviewMode?.();
        } catch (e) {
            // ignore (e.g., running in browser dev without Electron)
        }

        // Safety: always unlock on unmount
        return () => {
            try {
                window.reqruita?.exitInterviewMode?.();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // Keep meeting non-scroll (panel can scroll internally elsewhere)
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    // Start camera when entering meeting
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setError("");

                // Interviewee camera + mic (local)
                const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!mounted) return;

                setCamStream(cam);
                if (camRef.current) camRef.current.srcObject = cam;
            } catch (e) {
                setError("Could not start camera/microphone. Please check permissions.");
            }
        })();

        return () => {
            mounted = false;
            stopStream(camStream);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply mic toggle
    useEffect(() => {
        if (!camStream) return;
        setTracksEnabled(camStream, "audio", !micMuted);
    }, [micMuted, camStream]);

    // Apply camera toggle
    useEffect(() => {
        if (!camStream) return;
        setTracksEnabled(camStream, "video", !camOff);
    }, [camOff, camStream]);

    function toggleMic() {
        setMicMuted((v) => !v);
    }

    function toggleVideo() {
        setCamOff((v) => !v);
    }

    function leave() {
        // Unlock app window first
        try {
            window.reqruita?.exitInterviewMode?.();
        } catch (e) {
            // ignore
        }

        stopStream(camStream);
        onLeave?.();
    }

    return (
        <div className="jm-wrap">
            {error && (
                <div className="mt-err" style={{ background: "rgba(220,38,38,0.92)" }}>
                    {error}
                </div>
            )}

            <div className="jm-row">
                {/* Main shared screen */}
                <div className="jm-main">
                    <div className="jm-google">
                        {!googleOpen && (
                            <div className="jm-google-launch">
                                <div className="jm-google-badge">G</div>
                                <div className="jm-google-title">Google app</div>
                                <div className="jm-google-sub">
                                    Open Google for quick searches during the interview.
                                </div>
                                <div className="jm-google-meta">Meeting: {session?.meetingId || "—"}</div>
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
                    {/* Interviewee video (real) */}
                    <div className="jm-tile">
                        <video ref={camRef} autoPlay playsInline muted />
                        <div className="jm-label">You (Candidate)</div>
                    </div>

                    {/* Interviewer video (placeholder for now) */}
                    <div className="jm-tile">
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
                            }}
                        >
                            Interviewer video (placeholder)
                        </div>
                        <div className="jm-label">Interviewer</div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="jm-footer">
                <div className="jm-left">
                    <button className={`mt-ctl ${micMuted ? "mt-ctl-off" : ""}`} onClick={toggleMic}>
                        {micMuted ? "Mic Off" : "Mic"}
                    </button>

                    <button className={`mt-ctl ${camOff ? "mt-ctl-off" : ""}`} onClick={toggleVideo}>
                        {camOff ? "Video Off" : "Video"}
                    </button>
                </div>

                <button className="mt-end" onClick={leave}>
                    Leave interview
                </button>
            </div>
        </div>
    );
}

/* helpers */
function stopStream(stream) {
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
}

function setTracksEnabled(stream, kind, enabled) {
    const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
    for (const t of tracks) t.enabled = enabled;
}