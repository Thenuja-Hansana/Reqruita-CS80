// src/pages/MeetingInterviewee.jsx
import React, { useEffect, useRef, useState } from "react";
import "./auth-ui.css";
import { BACKEND_URL } from "../config";

/**
 * MeetingInterviewee.jsx (FINAL MVP)
 * - Starts camera+mic
 * - Registers candidate on backend so interviewer can see them
 * - Does NOT require meetingId (because your session.meetingId is currently "—")
 */

export default function MeetingInterviewee({ session, onLeave }) {
    const camRef = useRef(null);

    const [camStream, setCamStream] = useState(null);
    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);

    const [error, setError] = useState("");
    const [googleOpen, setGoogleOpen] = useState(false);

    // Candidate display name (later replace with real input)
    const candidateName = session?.candidateName || session?.name || "Candidate";

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

    // 3) Register candidate on backend (IMPORTANT)
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

    // 4) Start camera/mic
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setError("");

                const cam = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true,
                });

                if (!mounted) {
                    stopStream(cam);
                    return;
                }

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
        try {
            window.reqruita?.exitInterviewMode?.();
        } catch (e) { }

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
                                <div className="jm-google-meta">
                                    Meeting: {session?.meetingId || "—"}
                                </div>
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
                        <video ref={camRef} autoPlay playsInline muted />
                        <div className="jm-label">You (Candidate)</div>
                    </div>

                    {/* Interviewer placeholder */}
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
