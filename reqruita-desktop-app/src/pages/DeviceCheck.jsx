import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth-ui.css";

export default function DeviceCheck({ role, onReady, onBack }) {
    const camVideoRef = useRef(null);
    const screenVideoRef = useRef(null);

    const [micOn, setMicOn] = useState(false);
    const [camOn, setCamOn] = useState(false);
    const [screenOn, setScreenOn] = useState(false);

    const [micStream, setMicStream] = useState(null);
    const [camStream, setCamStream] = useState(null);
    const [screenStream, setScreenStream] = useState(null);

    const [error, setError] = useState("");

    const mustPassAll = true;

    const canContinue = useMemo(() => {
        return mustPassAll ? micOn && camOn && screenOn : true;
    }, [mustPassAll, micOn, camOn, screenOn]);

    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => {
            document.body.classList.remove("rq-noscr");
            stopStream(micStream);
            stopStream(camStream);
            stopStream(screenStream);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function toggleMic() {
        setError("");
        if (micOn) {
            stopStream(micStream);
            setMicStream(null);
            setMicOn(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setMicStream(stream);
            setMicOn(true);
        } catch (e) {
            setError("Mic permission denied or no mic available.");
        }
    }

    async function toggleCam() {
        setError("");
        if (camOn) {
            stopStream(camStream);
            setCamStream(null);
            setCamOn(false);
            if (camVideoRef.current) camVideoRef.current.srcObject = null;
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setCamStream(stream);
            setCamOn(true);
            if (camVideoRef.current) camVideoRef.current.srcObject = stream;
        } catch (e) {
            setError("Camera permission denied or no camera available.");
        }
    }

    async function toggleScreen() {
        setError("");
        if (screenOn) {
            stopStream(screenStream);
            setScreenStream(null);
            setScreenOn(false);
            if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            setScreenStream(stream);
            setScreenOn(true);
            if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;

            const track = stream.getVideoTracks()[0];
            if (track) {
                track.onended = () => {
                    stopStream(stream);
                    setScreenStream(null);
                    setScreenOn(false);
                    if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
                };
            }
        } catch (e) {
            setError("Screen share denied or not supported.");
        }
    }

    function continueNext() {
        if (!canContinue) return;
        onReady({ micOn, camOn, screenOn });
    }

    return (
        <div className="dc-wrap">
            <div className="dc-card">
                <div className="dc-top">
                    <div>
                        <h2 className="dc-title">Device Check</h2>
                        <div className="dc-sub">
                            Turn on <b>Mic</b>, <b>Camera</b> and <b>Screen Share</b>. You can’t continue until all 3 are enabled.
                        </div>
                    </div>

                    <div className="dc-chip">
                        <span style={{ fontWeight: 800, color: "#2b1a73" }}>
                            {role === "join" ? "Join interview" : "Conduct interview"}
                        </span>
                    </div>
                </div>

                <div className="dc-controls">
                    <button
                        className={`dc-pill ${micOn ? "dc-pill-on" : ""}`}
                        onClick={toggleMic}
                    >
                        <span className={`dc-dot ${micOn ? "dc-dot-on" : ""}`} />
                        {micOn ? "Mic ON" : "Turn on Mic"}
                    </button>

                    <button
                        className={`dc-pill ${camOn ? "dc-pill-on" : ""}`}
                        onClick={toggleCam}
                    >
                        <span className={`dc-dot ${camOn ? "dc-dot-on" : ""}`} />
                        {camOn ? "Camera ON" : "Turn on Camera"}
                    </button>

                    <button
                        className={`dc-pill ${screenOn ? "dc-pill-on" : ""}`}
                        onClick={toggleScreen}
                    >
                        <span className={`dc-dot ${screenOn ? "dc-dot-on" : ""}`} />
                        {screenOn ? "Screen Share ON" : "Turn on Screen Share"}
                    </button>
                </div>

                {error && <div className="dc-err">{error}</div>}

                <div className="dc-grid">
                    <Preview title="Camera Preview" ready={camOn}>
                        <video ref={camVideoRef} autoPlay playsInline muted className="dc-video" />
                    </Preview>

                    <Preview title="Screen Share Preview" ready={screenOn}>
                        <video ref={screenVideoRef} autoPlay playsInline muted className="dc-video" />
                    </Preview>
                </div>

                <div className="dc-footer">
                    <button onClick={onBack} className="dc-back">Back</button>

                    <button
                        onClick={continueNext}
                        className={`dc-next ${canContinue ? "" : "dc-next-disabled"}`}
                        disabled={!canContinue}
                    >
                        Continue
                    </button>
                </div>

                <div className="dc-tip">
                    Tip: On Windows, you may need to allow Camera/Mic permissions in system settings.
                </div>
            </div>
        </div>
    );
}

function stopStream(stream) {
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
}

function Preview({ title, ready, children }) {
    return (
        <div className="dc-preview">
            <div className="dc-preview-head">
                <div className="dc-preview-title">{title}</div>
                <div className="dc-status">
                    <span className={`dc-dot ${ready ? "dc-dot-on" : ""}`} />
                    {ready ? "READY" : "OFF"}
                </div>
            </div>

            <div className="dc-body">
                {children}
            </div>
        </div>
    );
}
