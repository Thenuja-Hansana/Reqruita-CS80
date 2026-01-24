// src/App.jsx
import React, { useMemo, useState, useEffect } from "react";

import RoleSelect from "./pages/RoleSelect.jsx";
import Login from "./pages/Login.jsx";
import DeviceCheck from "./pages/DeviceCheck.jsx";

import MeetingInterviewer from "./pages/MeetingInterviewer.jsx";
import MeetingInterviewee from "./pages/MeetingInterviewee.jsx";

//TEMP hardcoded credentials 

const USERS = [
  {
    role: "join", // Interviewee (Candidate) joins interview
    email: "candi@com.com",
    meetingId: "wuo12333",
    password: "8d3#223",
  },
  {
    role: "conduct", // Interviewer conducts interview
    email: "work@crn.com",
    meetingId: "wuo12333",
    password: "8d3#223",
  },
];

//keep "id" as email for now to avoid heavy changes in Login.jsx

function onLogin({ id, meetingId, password, role: roleFromLogin }) {
  const email = (id || "").trim().toLowerCase();
  const mId = (meetingId || "").trim();
  const currentRole = roleFromLogin || role;

  const found = users.find(
    (u) =>
      u.role === currentRole &&
      u.email.toLowerCase() === email &&
      u.meetingId === mId &&
      u.password === password
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

