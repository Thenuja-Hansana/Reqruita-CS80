"use client";

import { useState } from "react";

type SettingsState = {
  fullName: string;
  email: string;
  emailAlerts: boolean;
  interviewReminders: boolean;
  weeklyDigest: boolean;
  autoRecordInterviews: boolean;
  aiSummaryEnabled: boolean;
};

const DEFAULT_SETTINGS: SettingsState = {
  fullName: "Admin User",
  email: "admin@reqruita.com",
  emailAlerts: true,
  interviewReminders: true,
  weeklyDigest: true,
  autoRecordInterviews: true,
  aiSummaryEnabled: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [saveMessage, setSaveMessage] = useState("");

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    setSaveMessage("Settings saved successfully.");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">System Configuration</p>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveChanges}
            className="px-4 py-2.5 rounded-xl bg-[#5D20B3] text-white hover:bg-[#4A1A90] transition-colors text-sm font-semibold shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm">
          {saveMessage}
        </div>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your account identity and workspace details.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <input
                  value={settings.fullName}
                  onChange={(event) => updateSetting("fullName", event.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-[#5D20B3]"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-gray-700">Email Address</span>
                <input
                  value={settings.email}
                  onChange={(event) => updateSetting("email", event.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-200 focus:border-[#5D20B3]"
                />
              </label>

            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Interview Operations</h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure defaults used across interviews and monitoring tools.
            </p>
            <div className="space-y-4 mt-5">
              <ToggleRow
                title="Auto-record interviews"
                description="Automatically record every session once participants join."
                checked={settings.autoRecordInterviews}
                onChange={(value) => updateSetting("autoRecordInterviews", value)}
              />
              <ToggleRow
                title="AI interview summary"
                description="Generate post-interview summary cards for sessions."
                checked={settings.aiSummaryEnabled}
                onChange={(value) => updateSetting("aiSummaryEnabled", value)}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Control when and how you receive platform updates.
            </p>
            <div className="space-y-4 mt-5">
              <ToggleRow
                title="Email alerts"
                description="Receive important system updates by email."
                checked={settings.emailAlerts}
                onChange={(value) => updateSetting("emailAlerts", value)}
              />
              <ToggleRow
                title="Interview reminders"
                description="Get reminders before upcoming interviews."
                checked={settings.interviewReminders}
                onChange={(value) => updateSetting("interviewReminders", value)}
              />
              <ToggleRow
                title="Weekly digest"
                description="Receive weekly summary for hiring activity."
                checked={settings.weeklyDigest}
                onChange={(value) => updateSetting("weeklyDigest", value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sign out from all devices to secure this account immediately.
            </p>
            <button className="mt-4 w-full rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
              Sign out from all devices
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function ToggleRow({ title, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-[#5D20B3]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
