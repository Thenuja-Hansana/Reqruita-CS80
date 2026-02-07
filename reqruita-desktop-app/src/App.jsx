// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";

import RoleSelect from "./pages/RoleSelect.jsx";
import Login from "./pages/Login.jsx";
import DeviceCheck from "./pages/DeviceCheck.jsx";

import MeetingInterviewer from "./pages/MeetingInterviewer.jsx";
import MeetingInterviewee from "./pages/MeetingInterviewee.jsx";

// TEMP hardcoded credentials
const USERS = [
  {
    role: "join", // Interviewee (Candidate) joins interview
    email: "123",
    meetingId: "123",
    password: "123",
  },
  {
    role: "conduct", // Interviewer conducts interview
    email: "123",
    meetingId: "123",
    password: "123",
  },
];

export default function App() {
  const [step, setStep] = useState("role"); // role | login | devices | meeting
  const [role, setRole] = useState(null); // "join" | "conduct"
  const [session, setSession] = useState(null);

  const users = useMemo(() => USERS, []);

  useEffect(() => {
    document.documentElement.style.background = "#fff";
    document.body.style.background = "#fff";
  }, []);

  function resetAll() {
    setStep("role");
    setRole(null);
    setSession(null);
  }

  function onPickRole(nextRole) {
    setRole(nextRole);
    setStep("login");
  }

  // Accept BOTH shapes:
  // - { id, meetingId, password, role }
  // - { email, meetingId, password, role }
  function onLogin(payload) {
    const {
      id,
      email,
      meetingId,
      password,
      role: roleFromLogin,
    } = payload || {};

    const em = (id || email || "").trim().toLowerCase();
    const mId = (meetingId || "").trim();
    const pwd = (password || "").trim();
    const currentRole = roleFromLogin || role;

    if (!em || !mId || !pwd || !currentRole) {
      return { ok: false, error: "Please enter Email, Meeting ID, and Password." };
    }

    const found = users.find(
      (u) =>
        u.role === currentRole &&
        u.email.toLowerCase() === em &&
        u.meetingId === mId &&
        u.password === pwd
    );

    if (!found) {
      return { ok: false, error: "Invalid Email, Meeting ID, or Password." };
    }

    setSession({
      role: found.role,
      email: found.email,
      meetingId: found.meetingId,
    });

    setStep("devices");
    return { ok: true };
  }

  function onDevicesReady() {
    setStep("meeting");
  }

  function onEnd() {
    resetAll();
  }

  return (
    <>
      {step === "role" && <RoleSelect onPickRole={onPickRole} />}

      {step === "login" && (
        <Login
          role={role}
          onSuccess={(payload) => {
            // alert(JSON.stringify(payload, null, 2)); 
            const res = onLogin(payload);
            if (!res.ok) alert(res.error);
          }}
        />
      )}

      {step === "devices" && (
        <DeviceCheck
          role={role}
          session={session}
          onReady={onDevicesReady}
          onBack={() => setStep("login")}
        />
      )}

      {step === "meeting" &&
        (role === "conduct" ? (
          <MeetingInterviewer session={session} onEnd={onEnd} />
        ) : (
          <MeetingInterviewee session={session} onLeave={onEnd} />
        ))}
    </>
  );
}
