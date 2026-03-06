"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "overdue" | "completed"
  >("upcoming");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // Get calendar days for current month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Generate calendar days array
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [currentDate]);

  // Interviews data
  const interviews = {
    upcoming: [
      {
        id: 1,
        candidate: "John Doe",
        role: "Software Engineer",
        time: "2:00 PM",
        date: "July 25, 2025",
      },
      {
        id: 2,
        candidate: "Jane Smith",
        role: "Product Manager",
        time: "3:30 PM",
        date: "July 26, 2025",
      },
    ],
    overdue: [
      {
        id: 3,
        candidate: "Bob Wilson",
        role: "Data Analyst",
        time: "10:00 AM",
        date: "July 20, 2025",
      },
    ],
    completed: [
      {
        id: 4,
        candidate: "Alice Brown",
        role: "UI Designer",
        time: "11:00 AM",
        date: "July 18, 2025",
      },
      {
        id: 5,
        candidate: "Charlie Davis",
        role: "DevOps Engineer",
        time: "4:00 PM",
        date: "July 19, 2025",
      },
    ],
  };

  const handleCreateTask = () => {
    if (taskTitle.trim()) {
      alert(`Task created: ${taskTitle}`);
      setTaskTitle("");
      setTaskDescription("");
      setShowTaskModal(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const currentInterviews = interviews[activeTab];

  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Column: Stats & Tables */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <div>
          <p className="text-gray-500">Friday, March 2, 2026</p>
          <h1 className="text-3xl font-bold">Good day, Bob!</h1>
        </div>

        {/* Interviews Card */}
        <div className="bg-white rounded-2xl border p-6 min-h-[200px]">
          <h2 className="text-xl font-bold mb-4">Assigned Interviews</h2>
          <div className="flex gap-6 border-b text-sm font-medium mb-10">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-2 transition ${
                activeTab === "upcoming"
                  ? "border-b-2 border-[#5D20B3] text-[#5D20B3]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab("overdue")}
              className={`pb-2 transition ${
                activeTab === "overdue"
                  ? "border-b-2 border-[#5D20B3] text-[#5D20B3]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Overdue
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`pb-2 transition ${
                activeTab === "completed"
                  ? "border-b-2 border-[#5D20B3] text-[#5D20B3]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Completed
            </button>
          </div>
          {currentInterviews.length > 0 ? (
            <div className="space-y-4">
              {currentInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{interview.candidate}</p>
                      <p className="text-sm text-gray-500">{interview.role}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {interview.date}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-[#5D20B3] bg-purple-100 px-3 py-1 rounded-full">
                      {interview.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400">
              No {activeTab} interviews assigned
            </div>
          )}
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">
              Job Application Form Submissions
            </h2>
            <button
              onClick={() => router.push("/job-forms")}
              className="text-[#5D20B3] text-sm font-medium hover:underline"
            >
              View All &gt;
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-400 border-b">
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Job Role</th>
                <th className="py-3 font-medium">Name</th>
                <th className="py-3 font-medium">Email</th>
                <th className="py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-4">July 16, 2025</td>
                  <td className="py-4">Software Engineer</td>
                  <td className="py-4">John</td>
                  <td className="py-4">john@email.com</td>
                  <td className="py-4">
                    <button className="bg-[#5D20B3] text-white px-3 py-1 rounded text-xs hover:bg-[#4a1a8a]">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Calendar & Tasks */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div
          className="bg-[#5D20B3] rounded-2xl p-6 text-white flex justify-between items-center cursor-pointer hover:shadow-lg transition"
          onClick={() => setShowTaskModal(true)}
        >
          <div>
            <h3 className="font-bold">Create Task</h3>
            <p className="text-xs opacity-70">Create a new task</p>
          </div>
          <button className="bg-white text-[#5D20B3] w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl hover:scale-110 transition">
            +
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">{monthName}</h3>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="px-2 py-1 hover:bg-gray-100 rounded-lg transition"
              >
                ←
              </button>
              <button
                onClick={handleNextMonth}
                className="px-2 py-1 hover:bg-gray-100 rounded-lg transition"
              >
                →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-gray-400 font-medium py-2">
                {d}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const today = new Date();
              const isToday =
                day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();
              return (
                <div
                  key={index}
                  className={`py-2 rounded-lg transition ${
                    day === null
                      ? ""
                      : isToday
                        ? "bg-[#5D20B3] text-white font-bold cursor-pointer"
                        : "hover:bg-purple-100 cursor-pointer font-medium"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Events */}
        <div className="space-y-4">
          <div className="bg-[#5D20B3] rounded-2xl p-4 text-white">
            <div className="flex justify-between text-xs mb-2">
              <span>Daily Standup Call</span>
              <span>9:00 AM</span>
            </div>
            <p className="text-[10px] opacity-70">
              Discuss team tasks for the day.
            </p>
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => {
            setShowTaskModal(false);
            setTaskTitle("");
            setTaskDescription("");
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateTask}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Create Task
                </button>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setTaskTitle("");
                    setTaskDescription("");
                  }}
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
