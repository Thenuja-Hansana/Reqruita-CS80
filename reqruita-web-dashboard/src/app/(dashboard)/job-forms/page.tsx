"use client";

import { DragEvent, useState } from "react";

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

type FieldType = "text" | "phone" | "email" | "file" | "link";

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  phone: "Phone Number",
  email: "Email",
  file: "File Upload",
  link: "Link",
};

interface FormField {
  label: string;
  type: FieldType;
}

interface Template {
  id: number;
  title: string;
  description: string;
  fields: FormField[];
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  { label: "Name", type: "text" },
  { label: "Email", type: "email" },
  { label: "Phone", type: "phone" },
  { label: "Resume", type: "file" },
];

export default function JobFormsPage() {
  const MAX_VISIBLE_SUBMISSION_ROWS = 10;
  const SUBMISSION_ROW_HEIGHT_PX = 56;
  const SUBMISSION_HEADER_HEIGHT_PX = 48;

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
  const [editTemplateName, setEditTemplateName] = useState("");
  const [editTemplateDescription, setEditTemplateDescription] = useState("");
  const [editTemplateFields, setEditTemplateFields] = useState<FormField[]>([]);
  const [newFormFields, setNewFormFields] = useState<FormField[]>([...DEFAULT_FORM_FIELDS]);
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
      description:
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: [...DEFAULT_FORM_FIELDS],
    },
    {
      id: 2,
      title: "Product Manager",
      description:
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: [...DEFAULT_FORM_FIELDS],
    },
    {
      id: 3,
      title: "Data Analyst",
      description:
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: [...DEFAULT_FORM_FIELDS],
    },
    {
      id: 4,
      title: "UI Designer",
      description:
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: [...DEFAULT_FORM_FIELDS],
    },
    {
      id: 5,
      title: "DevOps Engineer",
      description:
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: [...DEFAULT_FORM_FIELDS],
    },
  ]);

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowViewModal(true);
  };

  const handleEditTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setEditTemplateName(template.title);
    setEditTemplateDescription(template.description);
    setEditTemplateFields(
      template.fields.length > 0 ? [...template.fields] : [...DEFAULT_FORM_FIELDS],
    );
    setShowEditTemplateModal(true);
  };

  const handleEditFieldChange = (index: number, key: keyof FormField, value: string) => {
    setEditTemplateFields((prev) =>
      prev.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field,
      ),
    );
  };

  const handleAddEditField = () => {
    setEditTemplateFields((prev) => [...prev, { label: "", type: "text" }]);
  };

  const handleRemoveEditField = (index: number) => {
    setEditTemplateFields((prev) =>
      prev.filter((_, fieldIndex) => fieldIndex !== index),
    );
  };

  const handleDragStartEditField = (
    event: DragEvent<HTMLButtonElement>,
    sourceIndex: number,
  ) => {
    event.dataTransfer.setData("text/plain", sourceIndex.toString());
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDropEditField = (
    event: DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();
    const sourceIndex = Number(event.dataTransfer.getData("text/plain"));

    if (
      Number.isNaN(sourceIndex) ||
      sourceIndex < 0 ||
      sourceIndex >= editTemplateFields.length ||
      sourceIndex === targetIndex
    ) {
      return;
    }

    setEditTemplateFields((prev) => {
      const updated = [...prev];
      const [movedField] = updated.splice(sourceIndex, 1);
      updated.splice(targetIndex, 0, movedField);
      return updated;
    });
  };

  const handleSaveTemplateChanges = () => {
    if (!selectedTemplate) {
      return;
    }

    const sanitizedName = editTemplateName.trim();
    const sanitizedDescription = editTemplateDescription.trim();
    const sanitizedFields = editTemplateFields
      .map((field) => ({ ...field, label: field.label.trim() }))
      .filter((field) => field.label.length > 0);

    if (!sanitizedName) {
      alert("Template name is required.");
      return;
    }

    const updatedTemplate: Template = {
      ...selectedTemplate,
      title: sanitizedName,
      description:
        sanitizedDescription ||
        "Standard application template with Name, Email, Phone, and Resume.",
      fields: sanitizedFields.length > 0 ? sanitizedFields : [...DEFAULT_FORM_FIELDS],
    };

    setTemplates((prev) =>
      prev.map((template) =>
        template.id === selectedTemplate.id ? updatedTemplate : template,
      ),
    );

    alert("Template updated successfully!");
    setShowEditTemplateModal(false);
    setSelectedTemplate(null);
    setEditTemplateName("");
    setEditTemplateDescription("");
    setEditTemplateFields([]);
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
      const sanitizedFields = newFormFields
        .map((f) => ({ ...f, label: f.label.trim() }))
        .filter((f) => f.label.length > 0);
      const newTemplate: Template = {
        id: templates.length + 1,
        title: newFormTitle,
        description:
          newFormDescription ||
          "Standard application template with Name, Email, Phone, and Resume.",
        fields: sanitizedFields.length > 0 ? sanitizedFields : [...DEFAULT_FORM_FIELDS],
      };
      setTemplates([...templates, newTemplate]);
      setNewFormTitle("");
      setNewFormDescription("");
      setNewFormFields([...DEFAULT_FORM_FIELDS]);
      setShowCreateModal(false);
    }
  };

  const handleNewFormFieldChange = (index: number, key: keyof FormField, value: string) => {
    setNewFormFields((prev) =>
      prev.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    );
  };

  const handleAddNewFormField = () => {
    setNewFormFields((prev) => [...prev, { label: "", type: "text" }]);
  };

  const handleRemoveNewFormField = (index: number) => {
    setNewFormFields((prev) => prev.filter((_, i) => i !== index));
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

        <div
          className="overflow-y-auto rounded-lg"
          style={{
            maxHeight: `${SUBMISSION_HEADER_HEIGHT_PX + MAX_VISIBLE_SUBMISSION_ROWS * SUBMISSION_ROW_HEIGHT_PX}px`,
          }}
        >
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white z-10">
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
      </div>

      {/* Form Templates */}
      <div className="bg-white rounded-2xl border p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Form Templates</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#5D20B3] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4a1a8a]"
          >
            Create New Form
          </button>
        </div>
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
            setNewFormFields([...DEFAULT_FORM_FIELDS]);
          }}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
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
              <div>
                <label className="block text-sm font-medium mb-2">
                  Form Fields
                </label>
                <div className="space-y-2">
                  {newFormFields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleNewFormFieldChange(index, "label", e.target.value)
                        }
                        placeholder="Field label"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                      />
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleNewFormFieldChange(index, "type", e.target.value)
                        }
                        className="px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] text-sm bg-white"
                      >
                        {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(
                          ([val, lbl]) => (
                            <option key={val} value={val}>
                              {lbl}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFormField(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddNewFormField}
                    className="text-[#5D20B3] text-sm font-medium hover:underline"
                  >
                    + Add Field
                  </button>
                </div>
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
                    setNewFormFields([...DEFAULT_FORM_FIELDS]);
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
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                      <span className="text-red-500">*</span>
                      <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {FIELD_TYPE_LABELS[field.type]}
                      </span>
                    </label>
                    {field.type === "file" ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#5D20B3] transition cursor-pointer">
                        <div className="text-gray-400 mb-2">📎</div>
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          PDF, DOC, DOCX (Max 5MB)
                        </p>
                      </div>
                    ) : (
                      <input
                        type={
                          field.type === "email"
                            ? "email"
                            : field.type === "phone"
                              ? "tel"
                              : field.type === "link"
                                ? "url"
                                : "text"
                        }
                        placeholder={
                          field.type === "link"
                            ? "https://..."
                            : field.type === "phone"
                              ? "+1 (555) 000-0000"
                              : `Enter your ${field.label.toLowerCase()}...`
                        }
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
                  value={editTemplateName}
                  onChange={(e) => setEditTemplateName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={editTemplateDescription}
                  onChange={(e) => setEditTemplateDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Form Fields
                </label>
                <div className="space-y-2">
                  {editTemplateFields.map((field, index) => (
                    <div
                      key={`${index}-${field.label}`}
                      className="flex items-center gap-2"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDropEditField(event, index)}
                    >
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          draggable
                          onDragStart={(event) =>
                            handleDragStartEditField(event, index)
                          }
                          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 cursor-grab active:cursor-grabbing"
                          aria-label="Drag field to reorder"
                          title="Drag to reorder"
                        >
                          ::
                        </button>
                      </div>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleEditFieldChange(index, "label", e.target.value)
                        }
                        placeholder="e.g., LinkedIn Profile"
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3]"
                      />
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleEditFieldChange(index, "type", e.target.value)
                        }
                        className="px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D20B3] text-sm bg-white"
                      >
                        {(Object.entries(FIELD_TYPE_LABELS) as [FieldType, string][]).map(
                          ([val, lbl]) => (
                            <option key={val} value={val}>
                              {lbl}
                            </option>
                          ),
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveEditField(index)}
                        className="text-red-500 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEditField}
                    className="text-[#5D20B3] text-sm font-medium hover:underline"
                  >
                    + Add Field
                  </button>
                  <p className="text-xs text-gray-500">
                    Drag rows using the :: handle to arrange fields.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveTemplateChanges}
                  className="flex-1 bg-[#5D20B3] text-white px-4 py-2 rounded-lg hover:bg-[#4a1a8a]"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditTemplateModal(false);
                    setSelectedTemplate(null);
                    setEditTemplateName("");
                    setEditTemplateDescription("");
                    setEditTemplateFields([]);
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
