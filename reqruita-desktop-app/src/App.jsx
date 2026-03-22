// src/App.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";

import RoleSelect from "./pages/RoleSelect.jsx";
import Login from "./pages/Login.jsx";
import DeviceCheck from "./pages/DeviceCheck.jsx";

import MeetingInterviewer from "./pages/MeetingInterviewer.jsx";
import MeetingInterviewee from "./pages/MeetingInterviewee.jsx";
import MeetingWorkspace from "./pages/MeetingWorkspace.jsx";
import FeedbackModal from "./components/FeedbackModal.jsx";
import { BACKEND_URL } from "./config";

import ToastContainer from "./components/Toast.jsx";
import useToast from "./hooks/useToast.js";

// Removed hardcoded USERS array

function AppHeader({ isWorkspace, isInterviewer }) {
  const headerClass = isWorkspace
    ? "rq-header-glass"
    : isInterviewer
      ? "rq-header-interviewer"
      : "";

  return (
    <div className={`rq-header ${headerClass}`}>
      <div className="rq-header-logo">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span className="rq-header-title">Reqruita</span>
      </div>
    </div>
  );
}

/**
 * MAIN APPLICATION COMPONENT: App
 * This is the root component for the Desktop Application.
 * It manages the multi-step recruitment workflow from role selection to 
 * the actual interview meeting and workspace.
 */
export default function App() {
  /**
   * STEP-BASED NAVIGATION STATE:
   * Controls which 'page' is currently displayed.
   * Steps: role | login | devices | meeting | workspace | feedback
   */
  const [step, setStep] = useState("role"); 
  
  // role: "join" (Candidate) | "conduct" (Interviewer)
  const [role, setRole] = useState(null); 
  
  // session: Stores the active meeting metadata (meetingId, participant info, etc.)
  const [session, setSession] = useState(null);

  const [feedbackMeta, setFeedbackMeta] = useState({ meetingId: "", candidateId: "" });
  
  // UI Flag for smooth CSS transitions between steps
  const [transitioning, setTransitioning] = useState(false);

  const { toasts, addToast, removeToast } = useToast();


  function readStoredFeedbackMeta() {
    try {
      const raw = window.localStorage.getItem("rq_feedback_meta");
      if (!raw) return { meetingId: "", candidateId: "" };
      const parsed = JSON.parse(raw);
      return {
        meetingId: String(parsed?.meetingId || ""),
        candidateId: String(parsed?.candidateId || ""),
      };
    } catch {
      return { meetingId: "", candidateId: "" };
    }
  }

  function writeStoredFeedbackMeta(meta) {
    try {
      window.localStorage.setItem("rq_feedback_meta", JSON.stringify(meta));
    } catch {
      // Ignore storage failures (private mode / restricted env)
    }
  }

  // Removed legacy users array
  useEffect(() => {
    /**
     * URL-BASED ENTRY GUARDS:
     * Specific steps (like 'workspace' or 'feedback') can be triggered directly 
     * by the Desktop wrapper via window query parameters.
     */
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "workspace") {
      setStep("workspace");
    } else if (params.get("view") === "feedback") {
      setStep("feedback");
      setRole(params.get("role"));
      const storedMeta = readStoredFeedbackMeta();
      setFeedbackMeta({
        meetingId: params.get("meetingId") || storedMeta.meetingId || "",
        candidateId: params.get("candidateId") || storedMeta.candidateId || "",
      });
    }

    // Ensure the window background is transparent (standard for Electron/Desktop overlays)
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  /**
   * PAGE TRANSITION WRAPPER:
   * Adds a brief delay and sets a 'transitioning' flag to allow CSS animations 
   * to play out before the new step is mounted.
   */
  const goTo = useCallback((nextStep) => {
    setTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 180);
  }, []);

  // Resets the app to the initial state (role selection)
  function resetAll() {
    if (window.reqruita && step === "feedback") {
      window.close(); // Close external feedback window if managed by wrapper
      return;
    }
    setStep("role");
    setRole(null);
    setSession(null);
  }

  function onPickRole(nextRole) {
    setRole(nextRole);
    goTo("login");
  }

  function onLogin(payload) {
    const {
      email,
      meetingId,
      role: roleFromLogin,
      participantId,
      name
    } = payload || {};

    const currentRole = roleFromLogin || role;

    setSession({
      role: currentRole,
      email: email,
      meetingId: meetingId,
      participantId: participantId,
      name: name
    });

    addToast("Login successful! Setting up devices…", "success");
    goTo("devices");
    return { ok: true };
  }

  function onDevicesReady() {
    addToast("Devices configured. Joining meeting…", "success");
    goTo("meeting");
  }

  function onEnd(meta = {}) {
    addToast("You left the meeting.", "info");
    const payload = {
      role,
      meetingId: meta.meetingId || session?.meetingId || "",
      candidateId: meta.candidateId || "",
    };

    writeStoredFeedbackMeta(payload);

    // Open the dedicated feedback window and close this one
    if (window.reqruita?.openFeedback) {
      window.reqruita.openFeedback(payload);
    } else {
      // Fallback for browser testing
      setFeedbackMeta({
        meetingId: payload.meetingId,
        candidateId: payload.candidateId,
      });
      goTo("feedback");
    }
  }

  async function onFeedbackSubmit(data) {
    try {
      if (role === "conduct") {
        const payload = {
          meetingId: feedbackMeta.meetingId,
          candidateId: feedbackMeta.candidateId,
          status: data?.status || "",
          feedback: data?.feedback || "",
        };

        const res = await fetch(`${BACKEND_URL}/api/session-feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.error || "Failed to save feedback");
        }

        addToast("Session feedback saved", "success");
        writeStoredFeedbackMeta({ meetingId: "", candidateId: "" });
      }

      if (window.reqruita) {
        window.close(); // Close the feedback pop-up
      } else {
        resetAll();
      }
    } catch (error) {
      console.error("Feedback submit failed:", error);
      addToast(error.message || "Failed to submit feedback", "error");
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {step !== "feedback" && (
        <AppHeader
          isWorkspace={step === "workspace"}
          isInterviewer={step === "meeting" && role === "conduct"}
        />
      )}

      {step === "feedback" && (
        <style>
          {`
            html, body, #root, .rq-page, .fb-overlay {
              background: transparent !important;
            }
            .fb-card {
              background: rgba(255, 255, 255, 0.98) !important;
            }
          `}
        </style>
      )}

      <div className={`rq-page ${transitioning ? "rq-page-exit" : "rq-page-enter"}`}>
        {step === "role" && <RoleSelect onPickRole={onPickRole} />}

        {step === "login" && (
          <Login
            role={role}
            onBack={() => goTo("role")}
            onSuccess={(payload) => {
              onLogin(payload);
            }}
            addToast={addToast}
          />
        )}

        {step === "devices" && (
          <DeviceCheck
            role={role}
            session={session}
            onReady={onDevicesReady}
            onBack={() => goTo("login")}
            addToast={addToast}
          />
        )}

        {step === "meeting" &&
          (role === "conduct" ? (
            <MeetingInterviewer session={session} onEnd={onEnd} addToast={addToast} />
          ) : (
            <MeetingInterviewee session={session} onLeave={onEnd} addToast={addToast} />
          ))}

        {step === "feedback" && (
            <FeedbackModal 
                isOpen={true} 
                role={role} 
                onSubmit={onFeedbackSubmit} 
                onClose={resetAll}
                addToast={addToast}
            />
        )}

        {step === "workspace" && <MeetingWorkspace />}
      </div>
    </>
  );
}
