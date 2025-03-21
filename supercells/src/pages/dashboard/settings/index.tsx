// src/pages/dashboard/settings/index.tsx
import { useState } from "react";
import Head from "next/head";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "~/components/layout/DashboardLayout";

export default function SettingsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    newLeads: true,
    leadQualification: true,
    weeklyDigest: false,
  });

  const [integration, setIntegration] = useState({
    hubspotEnabled: false,
    hubspotApiKey: "",
    salesforceEnabled: false,
    salesforceApiKey: "",
  });

  const [aiSettings, setAiSettings] = useState({
    scanFrequency: "daily",
    minLeadScore: 5,
    autoQualifyThreshold: 7,
  });

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleIntegrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setIntegration(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAiSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setAiSettings(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save these settings to the database
    alert("Settings saved successfully");
  };

  return (
    <>
      <Head>
        <title>Settings - SuperCells</title>
      </Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
          <p className="mt-1 text-gray-400">Manage your account and application preferences</p>
        </div>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-6 py-4">
              <h2 className="text-lg font-medium text-white">User Profile</h2>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-full">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt={user.fullName || 'User'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-700 text-2xl font-semibold text-white">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{user?.fullName || 'User'}</h3>
                  <p className="text-gray-400">{user?.primaryEmailAddress?.emailAddress || 'No email available'}</p>
                </div>
              </div>
              <div className="mt-6 flex">
                <a 
                  href="https://accounts.clerk.dev/user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
                >
                  Manage Account
                </a>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-6 py-4">
              <h2 className="text-lg font-medium text-white">Notification Settings</h2>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="emailAlerts" className="font-medium text-white">Email Alerts</label>
                    <p className="text-sm text-gray-400">Receive email notifications</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      name="emailAlerts"
                      checked={notifications.emailAlerts}
                      onChange={handleNotificationChange}
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="newLeads" className="font-medium text-white">New Leads</label>
                    <p className="text-sm text-gray-400">Get notified when new leads are found</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      name="newLeads"
                      checked={notifications.newLeads}
                      onChange={handleNotificationChange}
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="leadQualification" className="font-medium text-white">Lead Qualification</label>
                    <p className="text-sm text-gray-400">Get notified when leads are qualified</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      name="leadQualification"
                      checked={notifications.leadQualification}
                      onChange={handleNotificationChange}
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="weeklyDigest" className="font-medium text-white">Weekly Digest</label>
                    <p className="text-sm text-gray-400">Receive a weekly summary of lead activities</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input 
                      type="checkbox" 
                      name="weeklyDigest"
                      checked={notifications.weeklyDigest}
                      onChange={handleNotificationChange}
                      className="peer sr-only" 
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* CRM Integration */}
          <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-6 py-4">
              <h2 className="text-lg font-medium text-white">CRM Integration</h2>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-6">
                {/* HubSpot */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="hubspotEnabled" className="font-medium text-white">HubSpot</label>
                      <p className="text-sm text-gray-400">Connect to your HubSpot account</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        name="hubspotEnabled"
                        checked={integration.hubspotEnabled}
                        onChange={handleIntegrationChange}
                        className="peer sr-only" 
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  
                  {integration.hubspotEnabled && (
                    <div>
                      <label htmlFor="hubspotApiKey" className="block text-sm font-medium text-gray-300">
                        HubSpot API Key
                      </label>
                      <input
                        type="password"
                        id="hubspotApiKey"
                        name="hubspotApiKey"
                        value={integration.hubspotApiKey}
                        onChange={handleIntegrationChange}
                        className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Enter your HubSpot API key"
                      />
                    </div>
                  )}
                </div>

                {/* Salesforce */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label htmlFor="salesforceEnabled" className="font-medium text-white">Salesforce</label>
                      <p className="text-sm text-gray-400">Connect to your Salesforce account</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input 
                        type="checkbox" 
                        name="salesforceEnabled"
                        checked={integration.salesforceEnabled}
                        onChange={handleIntegrationChange}
                        className="peer sr-only" 
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-500 peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>
                  
                  {integration.salesforceEnabled && (
                    <div>
                      <label htmlFor="salesforceApiKey" className="block text-sm font-medium text-gray-300">
                        Salesforce API Key
                      </label>
                      <input
                        type="password"
                        id="salesforceApiKey"
                        name="salesforceApiKey"
                        value={integration.salesforceApiKey}
                        onChange={handleIntegrationChange}
                        className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none"
                        placeholder="Enter your Salesforce API key"
                      />
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* AI Settings */}
          <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
            <div className="border-b border-gray-700 px-6 py-4">
              <h2 className="text-lg font-medium text-white">AI Scanning Settings</h2>
            </div>
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div>
                  <label htmlFor="scanFrequency" className="block text-sm font-medium text-gray-300">
                    Scan Frequency
                  </label>
                  <select
                    id="scanFrequency"
                    name="scanFrequency"
                    value={aiSettings.scanFrequency}
                    onChange={handleAiSettingsChange}
                    className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="manual">Manual Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="minLeadScore" className="block text-sm font-medium text-gray-300">
                    Minimum Lead Score (0-10)
                  </label>
                  <input
                    type="range"
                    id="minLeadScore"
                    name="minLeadScore"
                    min="0"
                    max="10"
                    value={aiSettings.minLeadScore}
                    onChange={handleAiSettingsChange}
                    className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>Current: {aiSettings.minLeadScore}</span>
                    <span>10</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="autoQualifyThreshold" className="block text-sm font-medium text-gray-300">
                    Auto-Qualify Threshold (0-10)
                  </label>
                  <input
                    type="range"
                    id="autoQualifyThreshold"
                    name="autoQualifyThreshold"
                    min="0"
                    max="10"
                    value={aiSettings.autoQualifyThreshold}
                    onChange={handleAiSettingsChange}
                    className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>Current: {aiSettings.autoQualifyThreshold}</span>
                    <span>10</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="rounded-md bg-gradient-to-r from-orange-300 via-pink-500 to-purple-400 px-6 py-2 font-medium text-white shadow-lg transition-all hover:from-orange-400 hover:via-pink-600 hover:to-purple-500"
            >
              Save Settings
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}