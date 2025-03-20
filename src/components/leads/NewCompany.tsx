'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { searchCompany } from '@/lib/api';

export function NewCompany() {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setIsSearching(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, search for company information
      const companyInfo = await searchCompany(companyName);

      // Then, create the lead with the found information
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            company_name: companyName,
            user_id: user.id,
            status: 'New Lead',
            website: companyInfo.website,
            description: companyInfo.description,
            location: companyInfo.location,
            employees: companyInfo.employees
          }
        ]);

      if (error) throw error;

      toast({
        title: "Company added",
        description: "New company has been added successfully with AI-gathered information",
      });

      router.push('/leads');
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        variant: "destructive",
        title: "Error adding company",
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/leads">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-200">Add New Company</h1>
          <p className="text-zinc-400 mt-2">
            Enter the company name and we'll automatically gather information about it.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-zinc-400">
                Company Name
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="company_name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="pl-9 bg-zinc-800/50 border-zinc-700 text-zinc-200"
                  placeholder="Enter company name"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            disabled={isSubmitting || !companyName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSearching ? "Searching..." : "Adding..."}
              </>
            ) : (
              "Add Company"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}