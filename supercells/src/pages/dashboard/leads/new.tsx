// src/pages/dashboard/leads/new.tsx
import Head from "next/head";
import DashboardLayout from "~/components/layout/DashboardLayout";
import LeadForm from "~/components/leads/LeadForm";

export default function NewLeadPage() {
  return (
    <>
      <Head>
        <title>Add New Lead - SuperCells</title>
      </Head>
      <DashboardLayout>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Add New Lead</h1>
          <p className="mt-1 text-gray-400">Create a new lead to track and monitor</p>
        </div>

        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <LeadForm />
        </div>
      </DashboardLayout>
    </>
  );
}