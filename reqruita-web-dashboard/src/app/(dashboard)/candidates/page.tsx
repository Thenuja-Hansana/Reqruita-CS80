"use client";

import { useState } from "react";

interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  stage: "Applied" | "Screening" | "Interview" | "Offer" | "Hired";
  appliedDate: string;
  score: number;
  notes: string;
  interviewStatus?: "Not Started" | "Passed" | "Failed" | "Pending";
  hired: boolean;
}

interface Job {
  id: string;
  title: string;
  position: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      position: "Software Engineer",
      stage: "Applied",
      appliedDate: "Mar 1, 2026",
      score: 85,
      notes: "Strong technical background",
      interviewStatus: "Not Started",
      hired: false,
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      position: "Software Engineer",
      stage: "Interview",
      appliedDate: "Feb 28, 2026",
      score: 90,
      notes: "Excellent problem solver",
      interviewStatus: "Passed",
      hired: false,
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@email.com",
      position: "Software Engineer",
      stage: "Hired",
      appliedDate: "Feb 20, 2026",
      score: 95,
      notes: "Outstanding technical skills",
      interviewStatus: "Passed",
      hired: true,
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.d@email.com",
      position: "Frontend Developer",
      stage: "Applied",
      appliedDate: "Mar 2, 2026",
      score: 80,
      notes: "Good UI/UX understanding",
      interviewStatus: "Not Started",
      hired: false,
    },
    {
      id: 5,
      name: "Alex Martinez",
      email: "alex.m@email.com",
      position: "Frontend Developer",
      stage: "Interview",
      appliedDate: "Feb 25, 2026",
      score: 88,
      notes: "Creative designer",
      interviewStatus: "Passed",
      hired: false,
    },
    {
      id: 6,
      name: "Lisa Wang",
      email: "lisa.wang@email.com",
      position: "Frontend Developer",
      stage: "Hired",
      appliedDate: "Feb 15, 2026",
      score: 92,
      notes: "Exceptional front-end skills",
      interviewStatus: "Passed",
      hired: true,
    },
    {
      id: 7,
      name: "David Brown",
      email: "david.b@email.com",
      position: "DevOps Engineer",
      stage: "Applied",
      appliedDate: "Mar 3, 2026",
      score: 75,
      notes: "Cloud infrastructure experience",
      interviewStatus: "Not Started",
      hired: false,
    },
    {
      id: 8,
      name: "Rachel Green",
      email: "rachel.g@email.com",
      position: "DevOps Engineer",
      stage: "Screening",
      appliedDate: "Feb 27, 2026",
      score: 82,
      notes: "Strong DevOps background",
      interviewStatus: "Pending",
      hired: false,
    },
    {
      id: 9,
      name: "Tom Wilson",
      email: "tom.w@email.com",
      position: "DevOps Engineer",
      stage: "Interview",
      appliedDate: "Feb 22, 2026",
      score: 87,
      notes: "Kubernetes expert",
      interviewStatus: "Passed",
      hired: false,
    },
    {
      id: 10,
      name: "Jessica Lee",
      email: "jessica.lee@email.com",
      position: "Software Engineer",
      stage: "Interview",
      appliedDate: "Feb 26, 2026",
      score: 78,
      notes: "Good fundamentals",
      interviewStatus: "Failed",
      hired: false,
    },
  ]);

  const [jobs] = useState<Job[]>([
    {
      id: "1",
      title: "Senior Software Engineer",
      position: "Software Engineer",
    },
    { id: "2", title: "Frontend Developer", position: "Frontend Developer" },
    { id: "3", title: "DevOps Engineer", position: "DevOps Engineer" },
  ]);

  // Filter states for Container 1
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterStage, setFilterStage] = useState<string>("all");
  const [filterInterviewStatus, setFilterInterviewStatus] =
    useState<string>("all");

  // Expanded job state for Container 2
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [newCandidateName, setNewCandidateName] = useState("");
  const [newCandidateEmail, setNewCandidateEmail] = useState("");
  const [noteText, setNoteText] = useState("");

  const handleAddCandidate = () => {
    if (newCandidateName.trim() && newCandidateEmail.trim()) {
      const newCandidate: Candidate = {
        id: candidates.length + 1,
        name: newCandidateName,
        email: newCandidateEmail,
        position: "Software Engineer",
        stage: "Applied",
        appliedDate: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        score: 50,
        notes: "",
        interviewStatus: "Not Started",
        hired: false,
      };
      setCandidates([...candidates, newCandidate]);
      setNewCandidateName("");
      setNewCandidateEmail("");
      setShowAddModal(false);
      alert("Candidate added successfully!");
    }
  };

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowViewModal(true);
  };

  const handleAddNote = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNoteText(candidate.notes);
    setShowNoteModal(true);
  };

  const handleSaveNote = () => {
    if (selectedCandidate) {
      setCandidates(
        candidates.map((c) =>
          c.id === selectedCandidate.id ? { ...c, notes: noteText } : c,
        ),
      );
      setShowNoteModal(false);
      alert("Note saved successfully!");
    }
  };

  const handleSendInterview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowInterviewModal(true);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      Applied: "bg-blue-100 text-blue-800",
      Screening: "bg-yellow-100 text-yellow-800",
      Interview: "bg-purple-100 text-purple-800",
      Offer: "bg-green-100 text-green-800",
      Hired: "bg-emerald-100 text-emerald-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  // Filter candidates for Container 1
  const getFilteredCandidates = () => {
    let filtered = candidates;

    if (filterPosition !== "all") {
      filtered = filtered.filter((c) => c.position === filterPosition);
    }

    if (filterStage !== "all") {
      filtered = filtered.filter((c) => c.stage === filterStage);
    }

    if (filterInterviewStatus !== "all") {
      filtered = filtered.filter(
        (c) => c.interviewStatus === filterInterviewStatus,
      );
    }

    return filtered;
  };

  // Get candidates by job position
  const getCandidatesByJob = (position: string) => {
    return candidates.filter((c) => c.position === position);
  };

  const topCandidates = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Thursday, November 20</p>
        <h1 className="text-3xl font-bold">Candidates</h1>
      </div>

      {/* Candidates Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            stage: "Applied",
            count: candidates.filter((c) => c.stage === "Applied").length,
          },
          {
            stage: "Screening",
            count: candidates.filter((c) => c.stage === "Screening").length,
          },
          {
            stage: "Interview",
            count: candidates.filter((c) => c.stage === "Interview").length,
          },
          {
            stage: "Offer",
            count: candidates.filter((c) => c.stage === "Offer").length,
          },
          {
            stage: "Hired",
            count: candidates.filter((c) => c.stage === "Hired").length,
          },
        ].map((stage) => (
          <div
            key={stage.stage}
            className="bg-white rounded-2xl border p-6 text-center hover:shadow-md transition"
          >
            <p className="text-gray-600 text-sm mb-2">{stage.stage}</p>
            <p className="text-3xl font-bold bg-blue-100 text-blue-800 inline-block px-4 py-2 rounded-lg">
              {stage.count}
            </p>
          </div>
        ))}
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">All Candidates</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#5D20B3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a1a8a]"
          >
            Add Candidate
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Position
            </label>
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            >
              <option value="all">All Positions</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Stage
            </label>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            >
              <option value="all">All Stages</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Hired">Hired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Filter by Interview Status
            </label>
            <select
              value={filterInterviewStatus}
              onChange={(e) => setFilterInterviewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            >
              <option value="all">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="Pending">Pending</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="py-3 font-medium">Name</th>
              <th className="py-3 font-medium">Email</th>
              <th className="py-3 font-medium">Position</th>
              <th className="py-3 font-medium">Stage</th>
              <th className="py-3 font-medium">Applied Date</th>
              <th className="py-3 font-medium">Score</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {getFilteredCandidates().map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="py-4 font-medium">{candidate.name}</td>
                <td className="py-4">{candidate.email}</td>
                <td className="py-4">{candidate.position}</td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}
                  >
                    {candidate.stage}
                  </span>
                </td>
                <td className="py-4">{candidate.appliedDate}</td>
                <td className="py-4">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#5D20B3] h-2 rounded-full"
                      style={{ width: `${candidate.score}%` }}
                    ></div>
                  </div>
                </td>
                <td className="py-4 flex gap-2">
                  <button
                    onClick={() => handleViewCandidate(candidate)}
                    className="text-[#5D20B3] text-sm hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleAddNote(candidate)}
                    className="text-gray-600 text-sm hover:underline"
                  >
                    Note
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {getFilteredCandidates().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No candidates found matching the selected filters.
          </div>
        )}
      </div>

      {/* Jobs with Candidates Status */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-6">Candidates by Job Position</h2>
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobCandidates = getCandidatesByJob(job.position);
            const appliedCandidates = jobCandidates.filter(
              (c) => !c.hired && c.interviewStatus === "Not Started",
            );
            const passedCandidates = jobCandidates.filter(
              (c) => !c.hired && c.interviewStatus === "Passed",
            );
            const hiredCandidates = jobCandidates.filter((c) => c.hired);
            const isExpanded = expandedJobId === job.id;

            return (
              <div key={job.id} className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
                >
                  <div className="text-left">
                    <h3 className="font-bold text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-600">
                      Total: {jobCandidates.length} candidates • Applied:{" "}
                      {appliedCandidates.length} • Passed:{" "}
                      {passedCandidates.length} • Hired:{" "}
                      {hiredCandidates.length}
                    </p>
                  </div>
                  <svg
                    className={`w-6 h-6 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="p-4 space-y-6">
                    {/* Applied Candidates */}
                    <div>
                      <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                          {appliedCandidates.length}
                        </span>
                        Applied Candidates
                      </h4>
                      {appliedCandidates.length > 0 ? (
                        <div className="space-y-2">
                          {appliedCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex justify-between items-center p-3 bg-blue-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-gray-600">
                                  {candidate.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Applied: {candidate.appliedDate}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}
                                >
                                  {candidate.stage}
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                  Score: {candidate.score}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No candidates currently applied
                        </p>
                      )}
                    </div>

                    {/* Passed Interview Candidates */}
                    <div>
                      <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                          {passedCandidates.length}
                        </span>
                        Passed Interview
                      </h4>
                      {passedCandidates.length > 0 ? (
                        <div className="space-y-2">
                          {passedCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex justify-between items-center p-3 bg-green-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-gray-600">
                                  {candidate.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Applied: {candidate.appliedDate}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(candidate.stage)}`}
                                >
                                  {candidate.stage}
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                  Score: {candidate.score}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No candidates have passed interviews yet
                        </p>
                      )}
                    </div>

                    {/* Hired Candidates */}
                    <div>
                      <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs">
                          {hiredCandidates.length}
                        </span>
                        Hired
                      </h4>
                      {hiredCandidates.length > 0 ? (
                        <div className="space-y-2">
                          {hiredCandidates.map((candidate) => (
                            <div
                              key={candidate.id}
                              className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium">{candidate.name}</p>
                                <p className="text-sm text-gray-600">
                                  {candidate.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Applied: {candidate.appliedDate}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                                  Hired
                                </span>
                                <p className="text-xs text-gray-600 mt-1">
                                  Score: {candidate.score}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          No candidates hired for this position yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add New Candidate</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newCandidateName}
                  onChange={(e) => setNewCandidateName(e.target.value)}
                  placeholder="Candidate name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newCandidateEmail}
                  onChange={(e) => setNewCandidateEmail(e.target.value)}
                  placeholder="candidate@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddCandidate}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Candidate Modal */}
      {showViewModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              {selectedCandidate.name}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedCandidate.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-medium">{selectedCandidate.position}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stage</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStageColor(selectedCandidate.stage)}`}
                >
                  {selectedCandidate.stage}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied Date</p>
                <p className="font-medium">{selectedCandidate.appliedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Match Score</p>
                <p className="font-medium">{selectedCandidate.score}%</p>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="w-full mt-6 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowNoteModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Add Note for {selectedCandidate.name}
            </h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add your notes here..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveNote}
                className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
              >
                Save Note
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Interview Modal */}
      {showInterviewModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowInterviewModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Send Interview Invitation
            </h2>
            <p className="text-gray-600 mb-4">
              Send interview invitation to {selectedCandidate.name}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert(
                    `Interview invitation sent to ${selectedCandidate.name}!`,
                  );
                  setShowInterviewModal(false);
                }}
                className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
              >
                Send
              </button>
              <button
                onClick={() => setShowInterviewModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
