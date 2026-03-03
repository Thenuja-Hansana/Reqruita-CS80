"use client";

import { useState } from "react";

interface Job {
  id: string;
  title: string;
  position: string;
  appliedCandidates: number;
}

interface Candidate {
  id: number;
  name: string;
  email: string;
  position: string;
  appliedDate: string;
  status:
    | "Applied"
    | "Assigned"
    | "Interviewed"
    | "Passed"
    | "Failed"
    | "On Hold";
  sessionStatus?:
    | "Passed"
    | "Failed"
    | "On Hold"
    | "Not Completed"
    | "Did Not Attend";
}

interface Assignment {
  id: number;
  candidateName: string;
  candidateId: number;
  jobPosition: string;
  assignedInterviewer: string;
  deadline: string;
  requirements: string;
  remarks: string;
}

interface AssignedToInterviewer {
  id: number;
  candidateName: string;
  jobPosition: string;
  interviewDate: string;
  interviewTime: string;
  requirements: string;
  remarks: string;
  candidateEmail: string;
}

interface PastInterview {
  id: number;
  candidateName: string;
  jobPosition: string;
  interviewDate: string;
  remarks: string;
  grade: "Pass" | "Fail" | "Next Stage" | "On Hold";
}

export default function SessionsPage() {
  // Container 1: Jobs
  const [jobs] = useState<Job[]>([
    {
      id: "JOB-001",
      title: "Senior Software Engineer",
      position: "Software Engineer",
      appliedCandidates: 8,
    },
    {
      id: "JOB-002",
      title: "Frontend Developer",
      position: "Frontend Developer",
      appliedCandidates: 6,
    },
    {
      id: "JOB-003",
      title: "DevOps Engineer",
      position: "DevOps Engineer",
      appliedCandidates: 4,
    },
    {
      id: "JOB-004",
      title: "UI/UX Designer",
      position: "Designer",
      appliedCandidates: 5,
    },
  ]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobFilterStatus, setJobFilterStatus] = useState<
    "all" | "passed" | "failed" | "on_hold" | "not_completed"
  >("all");

  // Container 2: Applied Candidates
  const [appliedCandidates, setAppliedCandidates] = useState<Candidate[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john@example.com",
      position: "Software Engineer",
      appliedDate: "Mar 1, 2026",
      status: "Applied",
      sessionStatus: "Passed",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane@example.com",
      position: "Software Engineer",
      appliedDate: "Mar 2, 2026",
      status: "Applied",
      sessionStatus: "Failed",
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      position: "Frontend Developer",
      appliedDate: "Mar 2, 2026",
      status: "Applied",
      sessionStatus: "Not Completed",
    },
    {
      id: 4,
      name: "Alice Brown",
      email: "alice@example.com",
      position: "Software Engineer",
      appliedDate: "Feb 28, 2026",
      status: "Assigned",
      sessionStatus: "On Hold",
    },
    {
      id: 5,
      name: "Mike Davis",
      email: "mike@example.com",
      position: "DevOps Engineer",
      appliedDate: "Feb 25, 2026",
      status: "Applied",
      sessionStatus: "Did Not Attend",
    },
    {
      id: 6,
      name: "Sarah Wilson",
      email: "sarah@example.com",
      position: "Frontend Developer",
      appliedDate: "Feb 20, 2026",
      status: "Applied",
      sessionStatus: "Passed",
    },
  ]);

  // Filter candidates based on selected job position and session result status
  const getFilteredCandidates = () => {
    let filtered = appliedCandidates;

    // Filter by job position
    if (selectedJob) {
      filtered = filtered.filter(
        (candidate) => candidate.position === selectedJob.position,
      );
    }

    // Filter by session result status
    if (jobFilterStatus && jobFilterStatus !== "all") {
      // Convert filter value to proper format
      const statusMap: { [key: string]: string } = {
        passed: "Passed",
        failed: "Failed",
        on_hold: "On Hold",
        not_completed: "Not Completed",
        did_not_attend: "Did Not Attend",
      };
      const mappedStatus = statusMap[jobFilterStatus];
      filtered = filtered.filter(
        (candidate) => candidate.sessionStatus === mappedStatus,
      );
    }

    return filtered;
  };

  const filteredCandidates = getFilteredCandidates();

  // Filter past interviews based on selected position and grade
  const getFilteredPastInterviews = () => {
    let filtered = pastInterviews;

    // Filter by job position
    if (pastInterviewJobFilter) {
      filtered = filtered.filter(
        (interview) => interview.jobPosition === pastInterviewJobFilter,
      );
    }

    // Filter by grade
    if (pastInterviewGradeFilter && pastInterviewGradeFilter !== "all") {
      filtered = filtered.filter(
        (interview) => interview.grade === pastInterviewGradeFilter,
      );
    }

    return filtered;
  };

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [assignInterviewer, setAssignInterviewer] = useState("");
  const [assignDeadline, setAssignDeadline] = useState("");
  const [assignRequirements, setAssignRequirements] = useState("");
  const [assignRemarks, setAssignRemarks] = useState("");

  // Container 3: Assigned to Interviewer
  const [assignedToInterviewer, setAssignedToInterviewer] = useState<
    AssignedToInterviewer[]
  >([
    {
      id: 1,
      candidateName: "Alice Brown",
      jobPosition: "Software Engineer",
      interviewDate: "",
      interviewTime: "",
      requirements: "Must have 5+ years experience",
      remarks: "Strong technical background",
      candidateEmail: "alice@example.com",
    },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAssigned, setSelectedAssigned] =
    useState<AssignedToInterviewer | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Container 4: Past Interviews
  const [pastInterviews] = useState<PastInterview[]>([
    {
      id: 1,
      candidateName: "Michael Davis",
      jobPosition: "Software Engineer",
      interviewDate: "Feb 25, 2026",
      remarks: "Good technical skills, needs improvement in communication",
      grade: "Next Stage",
    },
    {
      id: 2,
      candidateName: "Sarah Wilson",
      jobPosition: "Frontend Developer",
      interviewDate: "Feb 20, 2026",
      remarks: "Excellent problem-solving skills",
      grade: "Pass",
    },
    {
      id: 3,
      candidateName: "Tom Hardy",
      jobPosition: "DevOps Engineer",
      interviewDate: "Feb 15, 2026",
      remarks: "Limited experience in cloud technologies",
      grade: "Fail",
    },
    {
      id: 4,
      candidateName: "Linda Chen",
      jobPosition: "Software Engineer",
      interviewDate: "Feb 18, 2026",
      remarks: "Strong problem-solving, good communication skills",
      grade: "Pass",
    },
    {
      id: 5,
      candidateName: "James Wilson",
      jobPosition: "Frontend Developer",
      interviewDate: "Feb 12, 2026",
      remarks: "Needs more experience with modern frameworks",
      grade: "On Hold",
    },
    {
      id: 6,
      candidateName: "Daniel Park",
      jobPosition: "DevOps Engineer",
      interviewDate: "Feb 8, 2026",
      remarks: "Excellent infrastructure knowledge",
      grade: "Pass",
    },
  ]);

  // Filter states for Past Interviews
  const [pastInterviewJobFilter, setPastInterviewJobFilter] = useState<
    string | null
  >(null);
  const [pastInterviewGradeFilter, setPastInterviewGradeFilter] =
    useState<string>("all");

  const handleAssignCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedCandidate && assignInterviewer && assignDeadline) {
      const newAssignment: AssignedToInterviewer = {
        id: assignedToInterviewer.length + 1,
        candidateName: selectedCandidate.name,
        jobPosition: selectedCandidate.position,
        interviewDate: "",
        interviewTime: "",
        requirements: assignRequirements,
        remarks: assignRemarks,
        candidateEmail: selectedCandidate.email,
      };
      setAssignedToInterviewer([...assignedToInterviewer, newAssignment]);
      setAppliedCandidates(
        appliedCandidates.map((c) =>
          c.id === selectedCandidate.id ? { ...c, status: "Assigned" } : c,
        ),
      );
      setShowAssignModal(false);
      setAssignInterviewer("");
      setAssignDeadline("");
      setAssignRequirements("");
      setAssignRemarks("");
      alert(`${selectedCandidate.name} assigned to ${assignInterviewer}!`);
    }
  };

  const handleScheduleInterview = (assigned: AssignedToInterviewer) => {
    setSelectedAssigned(assigned);
    setScheduleDate(assigned.interviewDate);
    setScheduleTime(assigned.interviewTime);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedAssigned && scheduleDate && scheduleTime) {
      setAssignedToInterviewer(
        assignedToInterviewer.map((a) =>
          a.id === selectedAssigned.id
            ? { ...a, interviewDate: scheduleDate, interviewTime: scheduleTime }
            : a,
        ),
      );
      setShowScheduleModal(false);
      alert(
        `Interview scheduled for ${selectedAssigned.candidateName}! Email invitation sent.`,
      );
    }
  };

  const getJobCandidates = (jobId: string) => {
    // Filter candidates by job position based on selected job
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return [];
    return appliedCandidates.filter((c) => c.position === job.position);
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      Pass: "bg-green-100 text-green-800",
      Fail: "bg-red-100 text-red-800",
      "Next Stage": "bg-blue-100 text-blue-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Monday, March 3, 2026</p>
        <h1 className="text-3xl font-bold">Interview Sessions</h1>
      </div>

      {/* CONTAINER 1: Jobs with Applied Candidates & Session History */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Applied Candidates</h2>

          {/* Job Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">
              Filter by Position:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedJob(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedJob === null
                    ? "bg-[#5D20B3] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Positions
              </button>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() =>
                    setSelectedJob(selectedJob?.id === job.id ? null : job)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    selectedJob?.id === job.id
                      ? "bg-[#5D20B3] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {job.position} ({job.appliedCandidates})
                </button>
              ))}
            </div>
          </div>

          {/* Session Result Filter */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-600">
              Interview Session Result:
            </p>
            <select
              value={jobFilterStatus}
              onChange={(e) => setJobFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            >
              <option value="all">All Candidates</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="on_hold">On Hold</option>
              <option value="not_completed">Not Completed</option>
              <option value="did_not_attend">Did Not Attend</option>
            </select>
          </div>
        </div>

        {/* Applied Candidates Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Position</th>
                <th className="py-3 font-medium">Applied Date</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Session Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {getFilteredCandidates().map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="py-4 font-medium">{candidate.name}</td>
                  <td className="py-4 text-gray-600">{candidate.email}</td>
                  <td className="py-4">{candidate.position}</td>
                  <td className="py-4 text-gray-600">
                    {candidate.appliedDate}
                  </td>
                  <td className="py-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-xs text-gray-600">
                      {candidate.sessionStatus || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {getFilteredCandidates().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No candidates found for the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* CONTAINER 2: Applied Candidates - Admin Assignment */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-6">
          Applied Candidates (Admin Assignment)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Position</th>
                <th className="py-3 font-medium">Applied Date</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {appliedCandidates
                .filter((c) => c.status === "Applied")
                .map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-gray-50">
                    <td className="py-4 font-medium">{candidate.name}</td>
                    <td className="py-4">{candidate.position}</td>
                    <td className="py-4 text-gray-600">
                      {candidate.appliedDate}
                    </td>
                    <td className="py-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        Applied
                      </span>
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => handleAssignCandidate(candidate)}
                        className="bg-[#5D20B3] text-white px-3 py-1 rounded text-xs hover:bg-[#4a1a8a]"
                      >
                        Assign to Interviewer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONTAINER 3: Assigned to Interviewer - Schedule Interviews */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-6">
          Assigned Candidates (Interviewer View)
        </h2>
        <div className="space-y-4">
          {assignedToInterviewer.map((assigned) => (
            <div
              key={assigned.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-600 font-medium">Candidate</p>
                  <p className="font-bold">{assigned.candidateName}</p>
                  <p className="text-xs text-gray-600">
                    {assigned.candidateEmail}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">Position</p>
                  <p className="font-bold">{assigned.jobPosition}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Interview Date & Time
                  </p>
                  <p className="font-bold">
                    {assigned.interviewDate && assigned.interviewTime
                      ? `${assigned.interviewDate} at ${assigned.interviewTime}`
                      : "Not Scheduled"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Requirements
                  </p>
                  <p className="text-sm">
                    {assigned.requirements || "No requirements set"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-medium">
                    Remarks & Questions
                  </p>
                  <p className="text-sm">
                    {assigned.remarks || "No remarks set"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleScheduleInterview(assigned)}
                  className="bg-[#5D20B3] text-white px-4 py-2 rounded text-xs hover:bg-[#4a1a8a]"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() =>
                    alert(`Email invitation sent to ${assigned.candidateName}!`)
                  }
                  className="border border-[#5D20B3] text-[#5D20B3] px-4 py-2 rounded text-xs hover:bg-[#5D20B3]/10"
                >
                  Send Email Invite
                </button>
                <button
                  onClick={() =>
                    alert(
                      `View candidate details for ${assigned.candidateName}`,
                    )
                  }
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-xs hover:bg-gray-50"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTAINER 4: Past Interviews */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Past Interviews & Results</h2>

          {/* Job Position Filter */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-600 mb-3">
              Filter by Position:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPastInterviewJobFilter(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pastInterviewJobFilter === null
                    ? "bg-[#5D20B3] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Positions
              </button>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() =>
                    setPastInterviewJobFilter(
                      pastInterviewJobFilter === job.position
                        ? null
                        : job.position,
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    pastInterviewJobFilter === job.position
                      ? "bg-[#5D20B3] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {job.position}
                </button>
              ))}
            </div>
          </div>

          {/* Grade Filter */}
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-600">
              Interview Result:
            </p>
            <select
              value={pastInterviewGradeFilter}
              onChange={(e) => setPastInterviewGradeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
            >
              <option value="all">All Results</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Next Stage">Next Stage</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        {/* Past Interviews List */}
        <div className="space-y-3">
          {getFilteredPastInterviews().map((interview) => (
            <div
              key={interview.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{interview.candidateName}</h3>
                  <p className="text-gray-600 text-sm">
                    {interview.jobPosition}
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    Interviewed on {interview.interviewDate}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${getGradeColor(interview.grade)}`}
                >
                  {interview.grade}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-3">
                <span className="font-medium">Remarks:</span>{" "}
                {interview.remarks}
              </p>
            </div>
          ))}
          {getFilteredPastInterviews().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No interviews found for the selected filters.
            </div>
          )}
        </div>
      </div>

      {/* Assign to Interviewer Modal */}
      {showAssignModal && selectedCandidate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Assign {selectedCandidate.name}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Assign to Interviewer
                </label>
                <input
                  type="text"
                  value={assignInterviewer}
                  onChange={(e) => setAssignInterviewer(e.target.value)}
                  placeholder="Interviewer name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={assignDeadline}
                  onChange={(e) => setAssignDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Requirements
                </label>
                <textarea
                  value={assignRequirements}
                  onChange={(e) => setAssignRequirements(e.target.value)}
                  placeholder="List requirements for this interview..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Remarks & Questions
                </label>
                <textarea
                  value={assignRemarks}
                  onChange={(e) => setAssignRemarks(e.target.value)}
                  placeholder="Add remarks and questions for the interviewer..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleConfirmAssignment}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && selectedAssigned && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Schedule Interview for {selectedAssigned.candidateName}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Interview Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">Note:</span> An automated
                  email invitation will be sent to{" "}
                  {selectedAssigned.candidateEmail} once scheduled.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleConfirmSchedule}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Schedule
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
