// src/pages/MeetingInterviewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth-ui.css";
import { BACKEND_URL } from "../config";
import { useWebRTC } from "../webrtc/useWebRTC";

/**
 * MeetingInterviewer.jsx (FINAL - WebRTC + Participants Panel)
 * ✅ Shows:
 *   - Your local cam preview
 *   - Remote candidate cam (audio + video)
 *   - Remote candidate screen share (big stage)
 * ✅ Keeps:
 *   - Right panel toggles: Participants / Chat / Notes
 *   - Participants list from backend (polling every 2s)
 *
 * Backend requirements:
 *   - REST: /api/participants endpoints (your existing ones)
 *   - Socket.IO signaling: join-meeting + webrtc-signal (from the updated server.js)
 */

export default function MeetingInterviewer({ session, onEnd, addToast }) {
    const meetingId = session?.meetingId || "";

    // Video refs
    const localVideoRef = useRef(null);
    const remoteCamRef = useRef(null);
    const remoteScreenRef = useRef(null);

    // Streams / devices (UI labels only)
    const [devices, setDevices] = useState({ mics: [], cams: [] });
    const [selectedMicId, setSelectedMicId] = useState("");
    const [selectedCamId, setSelectedCamId] = useState("");

    // Toggles
    const [micMuted, setMicMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);

    // UI error
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

    // Participants state
    const [participants, setParticipants] = useState([]);

    // ✅ WebRTC hook (local cam+mic + remote cam + remote screen)
    const {
        localCamStream,
        remoteCamStream,
        remoteScreenStream,
        setMicEnabled,
        setCamEnabled,
    } = useWebRTC({ meetingId, role: "interviewer" });

    // Derived lists
    const interviewing = useMemo(() => participants.filter((p) => p.status === "interviewing"), [participants]);
    const waiting = useMemo(() => participants.filter((p) => p.status === "waiting"), [participants]);
    const completed = useMemo(() => participants.filter((p) => p.status === "completed"), [participants]);

    const API_URL = `${BACKEND_URL}/api/participants`;

    // Normalize backend responses:
    // - array => array
    // - { participants: array } => array
    const normalizeParticipants = (data) => {
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.participants)) return data.participants;
        return [];
    };

    // Fetch participant list (GET)
    const fetchParticipants = async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const data = await res.json();
            setParticipants(normalizeParticipants(data));
            setError("");
        } catch (err) {
            console.error("Failed to fetch participants", err);
            setError("Backend connection failed. Please check if the server is running on port 3001.");
            setParticipants([]);
        }
    };

    // Load + poll participants
    useEffect(() => {
        fetchParticipants();
        const t = setInterval(fetchParticipants, 2000);
        return () => clearInterval(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep meeting non-scroll
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    // Attach local stream to local preview
    useEffect(() => {
        if (localVideoRef.current && localCamStream) {
            localVideoRef.current.srcObject = localCamStream;
        }
    }, [localCamStream]);

    // Attach remote cam stream + toast
    const prevRemoteCam = useRef(false);
    useEffect(() => {
        if (remoteCamRef.current && remoteCamStream) {
            remoteCamRef.current.srcObject = remoteCamStream;
        }
        const hasNow = !!remoteCamStream;
        if (hasNow && !prevRemoteCam.current) {
            addToast?.("Candidate joined the meeting", "success");
        } else if (!hasNow && prevRemoteCam.current) {
            addToast?.("Candidate disconnected", "warning");
        }
        prevRemoteCam.current = hasNow;
    }, [remoteCamStream, addToast]);

    // Attach remote screen stream + toast
    const prevRemoteScreen = useRef(false);
    useEffect(() => {
        if (remoteScreenRef.current && remoteScreenStream) {
            remoteScreenRef.current.srcObject = remoteScreenStream;
        }
        const hasNow = !!remoteScreenStream;
        if (hasNow && !prevRemoteScreen.current) {
            addToast?.("Candidate screen share received", "info");
        }
        prevRemoteScreen.current = hasNow;
    }, [remoteScreenStream, addToast]);

    // Enumerate devices once we have permission (localCamStream exists)
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                if (!localCamStream) return;

                const list = await navigator.mediaDevices.enumerateDevices();
                if (!mounted) return;

                const mics = list.filter((d) => d.kind === "audioinput");
                const cams = list.filter((d) => d.kind === "videoinput");
                setDevices({ mics, cams });

                if (mics[0]?.deviceId) setSelectedMicId(mics[0].deviceId);
                if (cams[0]?.deviceId) setSelectedCamId(cams[0].deviceId);
            } catch (e) {
                // Not fatal: device labels might be missing
                console.warn("enumerateDevices failed:", e);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [localCamStream]);

    // Apply toggles to local stream through WebRTC hook
    useEffect(() => {
        setMicEnabled(!micMuted);
    }, [micMuted, setMicEnabled]);

    useEffect(() => {
        setCamEnabled(!camOff);
    }, [camOff, setCamEnabled]);

    const micLabel = useMemo(() => {
        const d = devices.mics.find((x) => x.deviceId === selectedMicId);
        return d?.label || "Microphone";
    }, [devices.mics, selectedMicId]);

    const camLabel = useMemo(() => {
        const d = devices.cams.find((x) => x.deviceId === selectedCamId);
        return d?.label || "Camera";
    }, [devices.cams, selectedCamId]);

    function toggleMic() {
        setMicMuted((v) => !v);
    }

    function toggleCam() {
        setCamOff((v) => !v);
    }

    function endInterview() {
        if (!window.confirm("Are you sure you want to end the interview?")) return;
        onEnd?.();
    }

    function togglePanel(next) {
        setPanel((cur) => (cur === next ? null : next));
    }

    // Waiting room actions (POST) - update state from response
    async function acceptCandidate(id) {
        try {
            const res = await fetch(`${API_URL}/allow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            setParticipants(normalizeParticipants(data));
            addToast?.("Participant accepted", "success");
        } catch (err) {
            console.error("Failed to accept candidate", err);
            addToast?.("Failed to accept participant", "error");
        }
    }

    async function rejectCandidate(id) {
        try {
            const res = await fetch(`${API_URL}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            setParticipants(normalizeParticipants(data));
            addToast?.("Participant rejected", "info");
        } catch (err) {
            console.error("Failed to reject candidate", err);
            addToast?.("Failed to reject participant", "error");
        }
    }

    async function completeCandidate(id) {
        try {
            const res = await fetch(`${API_URL}/complete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            setParticipants(normalizeParticipants(data));
            addToast?.("Interview marked as complete", "success");
        } catch (err) {
            console.error("Failed to complete candidate", err);
            addToast?.("Failed to complete interview", "error");
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

    const hasRemoteCam = !!remoteCamStream;
    const hasRemoteScreen = !!remoteScreenStream;
    const totalParticipants = participants.length;

    return (
        <div className="mt-wrap">
            {error && <div className="mt-err">{error}</div>}

            {/* Connection status indicator */}
            <div className="mt-conn-status">
                <span className={`mt-conn-dot ${hasRemoteCam ? "mt-conn-on" : "mt-conn-pulse"}`} />
                <span className="mt-conn-text">
                    {hasRemoteCam ? "Candidate connected" : "Waiting for candidate…"}
                </span>
                <span className="mt-conn-id">Meeting: {meetingId || "—"}</span>
            </div>

            {/* Stage + Right Panel */}
            <div className={`mt-mainrow ${panel ? "withSide" : ""}`}>
                {/* Main Stage */}
                <div className="mt-stage">
                    {/* Main shared screen (remote screen share) */}
                    <div className="mt-share">
                        {hasRemoteScreen ? (
                            <video ref={remoteScreenRef} autoPlay playsInline />
                        ) : (
                            <div className="mt-share-placeholder">
                                <div className="mt-ph-content">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                    <div className="mt-ph-title">Waiting for screen share</div>
                                    <div className="mt-ph-sub">The candidate's screen will appear here once they start sharing</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interviewee cam tile (bottom-left) */}
                    <div className="mt-tile mt-tile-peer">
                        {hasRemoteCam ? (
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
                        <div className="mt-tile-label">Interviewee</div>
                    </div>

                    {/* Interviewer tile (bottom-right) */}
                    <div className="mt-tile mt-tile-self">
                        <video ref={localVideoRef} autoPlay playsInline muted />
                        <div className="mt-tile-label">You (Interviewer)</div>
                    </div>
                </div>

                {/* Right Panel */}
                {panel && (
                    <aside className="mt-side mt-side-enter">
                        <div className="mt-side-head">
                            <div className="mt-side-title">
                                {panel === "participants" ? `Participants (${totalParticipants})` : panel === "chat" ? "Chat" : "Notes"}
                            </div>
                            <button className="mt-side-close" onClick={() => setPanel(null)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-side-body" style={{ padding: panel === "chat" ? 0 : undefined }}>
                            {/* Participants */}
                            {panel === "participants" && (
                                <>
                                    <div className="mt-sec-title">
                                        <span>Interviewing</span>
                                        {interviewing.length > 0 && <span className="mt-sec-badge">{interviewing.length}</span>}
                                    </div>
                                    <div className="mt-card">
                                        {interviewing.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                status="interviewing"
                                                actions={
                                                    <div className="mt-actions">
                                                        <button className="mt-act mt-act-red" title="Reject" onClick={() => rejectCandidate(p.id)}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        </button>
                                                        <button className="mt-act mt-act-green" title="Complete" onClick={() => completeCandidate(p.id)}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                        {interviewing.length === 0 && (
                                            <div className="mt-empty">No one is interviewing right now</div>
                                        )}
                                    </div>

                                    <div className="mt-sec-title" style={{ marginTop: 14 }}>
                                        <span>Waiting Room</span>
                                        {waiting.length > 0 && <span className="mt-sec-badge mt-sec-badge-amber">{waiting.length}</span>}
                                    </div>
                                    <div className="mt-card">
                                        {waiting.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                status="waiting"
                                                actions={
                                                    <div className="mt-actions">
                                                        <button className="mt-act mt-act-red" title="Remove" onClick={() => rejectCandidate(p.id)}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                        </button>
                                                        <button className="mt-act mt-act-green" title="Admit" onClick={() => acceptCandidate(p.id)}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                        </button>
                                                    </div>
                                                }
                                            />
                                        ))}
                                        {waiting.length === 0 && (
                                            <div className="mt-empty">No one is in the waiting room</div>
                                        )}
                                    </div>

                                    <div className="mt-sec-title" style={{ marginTop: 14 }}>
                                        <span>Completed</span>
                                        {completed.length > 0 && <span className="mt-sec-badge mt-sec-badge-green">{completed.length}</span>}
                                    </div>
                                    <div className="mt-card">
                                        {completed.map((p) => (
                                            <ParticipantRow
                                                key={p.id}
                                                name={p.name}
                                                status="completed"
                                                actions={null}
                                            />
                                        ))}
                                        {completed.length === 0 && (
                                            <div className="mt-empty">No completed participants yet</div>
                                        )}
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
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {panel === "notes" && (
                                <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
                                    <div className="nt-topTabs">
                                        <button className={`nt-tab ${notesTab === "remarks" ? "active" : ""}`} onClick={() => setNotesTab("remarks")}>
                                            Remarks
                                        </button>
                                        <button className={`nt-tab ${notesTab === "details" ? "active" : ""}`} onClick={() => setNotesTab("details")}>
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
                                                    Results-driven Software Engineer with 5+ years of experience designing, developing, and maintaining scalable web and backend applications.
                                                    Strong background in full-stack development, cloud technologies, and agile methodologies.
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

            {/* Footer Toolbar */}
            <div className="mt-footer">
                <div className="mt-left">
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
                    <button className={`mt-icon-btn ${camOff ? "mt-icon-off" : ""}`} onClick={toggleCam} title={camOff ? "Turn on camera" : "Turn off camera"}>
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
                </div>

                <div className="mt-mid">
                    {/* Participants */}
                    <button className={`mt-icon-btn ${panel === "participants" ? "mt-icon-active" : ""}`} onClick={() => togglePanel("participants")} title="Participants">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {totalParticipants > 0 && <span className="mt-icon-badge">{totalParticipants}</span>}
                        <span className="mt-icon-label">People</span>
                    </button>

                    {/* Chat */}
                    <button className={`mt-icon-btn ${panel === "chat" ? "mt-icon-active" : ""}`} onClick={() => togglePanel("chat")} title="Chat">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="mt-icon-label">Chat</span>
                    </button>

                    {/* Notes */}
                    <button className={`mt-icon-btn ${panel === "notes" ? "mt-icon-active" : ""}`} onClick={() => togglePanel("notes")} title="Notes">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                        </svg>
                        <span className="mt-icon-label">Notes</span>
                    </button>
                </div>

                <div className="mt-right">
                    <button className="mt-end" onClick={endInterview}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="23" y1="1" x2="1" y2="23" />
                        </svg>
                        <span>End</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ---------- Small UI helpers ---------- */

function ParticipantRow({ name, status, actions }) {
    const initial = (name || "?").trim().slice(0, 1).toUpperCase();
    const statusLabel = status === "interviewing" ? "In session" : status === "waiting" ? "In waiting room" : "Interview done";
    return (
        <div className="mt-p-row">
            <div className={`mt-avatar ${status === "interviewing" ? "mt-avatar-active" : ""}`}>{initial}</div>
            <div>
                <div className="mt-p-name">{name}</div>
                <div className="mt-p-sub">{statusLabel}</div>
            </div>
            {actions}
        </div>
    );
}
