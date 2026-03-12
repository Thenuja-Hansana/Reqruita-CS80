"use client";

import { useState } from "react";

type SettingsForm = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  title: string;
  weeklyDigest: boolean;
  interviewReminders: boolean;
  candidateAlerts: boolean;
  securityAlerts: boolean;
};

export default function SettingsPage() {
  const [formData, setFormData] = useState<SettingsForm>({
    firstName: "Admin",
    lastName: "User",
    email: "admin@reqruita.com",
    company: "Reqruita Inc.",
    title: "System Administrator",
    weeklyDigest: true,
    interviewReminders: true,
    candidateAlerts: true,
    securityAlerts: true,
  });

  const [saving, setSaving] = useState(false);

  const updateField = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 900);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Update your personal and company details.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">First Name</span>
            <input
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#5D20B3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Last Name</span>
            <input
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#5D20B3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#5D20B3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Company</span>
            <input
              value={formData.company}
              onChange={(event) => updateField("company", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#5D20B3] focus:bg-white"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-medium text-gray-700">Job Title</span>
            <input
              value={formData.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none focus:border-[#5D20B3] focus:bg-white"
            />
          </label>
        </div>


      </section>

      <section className="xl:col-span-1 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 h-fit">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500 mt-1">
            Keep your account safe with regular updates.
          </p>
        </div>

        <div className="space-y-3">
          <button className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-left hover:bg-gray-50 transition-colors">
            Change Password
          </button>
          <button className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-left hover:bg-gray-50 transition-colors">
            Enable 2FA
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-3">
          <h3 className="text-base font-semibold text-gray-900">
            Notifications
          </h3>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
            <span className="text-sm text-gray-700">Weekly digest</span>
            <input
              type="checkbox"
              checked={formData.weeklyDigest}
              onChange={(event) => updateField("weeklyDigest", event.target.checked)}
              className="h-4 w-4 accent-[#5D20B3]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
            <span className="text-sm text-gray-700">Interview reminders</span>
            <input
              type="checkbox"
              checked={formData.interviewReminders}
              onChange={(event) =>
                updateField("interviewReminders", event.target.checked)
              }
              className="h-4 w-4 accent-[#5D20B3]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
            <span className="text-sm text-gray-700">Candidate alerts</span>
            <input
              type="checkbox"
              checked={formData.candidateAlerts}
              onChange={(event) => updateField("candidateAlerts", event.target.checked)}
              className="h-4 w-4 accent-[#5D20B3]"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3.5 py-3">
            <span className="text-sm text-gray-700">Security alerts</span>
            <input
              type="checkbox"
              checked={formData.securityAlerts}
              onChange={(event) => updateField("securityAlerts", event.target.checked)}
              className="h-4 w-4 accent-[#5D20B3]"
            />
          </label>
        </div>
      </section>

      <div className="xl:col-span-3 flex items-center justify-end gap-3">
        <button className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#5D20B3] text-white text-sm font-semibold hover:bg-[#4c1a90] transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
