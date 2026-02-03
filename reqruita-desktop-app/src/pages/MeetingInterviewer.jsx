// src/pages/MeetingInterviewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth-ui.css";

/**
 * MeetingInterviewer.jsx
 * - Right panel toggles: Participants / Chat / Notes
 * - Notes has Remarks/Details toggle
 * - Main stage shrinks when right panel opens, tiles keep same size
 *
 * NOTE:
 * - This is MVP UI + local state (no backend)
 * - Interviewee video/share are placeholders 
 */

export default function MeetingInterviewer({ session, onEnd }) {
    const videoRef = useRef(null);

    // Streams / devices
    const [devices, setDevices] = useState({ mics: [], cams: [] });
    const [selectedMicId, setSelectedMicId] = useState("");
    const [selectedCamId, setSelectedCamId] = useState("");
    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [camStream, setCamStream] = useState(null);
    const [error, setError] = useState("");

    // Right panel: null | "participants" | "chat" | "notes"
    const [panel, setPanel] = useState(null);

    // Chat
    const [chatInput, setChatInput] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, who: "them", name: "Interviewee", text: "Hi! Can you hear me okay?", time: "09:12" },
        { id: 2, who: "me", name: "You", text: "Yes, loud and clear. Let’s start.", time: "09:12" },
    ]);

    // Notes
    const [notesTab, setNotesTab] = useState("remarks"); // remarks | details
    const [remarks, setRemarks] = useState("");

    // Participants state - Connected to Mock Backend (db.json)
    const [participants, setParticipants] = useState([]);

    // Filtering participants based on status from the backend
    const interviewing = useMemo(() => participants.filter(p => p.status === "interviewing"), [participants]);
    const waiting = useMemo(() => participants.filter(p => p.status === "waiting"), [participants]);
    const completed = useMemo(() => participants.filter(p => p.status === "completed"), [participants]);

    const API_URL = "http://127.0.0.1:3001/api/participants";

    // Fetches the latest participant list from the backend
    const fetchParticipants = async () => {
        try {
            console.log("Fetching from:", API_URL);
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            console.log("Participants received:", data);
            // Ensure data is an array before setting state
            setParticipants(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch participants", err);
            setError("Backend connection failed. Please check if the server is running on port 3001.");
            setParticipants([]); // Reset to empty array on error
        }
    };

    // Load participants on component mount
    useEffect(() => {
        fetchParticipants();
    }, []);

    const micLabel = useMemo(() => {
        const d = devices.mics.find((x) => x.deviceId === selectedMicId);
        return d?.label || "Microphone";
    }, [devices.mics, selectedMicId]);

    const camLabel = useMemo(() => {
        const d = devices.cams.find((x) => x.deviceId === selectedCamId);
        return d?.label || "Camera";
    }, [devices.cams, selectedCamId]);

    // Keep meeting non-scroll (right panel will scroll internally)
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    // Start camera+mic once so labels appear on Windows
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
                if (!mounted) return;

                setCamStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;

                const list = await navigator.mediaDevices.enumerateDevices();
                const mics = list.filter((d) => d.kind === "audioinput");
                const cams = list.filter((d) => d.kind === "videoinput");
                setDevices({ mics, cams });

                if (mics[0]?.deviceId) setSelectedMicId(mics[0].deviceId);
                if (cams[0]?.deviceId) setSelectedCamId(cams[0].deviceId);
            } catch (e) {
                setError("Could not access camera/microphone. Please check permissions.");
            }
        })();

        return () => {
            mounted = false;
            stopStream(camStream);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply toggles to current stream
    useEffect(() => {
        if (!camStream) return;
        setTracksEnabled(camStream, "audio", !micMuted);
    }, [micMuted, camStream]);

    useEffect(() => {
        if (!camStream) return;
        setTracksEnabled(camStream, "video", !camOff);
    }, [camOff, camStream]);

    function toggleMic() {
        setMicMuted((v) => !v);
    }

    function toggleCam() {
        setCamOff((v) => !v);
    }

    function endInterview() {
        stopStream(camStream);
        onEnd?.();
    }

    function togglePanel(next) {
        setPanel((cur) => (cur === next ? null : next));
    }

    // Waiting room actions - Integrated with Backend Status Transitions
    async function acceptCandidate(id) {
        try {
            // Tells backend to move current interviewer to 'completed' 
            // and the selected candidate to 'interviewing'
            await fetch(`${API_URL}/allow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchParticipants(); // Refresh lists to show updated statuses
        } catch (err) {
            console.error("Failed to accept candidate", err);
        }
    }

    async function rejectCandidate(id) {
        try {
            // Removes candidate from the list/database
            await fetch(`${API_URL}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            fetchParticipants(); // Refresh lists
        } catch (err) {
            console.error("Failed to reject candidate", err);
        }
    }

    // Chat send
    function sendMessage() {
        const text = chatInput.trim();
        if (!text) return;

        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setMessages((m) => [...m, { id: Date.now(), who: "me", name: "You", text, time }]);
        setChatInput("");
    }

    return (
        <div className="mt-wrap">
            {error && <div className="mt-err">{error}</div>}

            {/* Stage + Right Panel */}
            <div className={`mt-mainrow ${panel ? "withSide" : ""}`}>
                {/* Main Stage */}
                <div className="mt-stage">
                    {/* Main shared screen placeholder */}
                    <div className="mt-share">
                        <div className="mt-share-placeholder">
                            Interviewee screen share (placeholder)
                            <div style={{ marginTop: 8, fontWeight: 700, opacity: 0.8, fontSize: 12 }}>
                                Meeting: {session?.meetingId || "—"}
                            </div>
                        </div>
                    </div>

                    {/* Interviewee cam tile (bottom-left) */}
                    <div className="mt-tile mt-tile-peer">
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))",
                                display: "grid",
                                placeItems: "center",
                                color: "rgba(255,255,255,0.9)",
                                fontWeight: 900,
                                fontSize: 12,
                            }}
                        >
                            Interviewee video
                        </div>
                        <div className="mt-tile-label">Interviewee</div>
                    </div>

                    {/* Interviewer tile (bottom-right) */}
                    <div className="mt-tile mt-tile-self">
                        <video ref={videoRef} autoPlay playsInline muted />
                        <div className="mt-tile-label">You (Interviewer)</div>
                    </div>
                </div>

                {/* Right Panel */}
                {panel && (
                    <aside className="mt-side">
                        <div className="mt-side-head">
                            <div className="mt-side-title">
                                {panel === "participants" ? "Participants" : panel === "chat" ? "Chat" : "Notes"}
                            </div>
                            <button className="mt-side-close" onClick={() => setPanel(null)}>
                                ✕
                            </button>
                        </div>

                        <div className="mt-side-body" style={{ padding: panel === "chat" ? 0 : undefined }}>
                            {/* Participants */}
                            {panel === "participants" && (
                                <>
                                    <div className="mt-sec-title">Interviewing</div>
                                    <div className="mt-card">
                                        {interviewing.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                actions={
                                                    <div className="mt-actions">
                                                        <button className="mt-act mt-act-gray" title="More">
                                                            ⋮
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-sec-title" style={{ marginTop: 14 }}>
                                        Waiting
                                    </div>
                                    <div className="mt-card">
                                        {waiting.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                actions={
                                                    <div className="mt-actions">
                                                        <button
                                                            className="mt-act mt-act-red"
                                                            title="Remove"
                                                            onClick={() => rejectCandidate(p.id)}
                                                        >
                                                            ✕
                                                        </button>
                                                        <button
                                                            className="mt-act mt-act-blue"
                                                            title="Admit"
                                                            onClick={() => acceptCandidate(p.id)}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button className="mt-act mt-act-gray" title="More">
                                                            ⋮
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>

                                    <div className="mt-sec-title" style={{ marginTop: 14 }}>
                                        Completed Participants
                                    </div>
                                    <div className="mt-card">
                                        {completed.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                actions={
                                                    <div className="mt-actions">
                                                        <button className="mt-act mt-act-blue" title="Details">
                                                            ⋮
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Chat */}
                            {panel === "chat" && (
                                <div className="mt-chat">
                                    <div className="mt-chat-list">
                                        {messages.map((m) => (
                                            <div key={m.id} className={`mt-msg ${m.who}`}>
                                                <div className="mt-msgmeta">
                                                    <span>{m.name}</span>
                                                    <span>{m.time}</span>
                                                </div>
                                                <div className="mt-bubble">{m.text}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-chat-input">
                                        <input
                                            className="mt-chat-field"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Type a message…"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") sendMessage();
                                            }}
                                        />
                                        <button className="mt-send" onClick={sendMessage} disabled={!chatInput.trim()}>
                                            Send
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {panel === "notes" && (
                                <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                                    <div className="nt-topTabs">
                                        <button
                                            className={`nt-tab ${notesTab === "remarks" ? "active" : ""}`}
                                            onClick={() => setNotesTab("remarks")}
                                        >
                                            Remarks
                                        </button>
                                        <button
                                            className={`nt-tab ${notesTab === "details" ? "active" : ""}`}
                                            onClick={() => setNotesTab("details")}
                                        >
                                            Details
                                        </button>
                                    </div>

                                    <div className="nt-interviewerRow">
                                        <div className="nt-pillRow">
                                            <div className="nt-namePill">
                                                <div className="nt-avatarSm">R</div>
                                                Robert Nachino
                                            </div>
                                        </div>
                                    </div>

                                    <div className="nt-body">
                                        {notesTab === "remarks" && (
                                            <textarea
                                                className="nt-textarea"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Write remarks here… (Saved locally for now)"
                                            />
                                        )}

                                        {notesTab === "details" && (
                                            <div className="nt-profileCard">
                                                <div className="nt-h1">Robert Nachino</div>
                                                <div className="nt-small">Software Engineer</div>

                                                <div className="nt-h2">Contact</div>
                                                <div className="nt-kv">
                                                    <div className="nt-ico">📍</div>
                                                    <div className="nt-small">San Francisco, CA</div>
                                                </div>
                                                <div className="nt-kv">
                                                    <div className="nt-ico">📞</div>
                                                    <div className="nt-small">+1 (555) 123-4567</div>
                                                </div>
                                                <div className="nt-kv">
                                                    <div className="nt-ico">✉️</div>
                                                    <div className="nt-small">robert.nachino@email.com</div>
                                                </div>
                                                <div className="nt-kv">
                                                    <div className="nt-ico">🔗</div>
                                                    <div className="nt-small">
                                                        <a className="nt-link" href="#" onClick={(e) => e.preventDefault()}>
                                                            github.com/robertnachino
                                                        </a>{" "}
                                                        •{" "}
                                                        <a className="nt-link" href="#" onClick={(e) => e.preventDefault()}>
                                                            linkedin.com/in/robertnachino
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="nt-h2">Professional Summary</div>
                                                <div className="nt-small">
                                                    Results-driven Software Engineer with 5+ years of experience designing,
                                                    developing, and maintaining scalable web and backend applications. Strong
                                                    background in full-stack development, cloud technologies, and agile
                                                    methodologies. Passionate about clean code, performance optimization, and
                                                    continuous learning.
                                                </div>

                                                <div className="nt-h2">Technical Skills</div>
                                                <ul className="nt-list">
                                                    <li>Languages: Java, Python, JavaScript, TypeScript</li>
                                                    <li>Frameworks: React, Node.js, Spring Boot, Express</li>
                                                    <li>Databases: PostgreSQL, MySQL, MongoDB, Redis</li>
                                                    <li>Cloud/DevOps: AWS (EC2, S3, RDS), Docker, Kubernetes, CI/CD</li>
                                                    <li>Tools: Git, GitHub, Jira, Jenkins</li>
                                                    <li>Other: REST APIs, Microservices, Agile/Scrum, Unit Testing</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* Footer */}
            <div className="mt-footer">
                <div className="mt-left">
                    <button className={`mt-ctl ${micMuted ? "mt-ctl-off" : ""}`} onClick={toggleMic}>
                        {micMuted ? "Mic Off" : "Mic"}
                    </button>
                    <button className="mt-caret" title={micLabel}>
                        ▾
                    </button>

                    <button className={`mt-ctl ${camOff ? "mt-ctl-off" : ""}`} onClick={toggleCam}>
                        {camOff ? "Video Off" : "Video"}
                    </button>
                    <button className="mt-caret" title={camLabel}>
                        ▾
                    </button>
                </div>

                <div className="mt-mid">
                    <button className="mt-midbtn" onClick={() => togglePanel("participants")}>
                        Participants
                    </button>
                    <button className="mt-midbtn" onClick={() => togglePanel("chat")}>
                        Chat
                    </button>
                    <button className="mt-midbtn" onClick={() => togglePanel("notes")}>
                        Notes
                    </button>
                </div>

                <div className="mt-right">
                    <button className="mt-end" onClick={endInterview}>
                        End Interview
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Small UI helper ---------- */
function ParticipantRow({ name, actions }) {
    const initial = (name || "?").trim().slice(0, 1).toUpperCase();
    return (
        <div className="mt-p-row">
            <div className="mt-avatar">{initial}</div>
            <div>
                <div className="mt-p-name">{name}</div>
                <div className="mt-p-sub"> </div>
            </div>
            {actions}
        </div>
    );
}

/* ---------- Media helpers ---------- */
function stopStream(stream) {
    if (!stream) return;
    for (const track of stream.getTracks()) track.stop();
}

function setTracksEnabled(stream, kind, enabled) {
    const tracks = kind === "audio" ? stream.getAudioTracks() : stream.getVideoTracks();
    for (const t of tracks) t.enabled = enabled;
}