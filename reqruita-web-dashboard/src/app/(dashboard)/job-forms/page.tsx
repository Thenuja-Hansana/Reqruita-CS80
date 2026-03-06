"use client";

import { useState } from "react";

interface Submission {
  id: number;
  date: string;
  jobRole: string;
  name: string;
  email: string;
  status: string;
  phone?: string;
  resume?: string;
  coverLetter?: string;
}

interface Template {
  id: number;
  title: string;
  description: string;
  fields: string[];
}

export default function JobFormsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [newFormTitle, setNewFormTitle] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [filterJobRole, setFilterJobRole] = useState<string>("all");

  const [submissions] = useState<Submission[]>([
    {
      id: 1,
      date: "July 17, 2025",
      jobRole: "Software Engineer",
      name: "John Doe",
      email: "john@email.com",
      status: "Submitted",
      phone: "+1234567890",
      resume: "john_doe_resume.pdf",
      coverLetter: "Experienced software engineer...",
    },
    {
      id: 2,
      date: "July 18, 2025",
      jobRole: "Product Manager",
      name: "Jane Smith",
      email: "jane@email.com",
      status: "Submitted",
      phone: "+1234567891",
      resume: "jane_smith_resume.pdf",
    },
    {
      id: 3,
      date: "July 19, 2025",
      jobRole: "Data Analyst",
      name: "Bob Wilson",
      email: "bob@email.com",
      status: "Submitted",
      phone: "+1234567892",
    },
    {
      id: 4,
      date: "July 20, 2025",
      jobRole: "UI Designer",
      name: "Alice Brown",
      email: "alice@email.com",
      status: "Submitted",
      phone: "+1234567893",
    },
    {
      id: 5,
      date: "July 21, 2025",
      jobRole: "DevOps Engineer",
      name: "Charlie Davis",
      email: "charlie@email.com",
      status: "Submitted",
      phone: "+1234567894",
    },
    {
      id: 6,
      date: "July 22, 2025",
      jobRole: "Software Engineer",
      name: "Diana Miller",
      email: "diana@email.com",
      status: "Submitted",
      phone: "+1234567895",
    },
    {
      id: 7,
      date: "July 23, 2025",
      jobRole: "Product Manager",
      name: "Evan Taylor",
      email: "evan@email.com",
      status: "Submitted",
      phone: "+1234567896",
    },
    {
      id: 8,
      date: "July 24, 2025",
      jobRole: "Data Analyst",
      name: "Fiona Anderson",
      email: "fiona@email.com",
      status: "Submitted",
      phone: "+1234567897",
    },
  ]);

  const [templates, setTemplates] = useState<Template[]>([
    {
      id: 1,
      title: "Software Engineer",
      description: "Customizable form template for Software Engineer positions",
      fields: [
        "Name",
        "Email",
        "Phone",
        "Resume",
        "GitHub Profile",
        "Years of Experience",
      ],
    },
    {
      id: 2,
      title: "Product Manager",
      description: "Customizable form template for Product Manager positions",
      fields: [
        "Name",
        "Email",
        "Phone",
        "Resume",
        "Portfolio",
        "LinkedIn Profile",
      ],
    },
    {
      id: 3,
      title: "Data Analyst",
      description: "Customizable form template for Data Analyst positions",
      fields: [
        "Name",
        "Email",
        "Phone",
        "Resume",
        "Portfolio",
        "SQL Experience",
      ],
    },
    {
      id: 4,
      title: "UI Designer",
      description: "Customizable form template for UI Designer positions",
      fields: [
        "Name",
        "Email",
        "Phone",
        "Portfolio",
        "Behance/Dribbble Profile",
      ],
    },
    {
      id: 5,
      title: "DevOps Engineer",
      description: "Customizable form template for DevOps Engineer positions",
      fields: [
        "Name",
        "Email",
        "Phone",
        "Resume",
        "Certifications",
        "Years of Experience",
      ],
    },
  ]);

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowEditTemplateModal(true);
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleCopyLink = (template: Template) => {
    const formUrl = `${window.location.origin}/apply/${template.id}`;
    navigator.clipboard.writeText(formUrl).then(() => {
      setCopySuccess(template.id);
      setTimeout(() => setCopySuccess(null), 2000);
    });
  };

  const handleCreateForm = () => {
    if (newFormTitle.trim()) {
      const newTemplate: Template = {
        id: templates.length + 1,
        title: newFormTitle,
        description:
          newFormDescription ||
          `Customizable form template for ${newFormTitle} positions`,
        fields: ["Name", "Email", "Phone", "Resume"],
      };
      setTemplates([...templates, newTemplate]);
      setNewFormTitle("");
      setNewFormDescription("");
      setShowCreateModal(false);
    }
  };

  const handleDownload = (submission: Submission) => {
    // Simulate download
    alert(`Downloading submission for ${submission.name}`);
  };

  // Filter submissions by job role
  const filteredSubmissions =
    filterJobRole === "all"
      ? submissions
      : submissions.filter((s) => s.jobRole === filterJobRole);

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortBy === "latest" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-gray-500">Thursday, November 20</p>
        <h1 className="text-3xl font-bold">Job Forms</h1>
      </div>

      {/* Job Forms Section */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Job Application Form Submissions
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5D20B3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a1a8a]"
          >
            Create New Form
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sort By:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "latest" | "oldest")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] text-sm"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Job Role:
            </label>
            <select
              value={filterJobRole}
              onChange={(e) => setFilterJobRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] text-sm"
            >
              <option value="all">All Job Roles</option>
              {templates.map((template) => (
                <option key={template.id} value={template.title}>
                  {template.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-400 border-b">
              <th className="py-3 font-medium">Date</th>
              <th className="py-3 font-medium">Job Role</th>
              <th className="py-3 font-medium">Name</th>
              <th className="py-3 font-medium">Email</th>
              <th className="py-3 font-medium">Status</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedSubmissions.length > 0 ? (
              sortedSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="py-4">{submission.date}</td>
                  <td className="py-4">{submission.jobRole}</td>
                  <td className="py-4">{submission.name}</td>
                  <td className="py-4">{submission.email}</td>
                  <td className="py-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-4 flex gap-2">
                    <button
                      onClick={() => handleViewSubmission(submission)}
                      className="bg-[#5D20B3] text-white px-3 py-1 rounded text-xs hover:bg-[#4a1a8a]"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(submission)}
                      className="border border-gray-300 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-50"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No applications found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Templates */}
      <div className="bg-white rounded-2xl border p-6">
        <h2 className="text-xl font-bold mb-6">Form Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg mb-2">{template.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                {template.description}
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 bg-[#5D20B3] text-white px-3 py-2 rounded-lg text-xs hover:bg-[#4a1a8a] transition"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => handleCopyLink(template)}
                    className="flex-1 bg-white text-[#5D20B3] border border-[#5D20B3] px-3 py-2 rounded-lg text-xs hover:bg-purple-50 transition"
                  >
                    {copySuccess === template.id ? "✓ Copied!" : "🔗 Copy Link"}
                  </button>
                </div>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="text-[#5D20B3] text-sm font-medium hover:underline text-left"
                >
                  Edit Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Form Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => {
            setShowCreateModal(false);
            setNewFormTitle("");
            setNewFormDescription("");
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Create New Form Template
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Form Title
                </label>
                <input
                  type="text"
                  value={newFormTitle}
                  onChange={(e) => setNewFormTitle(e.target.value)}
                  placeholder="e.g., Backend Engineer"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newFormDescription}
                  onChange={(e) => setNewFormDescription(e.target.value)}
                  placeholder="Describe the form template..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateForm}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewFormTitle("");
                    setNewFormDescription("");
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

      {/* View Submission Modal */}
      {showViewModal && selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => {
            setShowViewModal(false);
            setSelectedSubmission(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Application Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <p className="text-lg">{selectedSubmission.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-lg">{selectedSubmission.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Phone
                  </label>
                  <p className="text-lg">{selectedSubmission.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Job Role
                  </label>
                  <p className="text-lg">{selectedSubmission.jobRole}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Date
                  </label>
                  <p className="text-lg">{selectedSubmission.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedSubmission.status}
                  </span>
                </div>
              </div>
              {selectedSubmission.resume && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Resume
                  </label>
                  <a href="#" className="text-[#5D20B3] hover:underline">
                    {selectedSubmission.resume}
                  </a>
                </div>
              )}
              {selectedSubmission.coverLetter && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Cover Letter
                  </label>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {selectedSubmission.coverLetter}
                  </p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleDownload(selectedSubmission)}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Download Full Application
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSubmission(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedTemplate.title}
                </h2>
                <p className="text-gray-600">Application Form Preview</p>
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Candidate Form Preview */}
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-[#5D20B3] p-4 rounded">
                <p className="text-sm text-gray-700">
                  📝 This is how candidates will see the application form
                </p>
              </div>

              <form className="space-y-5">
                {selectedTemplate.fields.map((field, index) => (
                  <div key={index}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field}
                      <span className="text-red-500">*</span>
                    </label>
                    {field.toLowerCase().includes("resume") ||
                    field.toLowerCase().includes("portfolio") ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#5D20B3] transition cursor-pointer">
                        <div className="text-gray-400 mb-2">📎</div>
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    ) : field.toLowerCase().includes("experience") ||
                      field.toLowerCase().includes("description") ? (
                      <textarea
                        placeholder={`Enter your ${field.toLowerCase()}...`}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] focus:border-transparent"
                        disabled
                      />
                    ) : (
                      <input
                        type={
                          field.toLowerCase().includes("email")
                            ? "email"
                            : field.toLowerCase().includes("phone")
                              ? "tel"
                              : "text"
                        }
                        placeholder={`Enter your ${field.toLowerCase()}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] focus:border-transparent"
                        disabled
                      />
                    )}
                  </div>
                ))}

                <div className="pt-4">
                  <button
                    type="button"
                    className="w-full bg-[#5D20B3] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a1a8a] transition cursor-not-allowed opacity-70"
                    disabled
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>

            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                onClick={() => handleCopyLink(selectedTemplate)}
                className="flex-1 bg-white text-[#5D20B3] border border-[#5D20B3] px-4 py-2 rounded-lg hover:bg-purple-50 transition"
              >
                {copySuccess === selectedTemplate.id
                  ? "✓ Link Copied!"
                  : "🔗 Copy Form Link"}
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedTemplate(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && selectedTemplate && (
        <div
          className="fixed inset-0 bg-black/10 flex items-center justify-center z-50"
          onClick={() => {
            setShowEditTemplateModal(false);
            setSelectedTemplate(null);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">
              Edit Template: {selectedTemplate.title}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedTemplate.title}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={selectedTemplate.description}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Form Fields
                </label>
                <div className="space-y-2">
                  {selectedTemplate.fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={field}
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                      />
                      <button className="text-red-500 hover:text-red-700 px-2">
                        ✕
                      </button>
                    </div>
                  ))}
                  <button className="text-[#5D20B3] text-sm font-medium hover:underline">
                    + Add Field
                  </button>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    alert("Template updated successfully!");
                    setShowEditTemplateModal(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditTemplateModal(false);
                    setSelectedTemplate(null);
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
