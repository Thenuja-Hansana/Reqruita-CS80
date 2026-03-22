// src/pages/MeetingInterviewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./auth-ui.css";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";
import { useWebRTC } from "../webrtc/useWebRTC";
import ConfirmationModal from "../components/ConfirmationModal";
import SessionTimer from "../components/SessionTimer";

/**
 * MeetingInterviewer.jsx (FINAL - WebRTC + Participants Panel)
 * ✅ Shows:
 *   - Your local cam preview
 *   - Remote candidate cam (audio + video)
 *   - Remote candidate screen share (big stage)
 * ✅ Keeps:
 *   - Right panel toggles: Participants / Chat / Notes
 *   - Participants list from backend (polling every 2s)
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
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const chatSocketRef = useRef(null);
    const seenIdsRef = useRef(new Set());
    const panelRef = useRef(null);
    const chatListRef = useRef(null);
    const chatEndRef = useRef(null);
    const panelOpenRef = useRef(false);
    useEffect(() => { panelOpenRef.current = (panel === "chat"); }, [panel]);

    // Notes
    const [notesTab, setNotesTab] = useState("remarks"); // remarks | details
    const [remarks, setRemarks] = useState("");

    // Participants state
    const [participants, setParticipants] = useState([]);

    // Modal state
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [isClosingRequest, setIsClosingRequest] = useState(false);

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
    const currentCandidate = interviewing[0];
    const waiting = useMemo(() => participants.filter((p) => p.status === "waiting"), [participants]);
    const completed = useMemo(() => participants.filter((p) => p.status === "completed"), [participants]);

    // Timer source: show session time as soon as candidate joins (waiting/interviewing)
    const timerParticipant = useMemo(() => {
        const withTimer = participants.filter((p) => p.timerStartedAt);
        if (!withTimer.length) return null;
        return [...withTimer].sort((a, b) => new Date(b.timerStartedAt) - new Date(a.timerStartedAt))[0];
    }, [participants]);

    const API_URL = `${BACKEND_URL}/api/participants`;

    // Load remarks for current candidate
    useEffect(() => {
        if (currentCandidate?.id) {
            console.log("Fetching remarks for candidate:", currentCandidate.id);
            fetch(`${BACKEND_URL}/api/remarks/${currentCandidate.id}`)
                .then((res) => {
                    if (!res.ok) throw new Error("Failed to fetch remarks");
                    return res.json();
                })
                .then((data) => {
                    console.log("Loaded remark data:", data);
                    setRemarks(data.remark || "");
                })
                .catch((err) => {
                    console.error("Load remark error:", err);
                    setRemarks("");
                });
        } else {
            setRemarks("");
        }
    }, [currentCandidate?.id]);

    async function saveRemark() {
        if (!currentCandidate) {
            console.error("No candidate selected for saving remarks");
            addToast?.("No candidate selected", "error");
            return;
        }

        const payload = {
            interviewId: meetingId,
            participantId: currentCandidate.id,
            remark: remarks,
        };

        console.log("Saving remark with payload:", payload);

        try {
            const res = await fetch(`${BACKEND_URL}/api/remarks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save");
            addToast?.("Remark saved", "success");
        } catch (err) {
            console.error("Error saving remark:", err);
            addToast?.(`Failed to save remark: ${err.message}`, "error");
        }
    }

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

    // Handle Full Window for Interviewer (Electron)
    useEffect(() => {
        try {
            window.reqruita?.enterInterviewerMode?.();
        } catch (e) {
            // ignore in browser
        }
        return () => {
            try {
                window.reqruita?.exitInterviewMode?.();
            } catch (e) {
                // ignore
            }
        };
    }, []);

    // Listen for Electron close request
    useEffect(() => {
        if (!window.reqruita?.onCloseRequest) return;

        const cleanup = window.reqruita.onCloseRequest(() => {
            setIsClosingRequest(true);
            setShowLeaveConfirm(true);
        });

        return () => cleanup && cleanup();
    }, []);

    // Keep meeting non-scroll
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    // chat socket connection
    useEffect(() => {
        if (!meetingId) return;

        // Create socket connection ONLY for chat
        const socket = io(BACKEND_URL);
        chatSocketRef.current = socket;

        // Join chat room
        socket.emit("join-chat", { interviewId: meetingId });

        // Listen for incoming messages
        socket.on("chat-message", (msg) => {
            const msgId = msg._id || msg.id || `${msg.senderRole}_${msg.message}_${msg.createdAt}`;
            const clientId = msg.clientId;

            if ((clientId && seenIdsRef.current.has(clientId)) || seenIdsRef.current.has(msgId)) return;

            if (clientId) seenIdsRef.current.add(clientId);
            seenIdsRef.current.add(msgId);

            const uiMsg = {
                id: msgId,
                who: msg.senderRole === "interviewer" ? "me" : "them",
                name: msg.senderName || msg.senderRole,
                text: msg.message,
                time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            };
            setMessages((prev) => [...prev, uiMsg]);

            // Notify if from other person and chat isn't open
            if (msg.senderRole !== "interviewer" && !panelOpenRef.current) {
                setUnreadCount((n) => n + 1);
                addToast?.(`${msg.senderName || "Candidate"}: ${msg.message}`, "info");
            }
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
        };
    }, [meetingId]);


    // Auto-scroll chat to bottom on new messages
    useEffect(() => {
        if (chatListRef.current) {
            chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
        }
    }, [messages]);

    // Clear unread count when chat panel is opened
    useEffect(() => {
        if (panel === "chat") setUnreadCount(0);
    }, [panel]);

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

    async function endInterview() {
        setShowLeaveConfirm(true);
    }

    async function handleConfirmLeave() {
        setShowLeaveConfirm(false);
        const endedCandidateId =
            currentCandidate?.id ||
            interviewing[0]?.id ||
            waiting[0]?.id ||
            completed[completed.length - 1]?.id ||
            "";
        
        // Mark current candidate as complete so the session is freed
        if (currentCandidate) {
            try {
                await fetch(`${API_URL}/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: currentCandidate.id }),
                });
            } catch (e) {
                console.error("Failed to mark candidate as complete:", e);
            }
        }

        // Clear chat history for this meeting
        try {
            await fetch(`${BACKEND_URL}/api/chat/${meetingId}`, { method: "DELETE" });
        } catch (e) {
            console.error("Failed to clear chat history:", e);
        }
        
        onEnd?.({ meetingId, candidateId: endedCandidateId });
        
        // If window close was pending, tell Electron to actually close
        if (isClosingRequest) {
            window.reqruita?.confirmClose?.();
        }
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
            if (!res.ok) {
                addToast?.(data.error || "Failed to accept participant", "error");
                return;
            }
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
        if (!text || !chatSocketRef.current) return;

        const tempId = `opt_${Date.now()}`;
        seenIdsRef.current.add(tempId);
        const optimistic = {
            id: tempId,
            who: "me",
            name: "Interviewer",
            text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, optimistic]);

        chatSocketRef.current.emit("chat-message", {
            interviewId: meetingId,
            senderRole: "interviewer",
            senderName: "Interviewer",
            message: text,
            clientId: tempId,
        });

        setChatInput("");
    }

    const hasRemoteCam = !!remoteCamStream;
    const hasRemoteScreen = !!remoteScreenStream;
    const totalParticipants = participants.length;

    // Auto-hide connection status after 3 seconds
    const [showConnStatus, setShowConnStatus] = useState(true);
    useEffect(() => {
        if (hasRemoteCam) {
            setShowConnStatus(true);
            const timer = setTimeout(() => setShowConnStatus(false), 3000);
            return () => clearTimeout(timer);
        } else {
            setShowConnStatus(true);
        }
    }, [hasRemoteCam]);

    return (
        <div className="mt-wrap">
            {error && <div className="mt-err">{error}</div>}

            {/* Top Bar: Connection Status + Session Timer */}
            <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                padding: "12px 16px", 
                background: "linear-gradient(to right, rgba(0,0,0,0.6), rgba(0,0,0,0.4))",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                minHeight: "60px"
            }}>
                {/* Left: Connection Status */}
                <div style={{ flex: 1 }}>
                    {showConnStatus && (
                        <div className="mt-conn-status" style={{ margin: 0 }}>
                            <span className={`mt-conn-dot ${hasRemoteCam ? "mt-conn-on" : "mt-conn-pulse"}`} />
                            <span className="mt-conn-text">
                                {hasRemoteCam ? "Candidate connected" : "Waiting for candidate…"}
                            </span>
                            <span className="mt-conn-id">Meeting: {meetingId || "—"}</span>
                        </div>
                    )}
                </div>
                
                <div style={{ width: 1 }} />
            </div>

            {/* Stage + Right Panel */}
            <div className={`mt-mainrow ${panel ? "withSide" : ""}`}>
                {/* Main Stage */}
                <div className={`mt-stage ${hasRemoteScreen ? "mt-sharing-active" : ""}`}>
                    {/* Main shared screen (remote screen share) */}
                    <div className="mt-share">
                        {/* Always mount video to prevent re-mounting blink */}
                        <video 
                            ref={remoteScreenRef} 
                            autoPlay 
                            playsInline 
                            muted={false} 
                            style={{ 
                                display: hasRemoteScreen ? 'block' : 'none',
                                background: '#000' 
                            }} 
                        />
                        
                        {!hasRemoteScreen && (
                            <div className="mt-share-placeholder">
                                <div className="mt-ph-content">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 drop-shadow-sm">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                        <line x1="8" y1="21" x2="16" y2="21" />
                                        <line x1="12" y1="17" x2="12" y2="21" />
                                    </svg>
                                    <div className="mt-ph-title">Waiting for session</div>
                                    <div className="mt-ph-sub">Candidate screen share will appear here.</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Interviewee cam tile (bottom-left) */}
                    <div className="mt-tile mt-tile-peer">
                        {/* Keep video element stable to prevent blinking */}
                        <video 
                            ref={remoteCamRef} 
                            autoPlay 
                            playsInline 
                            muted={false} 
                            style={{ display: hasRemoteCam ? 'block' : 'none' }}
                        />
                        
                        {!hasRemoteCam && (
                            <div className="mt-tile-ph">
                                <div className="mt-tile-ph-avatar mt-tile-ph-pulse">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </div>
                                <span className="mt-tile-ph-text" style={{ color: '#94a3b8' }}>Connecting…</span>
                            </div>
                        )}
                        <div className="mt-tile-label">Candidate</div>
                    </div>

                    {/* Interviewer tile (bottom-right) */}
                    <div className="mt-tile mt-tile-self">
                        <video ref={localVideoRef} autoPlay playsInline muted />
                        <div className="mt-tile-label">You</div>
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
                                    <div className="mt-chat-list" ref={chatListRef}>
                                        {messages.map((m) => (
                                            <div key={m.id} className={`mt-msg ${m.who}`}>
                                                <div className="mt-msgmeta">
                                                    <span>{m.name}</span>
                                                    <span>{m.time}</span>
                                                </div>
                                                <div className="mt-bubble">{m.text}</div>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
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
                                <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
                                    <div className="nt-topTabs">
                                        <button className={`nt-tab ${notesTab === "remarks" ? "active" : ""}`} onClick={() => setNotesTab("remarks")}>
                                            Remarks
                                        </button>
                                    </div>

                                    <div className="nt-interviewerRow">
                                        <div className="nt-pillRow">
                                            {currentCandidate ? (
                                                <div className="nt-namePill">
                                                    <div className="nt-avatarSm">{(currentCandidate.name || "?")[0]}</div>
                                                    {currentCandidate.name}
                                                </div>
                                            ) : (
                                                <div className="nt-namePill" style={{ opacity: 0.6 }}>
                                                    No ongoing session
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="nt-body">
                                        {notesTab === "remarks" && (
                                            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                                                <textarea
                                                    className="nt-textarea"
                                                    value={remarks}
                                                    onChange={(e) => setRemarks(e.target.value)}
                                                    placeholder={currentCandidate ? `Write remarks for ${currentCandidate.name}…` : "Admit a candidate first…"}
                                                    disabled={!currentCandidate}
                                                />
                                                <button
                                                    className="rq-btn-primary"
                                                    style={{ marginTop: 12, width: '100%', padding: '12px' }}
                                                    onClick={saveRemark}
                                                    disabled={!currentCandidate || !remarks.trim()}
                                                >
                                                    Save Remark
                                                </button>
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
                    <button className={`mt-icon-btn ${panel === "chat" ? "mt-icon-active" : ""}`} onClick={() => setPanel(panel === "chat" ? null : "chat")} title="Chat" style={{ position: 'relative' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {unreadCount > 0 && panel !== "chat" && (
                            <span className="mt-icon-badge" style={{ background: '#ef4444' }}>{unreadCount}</span>
                        )}
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
                    <SessionTimer
                        timerStartedAt={timerParticipant?.timerStartedAt}
                        isActive={true}
                        compact={true}
                    />
                    <button className="mt-end" onClick={endInterview}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                            <line x1="23" y1="1" x2="1" y2="23" />
                        </svg>
                        <span>End</span>
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showLeaveConfirm}
                title="End Interview?"
                message="Are you sure you want to end this interview session? This will complete the current candidate's evaluation."
                confirmText="End Overall"
                cancelText="Not Yet"
                onConfirm={handleConfirmLeave}
                onCancel={() => setShowLeaveConfirm(false)}
                variant="danger"
            />
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
            <div style={{ minWidth: 0 }}>
                <div className="mt-p-name">{name}</div>
                <div className="mt-p-sub">{statusLabel}</div>
            </div>
            {actions}
        </div>
    );
}

