import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { scrapeAndAnalyzeCompany, updateLeadScore } from '@/lib/openai';

export default function NewCompany() {
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setIsAnalyzing(true);

    try {
      // Analyze company using OpenAI
      const analysis = await scrapeAndAnalyzeCompany(companyName);

      // Create the lead with the analyzed information
      const { data: lead, error: createError } = await supabase
        .from('leads')
        .insert([
          {
            company_name: companyName,
            user_id: user.id,
            status: analysis.isQualified ? 'Qualified' : 'New Lead',
            website: analysis.website,
            description: analysis.description,
            location: analysis.location,
            employees: analysis.employees,
            industry: analysis.industry,
            lead_score: analysis.leadScore,
            ai_interest_level: analysis.aiInterestLevel,
            ai_evidence: analysis.aiEvidence,
            analysis_notes: analysis.notes,
            last_analyzed_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: "Company added",
        description: "New company has been analyzed and added successfully",
      });

      navigate('/leads');
    } catch (error) {
      console.error('Error creating company:', error);
      toast({
        variant: "destructive",
        title: "Error adding company",
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      
      <div className="flex-1 p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-zinc-200"
              onClick={() => navigate('/leads')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-200">Add New Company</h1>
              <p className="text-zinc-400 mt-2">
                Enter the company name and we'll automatically research and analyze it using AI.
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
                    {isAnalyzing ? "Analyzing..." : "Adding..."}
                  </>
                ) : (
                  "Add Company"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}