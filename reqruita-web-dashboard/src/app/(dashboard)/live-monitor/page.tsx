"use client";

import { useState } from "react";

interface LiveSession {
  id: number;
  candidate: string;
  position: string;
  interviewer: string;
  duration: string;
}

interface Recording {
  id: number;
  title: string;
  dateTime: string;
}

export default function LiveMonitorPage() {
  const [liveSessions] = useState<LiveSession[]>([
    {
      id: 1,
      candidate: "Jane Candidate 1",
      position: "Software Engineer",
      interviewer: "Mike Johnson",
      duration: "15 min 23 sec",
    },
    {
      id: 2,
      candidate: "Jane Candidate 2",
      position: "Software Engineer",
      interviewer: "Sarah Manager",
      duration: "12 min 45 sec",
    },
    {
      id: 3,
      candidate: "Jane Candidate 3",
      position: "Software Engineer",
      interviewer: "Tom Recruiter",
      duration: "18 min 10 sec",
    },
    {
      id: 4,
      candidate: "Jane Candidate 4",
      position: "Software Engineer",
      interviewer: "Lisa HR",
      duration: "14 min 32 sec",
    },
  ]);

  const [recordings] = useState<Recording[]>([
    {
      id: 1,
      title: "Session Recording 1",
      dateTime: "Nov 20, 2:15 PM - 3:00 PM",
    },
    {
      id: 2,
      title: "Session Recording 2",
      dateTime: "Nov 19, 2:15 PM - 3:00 PM",
    },
    {
      id: 3,
      title: "Session Recording 3",
      dateTime: "Nov 18, 2:15 PM - 3:00 PM",
    },
    {
      id: 4,
      title: "Session Recording 4",
      dateTime: "Nov 17, 2:15 PM - 3:00 PM",
    },
    {
      id: 5,
      title: "Session Recording 5",
      dateTime: "Nov 16, 2:15 PM - 3:00 PM",
    },
  ]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(
    null,
  );

  const handleViewDetails = (session: LiveSession) => {
    setSelectedSession(session);
    setShowDetailsModal(true);
  };

  const handleDownload = (recording: Recording) => {
    alert(`Downloaded ${recording.title}. File: recording_${recording.id}.mp4`);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Thursday, November 20</p>
        <h1 className="text-3xl font-bold">Live Monitor</h1>
      </div>

      {/* Live Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {liveSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition"
          >
            <div className="bg-gradient-to-r from-[#5D20B3] to-purple-700 h-32 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-sm opacity-80">Session {session.id}</p>
                <p className="text-lg font-bold">Live Interview</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{session.candidate}</h3>
                  <p className="text-gray-600 text-sm">{session.position}</p>
                </div>
                <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                  LIVE
                </span>
              </div>
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <p>Interviewer: {session.interviewer}</p>
                <p>Duration: {session.duration}</p>
              </div>
              <button
                onClick={() => handleViewDetails(session)}
                className="w-full bg-[#5D20B3] text-white py-2 rounded-lg hover:bg-[#4a1a8a] font-medium"
              >
                View Session Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Active Sessions",
            value: liveSessions.length.toString(),
            color: "bg-blue-100 text-blue-800",
          },
          {
            label: "Total Today",
            value: "8",
            color: "bg-green-100 text-green-800",
          },
          {
            label: "Avg. Duration",
            value: "42 min",
            color: "bg-purple-100 text-purple-800",
          },
          {
            label: "Completion Rate",
            value: "95%",
            color: "bg-orange-100 text-orange-800",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border p-6">
            <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
            <p
              className={`text-3xl font-bold ${stat.color} inline-block px-3 py-1 rounded-lg`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recording Status */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-6">Session Recordings</h2>
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold">
                  ●
                </div>
                <div>
                  <h3 className="font-bold">{recording.title}</h3>
                  <p className="text-gray-600 text-sm">{recording.dateTime}</p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(recording)}
                className="text-[#5D20B3] text-sm font-medium hover:underline"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Session Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Candidate</p>
                <p className="font-medium">{selectedSession.candidate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium">{selectedSession.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interviewer</p>
                <p className="font-medium">{selectedSession.interviewer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Duration</p>
                <p className="font-medium">{selectedSession.duration}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                  <span className="font-medium">Live</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
