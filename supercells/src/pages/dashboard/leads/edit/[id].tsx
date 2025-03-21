// src/pages/dashboard/leads/edit/[id].tsx
import { useRouter } from "next/router";
import Head from "next/head";
import DashboardLayout from "~/components/layout/DashboardLayout";
import LeadForm from "~/components/leads/LeadForm";
import { api } from "~/utils/api";

export default function EditLeadPage() {
  const router = useRouter();
  const { id } = router.query;
  const leadId = id ? parseInt(id as string) : undefined;
  
  const { data: lead, isLoading, error } = api.leads.getById.useQuery(
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

  return (
    <>
      <Head>
        <title>Edit Lead - {lead.name} - SuperCells</title>
      </Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Edit Lead</h1>
          <p className="mt-1 text-gray-400">Update lead information for {lead.name}</p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <LeadForm initialData={lead} isEditing={true} leadId={lead.id} />
        </div>
      </DashboardLayout>
    </>
  );
}