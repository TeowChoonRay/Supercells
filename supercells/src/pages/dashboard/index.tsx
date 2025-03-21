// src/pages/dashboard/index.tsx
import Head from "next/head";
import { useUser } from "@clerk/nextjs";
import DashboardLayout from "~/components/layout/DashboardLayout";
import { api } from "~/utils/api";

export default function Dashboard() {
  const { user } = useUser();
  const { data: leads, isLoading } = api.leads.getAll.useQuery();
  const { data: qualifiedLeads } = api.leads.getQualified.useQuery();

  // Dashboard stats
  const stats = [
    {
      name: "Total Leads",
      value: leads?.length ?? 0,
      icon: (
        <svg className="h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      name: "Qualified Leads",
      value: qualifiedLeads?.length ?? 0,
      icon: (
        <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      ),
    },
    {
      name: "Average Score",
      value: leads?.length ? (leads.reduce((acc, lead) => acc + (lead.leadScore ?? 0), 0) / leads.length).toFixed(1) : "0",
      icon: (
        <svg className="h-6 w-6 text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
    {
      name: "Last Scan",
      value: leads?.length ? new Date(Math.max(...leads.map(lead => new Date(lead.lastScanned ?? 0).getTime()))).toLocaleDateString() : "Never",
      icon: (
        <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Dashboard - SuperCells</title>
      </Head>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Welcome message */}
          <div className="flex flex-col justify-between gap-4 rounded-lg bg-gray-800 p-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="mt-1 text-gray-300">
                Here's what's happening with your lead generation today.
              </p>
            </div>
            <button className="flex items-center justify-center gap-2 self-start rounded-lg bg-gradient-to-r from-orange-300 via-pink-500 to-purple-400 px-4 py-2 font-medium text-white shadow-lg transition-all hover:from-orange-400 hover:via-pink-600 hover:to-purple-500 md:self-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add New Lead
            </button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="rounded-lg bg-gray-800 p-6 shadow">
                <div className="flex items-center">
                  <div className="rounded-md bg-gray-700 p-3">
                    {stat.icon}
                  </div>
                  <div className="ml-5">
                    <dt className="truncate text-sm font-medium text-gray-400">
                      {stat.name}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                      {stat.value}
                    </dd>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Leads */}
          <div className="rounded-lg bg-gray-800 p-6 shadow">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">
                Recent Leads
              </h2>
              <a href="/dashboard/leads" className="text-sm font-medium text-purple-400 hover:text-purple-300">
                View all
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Industry
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      AI Interest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                        Loading...
                      </td>
                    </tr>
                  ) : leads && leads.length > 0 ? (
                    leads.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-700">
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-white">
                          {lead.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {lead.industry || 'Unknown'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {lead.aiInterestLevel}/10
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            lead.leadScore && lead.leadScore > 7 
                              ? 'bg-green-900/50 text-green-300'
                              : lead.leadScore && lead.leadScore > 4
                                ? 'bg-yellow-900/50 text-yellow-300'
                                : 'bg-red-900/50 text-red-300'
                          }`}>
                            {lead.leadScore}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            lead.isQualified
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {lead.isQualified ? 'Qualified' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                        No leads found. Add your first lead to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}