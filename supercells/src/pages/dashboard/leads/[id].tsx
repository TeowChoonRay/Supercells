// src/pages/dashboard/leads/[id].tsx
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import DashboardLayout from "~/components/layout/DashboardLayout";
import LeadAnalysis from "~/components/leads/LeadAnalysis";
import { api } from "~/utils/api";

export default function LeadDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const leadId = id ? parseInt(id as string) : undefined;
  
  const { data: lead, isLoading, error, refetch } = api.leads.getById.useQuery(
    { id: leadId as number },
    { enabled: !!leadId }
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-400">Loading lead data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout>
        <div className="flex h-full flex-col items-center justify-center">
          <div className="text-red-400">Error loading lead: {error?.message || "Lead not found"}</div>
          <button
            onClick={() => router.push("/dashboard/leads")}
            className="mt-4 rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
          >
            Back to Leads
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Parse metadata if it exists
  const metadata = lead.metadata ? 
    (typeof lead.metadata === 'string' ? 
      JSON.parse(lead.metadata) : 
      lead.metadata as Record<string, unknown>) : 
    {};

  return (
    <>
      <Head>
        <title>{lead.name} - Lead Details - SuperCells</title>
      </Head>
      <DashboardLayout>
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Link 
                href="/dashboard/leads" 
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-white">{lead.name}</h1>
            </div>
            <p className="mt-1 text-gray-400">
              Lead details and analysis
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/leads/edit/${lead.id}`}
              className="flex items-center gap-2 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-white shadow-lg transition-all hover:bg-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Edit Lead
            </Link>
          </div>
        </div>

        {/* Main content - two columns on larger screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column - Lead details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
              <div className="border-b border-gray-700 px-6 py-4">
                <h2 className="text-lg font-medium text-white">Lead Information</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Company Name</h3>
                    <p className="mt-1 text-white">{lead.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Website</h3>
                    <a 
                      href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-blue-400 hover:text-blue-300"
                    >
                      {lead.website}
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Industry</h3>
                    <p className="mt-1 text-white">{lead.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Company Size</h3>
                    <p className="mt-1 text-white">{lead.size || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Created</h3>
                    <p className="mt-1 text-white">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Last Updated</h3>
                    <p className="mt-1 text-white">
                      {lead.updatedAt ? new Date(lead.updatedAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Evidence Card (if available) */}
            {lead.aiEvidence && (
              <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
                <div className="border-b border-gray-700 px-6 py-4">
                  <h2 className="text-lg font-medium text-white">AI Interest Evidence</h2>
                </div>
                <div className="p-6">
                  <div className="rounded-md bg-gray-700 p-4">
                    <p className="whitespace-pre-line text-gray-300">{lead.aiEvidence}</p>
                  </div>
                  
                  {metadata.notes && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-400">Analysis Notes</h3>
                      <p className="mt-1 text-gray-300">{metadata.notes as string}</p>
                    </div>
                  )}
                  
                  {Array.isArray(metadata.scannedUrls) && metadata.scannedUrls.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-400">Scanned URLs</h3>
                      <ul className="mt-1 list-disc space-y-1 pl-5">
                        {(metadata.scannedUrls as string[]).map((url, index) => (
                          <li key={index}>
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              {url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Run AI Analysis card */}
            <LeadAnalysis 
              leadId={lead.id} 
              leadName={lead.name} 
              website={lead.website}
              onAnalysisComplete={() => refetch()}
            />
          </div>

          {/* Right column - Lead stats and actions */}
          <div className="space-y-6">
            {/* Lead Score Card */}
            <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
              <div className="border-b border-gray-700 px-6 py-4">
                <h2 className="text-lg font-medium text-white">Lead Qualification</h2>
              </div>
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6 h-36 w-36">
                    <svg viewBox="0 0 36 36" className="h-full w-full">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#4A5568"
                        strokeWidth="3"
                      />
                      {/* Foreground circle - the actual progress */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke={lead.leadScore && lead.leadScore > 7
                          ? "#68D391" // Green
                          : lead.leadScore && lead.leadScore > 4
                          ? "#F6E05E" // Yellow
                          : "#FC8181" // Red
                        }
                        strokeWidth="3"
                        strokeDasharray={`${lead.leadScore ? (lead.leadScore / 10) * 100 : 0}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-white">{lead.leadScore ?? 0}</span>
                      <span className="text-sm text-gray-400">Lead Score</span>
                    </div>
                  </div>

                  <div className="mb-4 grid w-full grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-700 p-3 text-center">
                      <span className="block text-sm text-gray-400">AI Interest</span>
                      <span className="text-2xl font-bold text-white">{lead.aiInterestLevel ?? 0}</span>
                      <span className="text-xs text-gray-400">/10</span>
                    </div>
                    <div className="rounded-lg bg-gray-700 p-3 text-center">
                      <span className="block text-sm text-gray-400">Status</span>
                      <span className={`font-medium ${lead.isQualified ? 'text-green-400' : 'text-gray-300'}`}>
                        {lead.isQualified ? 'Qualified' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full rounded-lg bg-gray-700 p-3">
                    <span className="block text-center text-sm text-gray-400">Last Scan</span>
                    <span className="block text-center text-lg font-medium text-white">
                      {lead.lastScanned 
                        ? new Date(lead.lastScanned).toLocaleDateString() + ' at ' + 
                          new Date(lead.lastScanned).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card */}
            <div className="overflow-hidden rounded-lg bg-gray-800 shadow">
              <div className="border-b border-gray-700 px-6 py-4">
                <h2 className="text-lg font-medium text-white">Actions</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    Send to CRM
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                    </svg>
                    Send Email Sequence
                  </button>
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    Generate Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}