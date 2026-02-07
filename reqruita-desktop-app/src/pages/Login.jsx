import React, { useEffect, useState } from "react";
import "./auth-ui.css";

// Default credentials
const CREDS = {
    join: {
        email: "123",
        meetingId: "123",
        password: "123",
    },
    conduct: {
        email: "123",
        meetingId: "123",
        password: "123",
    },
};

export default function Login({ role, onBack, onSuccess }) {
    const [email, setEmail] = useState("");
    const [meetingId, setMeetingId] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(true);
    const [err, setErr] = useState("");

    // Disable scrolling only on this screen
    useEffect(() => {
        document.body.classList.add("rq-noscr");
        return () => document.body.classList.remove("rq-noscr");
    }, []);

    function submit(e) {
        e.preventDefault();
        setErr("");

        const r = CREDS[role];
        if (!r) {
            setErr("Unknown role.");
            return;
        }

        const ok =
            email.trim().toLowerCase() === r.email.toLowerCase() &&
            meetingId.trim() === r.meetingId &&
            password === r.password;

        if (!ok) {
            setErr("Invalid credentials. Please check Email, Meeting ID, and Password.");
            return;
        }

        // Move to next stage (DeviceCheck)
        onSuccess?.({
            role,
            email: email.trim(),
            meetingId: meetingId.trim(),
            password: password.trim(),   // ✅ add this
            remember
        });
    }

    const title = role === "join" ? "Join interview" : "Conduct interview";

    return (
        <div className="lg-wrap">
            <div className="lg-card">
                <h2 className="lg-title">{title}</h2>

                <form onSubmit={submit}>
                    <div className="lg-field">
                        <div className="lg-label">Email</div>
                        <input
                            className="lg-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={role === "join" ? "candi@com.com" : "work@crn.com"}
                            autoComplete="username"
                        />
                    </div>

                    <div className="lg-field">
                        <div className="lg-label">Meeting Id</div>
                        <input
                            className="lg-input"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                            placeholder="wuo12333"
                        />
                    </div>

                    <div className="lg-field">
                        <div className="lg-label">Password</div>
                        <input
                            className="lg-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8d3#223"
                            type="password"
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="lg-row">
                        <label className="lg-check">
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            Remember me
                        </label>

                        <a className="lg-link" href="#" onClick={(e) => e.preventDefault()}>
                            Forgot Password?
                        </a>
                    </div>

                    {err && <div className="lg-err">{err}</div>}

                    <button className="lg-primary" type="submit">
                        Join Now
                    </button>

                    {onBack && (
                        <div style={{ marginTop: 10 }}>
                            <button type="button" className="rs-btn" onClick={onBack}>
                                Back
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
