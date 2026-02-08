import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { BACKEND_URL } from "../config";

const RTC_CONFIG = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" }, // ok for MVP
    ],
};

export function useWebRTC({ meetingId, role }) {
    const socketRef = useRef(null);
    const pcRef = useRef(null);
    const peerIdRef = useRef(null);

    const [localCamStream, setLocalCamStream] = useState(null);
    const [localScreenStream, setLocalScreenStream] = useState(null);

    const [remoteCamStream, setRemoteCamStream] = useState(null);
    const [remoteScreenStream, setRemoteScreenStream] = useState(null);

    const screenSenderRef = useRef(null);

    // helper: pick first stream as cam, second as screen
    const assignRemoteStream = (stream) => {
        setRemoteCamStream((curCam) => {
            if (!curCam) return stream;
            if (curCam.id === stream.id) return curCam;
            setRemoteScreenStream((curScreen) => (curScreen?.id === stream.id ? curScreen : stream));
            return curCam;
        });
    };

    useEffect(() => {
        let mounted = true;

        async function start() {
            // 1) socket
            const socket = io(BACKEND_URL, { transports: ["websocket"] });
            socketRef.current = socket;

            // 2) peer connection
            const pc = new RTCPeerConnection(RTC_CONFIG);
            pcRef.current = pc;

            // send ICE candidates to peer
            pc.onicecandidate = (e) => {
                if (e.candidate) {
                    socket.emit("webrtc-signal", {
                        meetingId,
                        to: peerIdRef.current,
                        data: { type: "ice", candidate: e.candidate },
                    });
                }
            };

            // receive remote tracks
            pc.ontrack = (e) => {
                const stream = e.streams?.[0];
                if (stream) assignRemoteStream(stream);
            };

            // only the interviewer will initiate offers
            pc.onnegotiationneeded = async () => {
                if (role !== "interviewer") return;
                if (!peerIdRef.current) return;

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("webrtc-signal", {
                    meetingId,
                    to: peerIdRef.current,
                    data: { type: "offer", sdp: pc.localDescription },
                });
            };

            // 3) local camera+mic
            const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!mounted) return;
            setLocalCamStream(cam);

            // add tracks to pc
            for (const track of cam.getTracks()) pc.addTrack(track, cam);

            // 4) signaling handlers
            socket.on("peer-joined", async ({ peerId }) => {
                peerIdRef.current = peerId;

                // interviewer will auto-create offer via negotiationneeded
                if (role === "interviewer") {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socket.emit("webrtc-signal", {
                        meetingId,
                        to: peerId,
                        data: { type: "offer", sdp: pc.localDescription },
                    });
                }
            });

            socket.on("peer-left", () => {
                peerIdRef.current = null;
                setRemoteCamStream(null);
                setRemoteScreenStream(null);
            });

            socket.on("webrtc-signal", async ({ from, data }) => {
                peerIdRef.current = from;

                if (data.type === "offer") {
                    await pc.setRemoteDescription(data.sdp);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socket.emit("webrtc-signal", {
                        meetingId,
                        to: from,
                        data: { type: "answer", sdp: pc.localDescription },
                    });
                }

                if (data.type === "answer") {
                    await pc.setRemoteDescription(data.sdp);
                }

                if (data.type === "ice" && data.candidate) {
                    try {
                        await pc.addIceCandidate(data.candidate);
                    } catch (err) {
                        console.error("ICE add failed", err);
                    }
                }
            });

            // 5) join room
            socket.emit("join-meeting", { meetingId, role });
        }

        start().catch(console.error);

        return () => {
            mounted = false;
            try {
                socketRef.current?.disconnect();
            } catch { }
            try {
                pcRef.current?.close();
            } catch { }

            // stop local media
            for (const s of [localCamStream, localScreenStream]) {
                if (s) s.getTracks().forEach((t) => t.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetingId, role]);

    async function startScreenShare() {
        const pc = pcRef.current;
        if (!pc) return;

        const scr = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        setLocalScreenStream(scr);

        const screenTrack = scr.getVideoTracks()[0];
        screenTrack.onended = () => stopScreenShare();

        // add as separate stream so remote can treat it as “screen”
        screenSenderRef.current = pc.addTrack(screenTrack, scr);
        // renegotiation: interviewer is initiator so it will handle offer; if candidate adds, we still need renegotiate:
        // easiest: manually trigger negotiation by creating offer if interviewer; else send a "negotiationneeded" by creating offer is complex.
        // BUT in our setup interviewer initiates. So: candidate adding a track must ask interviewer to renegotiate:
        socketRef.current?.emit("webrtc-signal", { meetingId, to: peerIdRef.current, data: { type: "renegotiate" } });
    }

    async function stopScreenShare() {
        const pc = pcRef.current;
        const sender = screenSenderRef.current;

        if (sender && pc) {
            try { pc.removeTrack(sender); } catch { }
        }
        screenSenderRef.current = null;

        if (localScreenStream) {
            localScreenStream.getTracks().forEach((t) => t.stop());
            setLocalScreenStream(null);
        }
        socketRef.current?.emit("webrtc-signal", { meetingId, to: peerIdRef.current, data: { type: "renegotiate" } });
    }

    // handle renegotiate request: interviewer will re-offer
    useEffect(() => {
        const socket = socketRef.current;
        const pc = pcRef.current;
        if (!socket || !pc) return;

        const handler = async ({ from, data }) => {
            if (data?.type !== "renegotiate") return;
            if (role !== "interviewer") return;

            peerIdRef.current = from;
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("webrtc-signal", {
                meetingId,
                to: from,
                data: { type: "offer", sdp: pc.localDescription },
            });
        };

        socket.on("webrtc-signal", handler);
        return () => socket.off("webrtc-signal", handler);
    }, [meetingId, role]);

    function setMicEnabled(enabled) {
        if (!localCamStream) return;
        localCamStream.getAudioTracks().forEach((t) => (t.enabled = enabled));
    }

    function setCamEnabled(enabled) {
        if (!localCamStream) return;
        localCamStream.getVideoTracks().forEach((t) => (t.enabled = enabled));
    }

    return {
        localCamStream,
        localScreenStream,
        remoteCamStream,
        remoteScreenStream,
        startScreenShare,
        stopScreenShare,
        setMicEnabled,
        setCamEnabled,
    };
}
