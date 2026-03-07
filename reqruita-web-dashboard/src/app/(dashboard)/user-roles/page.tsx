"use client";

import { useState } from "react";

export default function UserRolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddInterviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      const res = await fetch("http://localhost:3003/api/add-interviewer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add interviewer");
      } else {
        setSuccess(data.message || "Interviewer added successfully!");
        setEmail("");
        setPassword("");
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Thursday, November 20</p>
        <h1 className="text-3xl font-bold">User & Roles</h1>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5D20B3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a1a8a]">
            Add New Interviewer
          </button>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="py-3 font-medium">Name</th>
              <th className="py-3 font-medium">Email</th>
              <th className="py-3 font-medium">Role</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              "Admin",
              "Interviewer",
              "Recruiter",
              "HR Manager",
              "Candidate",
            ].map((role, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-4">John Smith</td>
                <td className="py-4">john.smith@company.com</td>
                <td className="py-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    {role}
                  </span>
                </td>
                <td className="py-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    Active
                  </span>
                </td>
                <td className="py-4 flex gap-2">
                  <button className="text-[#5D20B3] text-sm hover:underline">
                    Edit
                  </button>
                  <button className="text-red-600 text-sm hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { name: "Admin", permission: "Full Access" },
          { name: "Interviewer", permission: "Interview & Feedback" },
          {
            name: "Recruiter",
            permission: "Job Posting & Candidate Management",
          },
          { name: "HR Manager", permission: "Reports & Settings" },
          { name: "Candidate", permission: "View & Apply" },
        ].map((role) => (
          <div key={role.name} className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">{role.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{role.permission}</p>
            <button className="text-[#5D20B3] text-sm font-medium hover:underline">
              Configure Permissions →
            </button>
          </div>
        ))}
      </div>

      {/* Add Interviewer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Add New Interviewer</h2>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">{success}</div>}

            <form onSubmit={handleAddInterviewer} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D20B3] outline-none transition-all"
                  placeholder="interviewer@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Passkey</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5D20B3] outline-none transition-all"
                  placeholder="Enter a secure passkey"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(""); setSuccess(""); }}
                  className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#5D20B3] text-white font-medium hover:bg-[#4a1a8a] rounded-lg transition-all"
                >
                  Add Interviewer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
