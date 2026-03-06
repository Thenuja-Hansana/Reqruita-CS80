"use client";

import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
}

interface Role {
  name: string;
  permission: string;
}

export default function UserRolesPage() {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@company.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@company.com",
      role: "Interviewer",
      status: "Active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@company.com",
      role: "Recruiter",
      status: "Active",
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.williams@company.com",
      role: "HR Manager",
      status: "Active",
    },
    {
      id: 5,
      name: "Tom Brown",
      email: "tom.brown@company.com",
      role: "Candidate",
      status: "Inactive",
    },
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("Interviewer");
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("");

  const roles: Role[] = [
    { name: "Admin", permission: "Full Access" },
    { name: "Interviewer", permission: "Interview & Feedback" },
    { name: "Recruiter", permission: "Job Posting & Candidate Management" },
    { name: "HR Manager", permission: "Reports & Settings" },
    { name: "Candidate", permission: "View & Apply" },
  ];

  const handleAddUser = () => {
    if (newUserName.trim() && newUserEmail.trim()) {
      const newUser: User = {
        id: users.length + 1,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        status: "Active",
      };
      setUsers([...users, newUser]);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("Interviewer");
      setShowAddUserModal(false);
      alert("User added successfully!");
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserRole(user.role);
    setShowEditUserModal(true);
  };

  const handleSaveEdit = () => {
    if (selectedUser && editUserName.trim() && editUserEmail.trim()) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: editUserName,
                email: editUserEmail,
                role: editUserRole,
              }
            : u,
        ),
      );
      setShowEditUserModal(false);
      alert("User updated successfully!");
    }
  };

  const handleRemoveClick = (user: User) => {
    setSelectedUser(user);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setShowRemoveModal(false);
      alert(`User ${selectedUser.name} removed successfully!`);
    }
  };

  const handleConfigurePermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
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
            onClick={() => setShowAddUserModal(true)}
            className="bg-[#5D20B3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a1a8a]"
          >
            Add New User
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
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-4">{user.name}</td>
                <td className="py-4">{user.email}</td>
                <td className="py-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    {user.role}
                  </span>
                </td>
                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-4 flex gap-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-[#5D20B3] text-sm hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleRemoveClick(user)}
                    className="text-red-600 text-sm hover:underline"
                  >
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
        {roles.map((role) => (
          <div key={role.name} className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold text-lg mb-2">{role.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{role.permission}</p>
            <button
              onClick={() => handleConfigurePermissions(role)}
              className="text-[#5D20B3] text-sm font-medium hover:underline"
            >
              Configure Permissions →
            </button>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowAddUserModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add New User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="User name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                >
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddUser}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowEditUserModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  placeholder="User name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  placeholder="user@company.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                >
                  {roles.map((role) => (
                    <option key={role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditUserModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove User Modal */}
      {showRemoveModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowRemoveModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Remove User</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove {selectedUser.name}? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmRemove}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Remove
              </button>
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => setShowPermissionsModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Configure {selectedRole.name} Permissions
            </h2>
            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">View Candidates</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">Schedule Interviews</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-medium">View Reports</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm font-medium">Manage Users</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm font-medium">Edit Settings</span>
              </label>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert(`Permissions for ${selectedRole.name} updated!`);
                  setShowPermissionsModal(false);
                }}
                className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
              >
                Save
              </button>
              <button
                onClick={() => setShowPermissionsModal(false)}
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
