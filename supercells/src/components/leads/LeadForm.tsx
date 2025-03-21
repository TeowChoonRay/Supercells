// src/components/leads/LeadForm.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import type { insertCompanySchema } from "~/db/schema";
import type { z } from "zod";

type FormData = z.infer<typeof insertCompanySchema>;
type LeadFormProps = {
  initialData?: Partial<FormData>;
  isEditing?: boolean;
  leadId?: number;
};

export default function LeadForm({ initialData, isEditing = false, leadId }: LeadFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FormData>>(
    initialData || {
      name: "",
      website: "",
      industry: "",
      size: "",
      aiInterestLevel: 0,
      leadScore: 0,
      isQualified: false,
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutations
  const createLead = api.leads.create.useMutation({
    onSuccess: () => {
      router.push("/dashboard/leads");
    },
  });

  const updateLead = api.leads.update.useMutation({
    onSuccess: () => {
      router.push("/dashboard/leads");
    },
  });

  // Form handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" 
        ? (e.target as HTMLInputElement).checked 
        : type === "number" 
          ? Number(value) 
          : value,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Company name is required";
    }
    
    if (!formData.website?.trim()) {
      newErrors.website = "Website URL is required";
    } else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = "Please enter a valid URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && leadId) {
        await updateLead.mutateAsync({
          id: leadId,
          data: formData as FormData,
        });
      } else {
        await createLead.mutateAsync(formData as FormData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Company Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Company Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? "border-red-500" : "border-gray-600"
            } bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none`}
            placeholder="e.g. Acme Corporation"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-300">
            Website URL *
          </label>
          <input
            type="text"
            id="website"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.website ? "border-red-500" : "border-gray-600"
            } bg-gray-700 px-3 py-2 text-white placeholder-gray-400 shadow-sm focus:border-purple-500 focus:outline-none`}
            placeholder="e.g. https://acme.com"
          />
          {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
        </div>

        {/* Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-300">
            Industry
          </label>
          <select
            id="industry"
            name="industry"
            value={formData.industry || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select Industry</option>
            <option value="Technology">Technology</option>
            <option value="Finance">Finance</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Retail">Retail</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Media">Media</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="size" className="block text-sm font-medium text-gray-300">
            Company Size
          </label>
          <select
            id="size"
            name="size"
            value={formData.size || ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select Size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="501-1000">501-1000 employees</option>
            <option value="1001+">1001+ employees</option>
          </select>
        </div>

        {/* AI Interest Level */}
        <div>
          <label htmlFor="aiInterestLevel" className="block text-sm font-medium text-gray-300">
            AI Interest Level (0-10)
          </label>
          <input
            type="number"
            id="aiInterestLevel"
            name="aiInterestLevel"
            min="0"
            max="10"
            value={formData.aiInterestLevel || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Lead Score */}
        <div>
          <label htmlFor="leadScore" className="block text-sm font-medium text-gray-300">
            Lead Score (0-10)
          </label>
          <input
            type="number"
            id="leadScore"
            name="leadScore"
            min="0"
            max="10"
            value={formData.leadScore || 0}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* AI Evidence */}
      <div>
        <label htmlFor="aiEvidence" className="block text-sm font-medium text-gray-300">
          AI Evidence / Notes
        </label>
        <textarea
          id="aiEvidence"
          name="aiEvidence"
          rows={4}
          value={formData.aiEvidence || ""}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none"
          placeholder="Evidence of AI interest or general notes about this lead"
        />
      </div>

      {/* Qualified Status */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isQualified"
          name="isQualified"
          checked={!!formData.isQualified}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-500 focus:ring-purple-500"
        />
        <label htmlFor="isQualified" className="ml-2 block text-sm font-medium text-gray-300">
          Mark as Qualified Lead
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-gray-600 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-gradient-to-r from-orange-300 via-pink-500 to-purple-400 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-orange-400 hover:via-pink-600 hover:to-purple-500"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}