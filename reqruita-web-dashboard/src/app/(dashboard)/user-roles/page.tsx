"use client";

import { useState, useEffect } from "react";

export default function UserRolesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("interviewer");

  // Status State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Users on Load
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:3003/api/dashboard/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password || !role) {
      setError("Please fill all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      const res = await fetch("http://localhost:3003/api/dashboard/users/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to add user");
      } else {
        setSuccess(data.message || "User added successfully!");
        setEmail("");
        setPassword("");
        setRole("interviewer");

        // Refresh the table with the new user
        fetchUsers();

        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess("");
        }, 2000);
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }
  };

  const getRoleColor = (roleStr: string) => {
    switch (roleStr) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'interviewer': return 'bg-blue-100 text-blue-800';
      case 'recruiter': return 'bg-orange-100 text-orange-800';
      case 'hr manager': return 'bg-teal-100 text-teal-800';
      case 'candidate': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Thursday, November 20</p>
        <h1 className="text-3xl font-bold">User & Roles</h1>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#5D20B3] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#4a1a8a] transition-colors shadow-sm">
            Add New User
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-400 border-b">
                  <th className="py-3 font-medium">Name</th>
                  <th className="py-3 font-medium">Email</th>
                  <th className="py-3 font-medium">Assigned Passkey</th>
                  <th className="py-3 font-medium">Role</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium">{user.fullName}</td>
                    <td className="py-4 text-gray-600">{user.email}</td>
                    <td className="py-4 text-gray-500 font-mono text-xs">
                      {user.visiblePassword ? user.visiblePassword : '••••••••'}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </td>
                    <td className="py-4 flex gap-3">
                      <button className="text-[#5D20B3] text-sm hover:underline font-medium">Edit</button>
                      <button className="text-red-600 text-sm hover:underline font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold mb-1 text-slate-800">Add New User</h2>
            <p className="text-sm text-slate-500 mb-6">Create a new account and assign a role.</p>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>{error}</div>}
            {success && <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>{success}</div>}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5D20B3]/20 focus:border-[#5D20B3] outline-none transition-all"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Passkey</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5D20B3]/20 focus:border-[#5D20B3] outline-none transition-all"
                  placeholder="Enter a secure passkey for them"
                />
                <p className="text-xs text-slate-500 mt-1">This passkey will be visible on the dashboard.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#5D20B3]/20 focus:border-[#5D20B3] outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                  <option value="interviewer">Interviewer</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t mt-6">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(""); setSuccess(""); }}
                  className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#5D20B3] text-white font-medium hover:bg-[#4a1a8a] rounded-lg transition-all shadow-sm flex items-center gap-2"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
