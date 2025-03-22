import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, MapPin, Mail, Globe, ArrowUpRight, Loader2, Target, Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { scrapeAndAnalyzeCompany } from '@/lib/openai';

interface Lead {
  id: string;
  company_name: string;
  industry: string | null;
  location: string | null;
  employees: string | null;
  website: string | null;
  logo_url: string | null;
  description: string | null;
  lead_score: number | null;
}

interface CompanyAnalysis {
  website?: string;
  description?: string;
  location?: string;
  employees?: string;
  industry?: string;
  linkedinUrl?: string;
  aiInterestLevel: number;
  aiEvidence: string;
  leadScore: number;
  isQualified: boolean;
  notes: string;
  recentActivity: string[];
  decisionMaker?: string;
  compatibilityMetrics: {
    companyProfileMatch: number;
    relationshipInfluence: number;
    budgetAlignment: number;
    businessNeedsMatch: number;
  };
}

const getProgressColor = (value: number): string => {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 60) return 'bg-blue-500';
  if (value >= 40) return 'bg-yellow-500';
  if (value >= 20) return 'bg-orange-500';
  return 'bg-red-500';
};

export default function LeadDetails() {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchLeadData = async () => {
      if (!leadId) return;

      try {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .single();

        if (leadError) throw leadError;

        // If website exists, try to get logo from Clearbit
        if (leadData.website && !leadData.logo_url) {
          try {
            const domain = new URL(leadData.website).hostname;
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            leadData.logo_url = logoUrl;
          } catch (error) {
            console.error('Error getting logo:', error);
          }
        }

        setLead(leadData);

        // Automatically analyze when the page loads
        handleAnalyze(leadData.company_name);
      } catch (error) {
        console.error('Error fetching lead data:', error);
        toast({
          variant: "destructive",
          title: "Error loading lead",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadData();
  }, [leadId]);

  const handleAnalyze = async (companyName: string) => {
    setIsAnalyzing(true);
    try {
      const result = await scrapeAndAnalyzeCompany(companyName);
      setAnalysis(result);
      
      toast({
        title: "Analysis complete",
        description: "Company information has been updated",
      });
    } catch (error) {
      console.error('Error analyzing company:', error);
      toast({
        variant: "destructive",
        title: "Error analyzing company",
        description: "Please try again later",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <AppHeader />
        <div className="flex items-center justify-center flex-1">
          <p className="text-zinc-400">Lead not found</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      
      <div className="flex-1 p-4 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-200"
            onClick={() => navigate('/leads')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-200">{lead.company_name}</h1>
            <p className="text-zinc-400">{analysis?.industry || lead.industry || 'Industry not specified'}</p>
          </div>
          <Button
            onClick={() => handleAnalyze(lead.company_name)}
            disabled={isAnalyzing}
            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Company Card */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden">
              <div className="aspect-video relative bg-white">
                {lead.logo_url ? (
                  <img
                    src={lead.logo_url}
                    alt={lead.company_name}
                    className="w-full h-full object-contain p-8"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
                      (e.target as HTMLImageElement).className = 'w-full h-full object-cover';
                      (e.target as HTMLImageElement).parentElement!.className = 'aspect-video relative bg-zinc-900';
                    }}
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                    alt={lead.company_name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-zinc-200">Description</h2>
                  <p className="text-zinc-400">{analysis?.description || lead.description || 'No description available.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Building2 className="h-4 w-4" />
                      <span>Industry</span>
                    </div>
                    <p className="text-zinc-200 mt-1">{analysis?.industry || lead.industry || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Users className="h-4 w-4" />
                      <span>Company Size</span>
                    </div>
                    <p className="text-zinc-200 mt-1">{analysis?.employees || lead.employees || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-zinc-200 mt-1">{analysis?.location || lead.location || 'Not specified'}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </div>
                    {(analysis?.website || lead.website) ? (
                      <a
                        href={analysis?.website || lead.website || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-400 mt-1 flex items-center gap-1"
                      >
                        Visit site
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-zinc-200 mt-1">Not specified</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Maker */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">Decision Maker and Role</h2>
              {analysis?.decisionMaker ? (
                <p className="text-zinc-200">{analysis.decisionMaker}</p>
              ) : (
                <p className="text-zinc-400">No decision maker information available</p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">Recent AI-related Activity</h2>
              {analysis?.aiEvidence ? (
                <div className="space-y-4">
                  <p className="text-zinc-400">{analysis.aiEvidence}</p>
                  {analysis.recentActivity.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-zinc-300 mb-2">Recent Updates</h3>
                      <ul className="space-y-2">
                        {analysis.recentActivity.map((activity, index) => (
                          <li key={index} className="text-sm text-zinc-400">• {activity}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.notes && (
                    <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg">
                      <p className="text-sm text-zinc-400">{analysis.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-zinc-400">No recent AI-related activity found</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Compatibility Test */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-6">Compatibility Test</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Company Profile Match</span>
                    <span className={`font-medium ${
                      getProgressColor(analysis?.compatibilityMetrics.companyProfileMatch || 0)
                        .replace('bg-', 'text-')
                    }`}>
                      {analysis?.compatibilityMetrics.companyProfileMatch || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis?.compatibilityMetrics.companyProfileMatch || 0} 
                    className="h-2 bg-zinc-800"
                    indicatorClassName={`h-2 ${getProgressColor(analysis?.compatibilityMetrics.companyProfileMatch || 0)}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Relationship & Influence</span>
                    <span className={`font-medium ${
                      getProgressColor(analysis?.compatibilityMetrics.relationshipInfluence || 0)
                        .replace('bg-', 'text-')
                    }`}>
                      {analysis?.compatibilityMetrics.relationshipInfluence || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis?.compatibilityMetrics.relationshipInfluence || 0}
                    className="h-2 bg-zinc-800"
                    indicatorClassName={`h-2 ${getProgressColor(analysis?.compatibilityMetrics.relationshipInfluence || 0)}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Budget Alignment</span>
                    <span className={`font-medium ${
                      getProgressColor(analysis?.compatibilityMetrics.budgetAlignment || 0)
                        .replace('bg-', 'text-')
                    }`}>
                      {analysis?.compatibilityMetrics.budgetAlignment || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis?.compatibilityMetrics.budgetAlignment || 0}
                    className="h-2 bg-zinc-800"
                    indicatorClassName={`h-2 ${getProgressColor(analysis?.compatibilityMetrics.budgetAlignment || 0)}`}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Business Needs Match</span>
                    <span className={`font-medium ${
                      getProgressColor(analysis?.compatibilityMetrics.businessNeedsMatch || 0)
                        .replace('bg-', 'text-')
                    }`}>
                      {analysis?.compatibilityMetrics.businessNeedsMatch || 0}%
                    </span>
                  </div>
                  <Progress 
                    value={analysis?.compatibilityMetrics.businessNeedsMatch || 0}
                    className="h-2 bg-zinc-800"
                    indicatorClassName={`h-2 ${getProgressColor(analysis?.compatibilityMetrics.businessNeedsMatch || 0)}`}
                  />
                </div>
              </div>
            </div>

            {/* Lead Score Card */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">Lead Score</h2>
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  analysis?.leadScore >= 80 ? 'bg-emerald-500/20 text-emerald-500' :
                  analysis?.leadScore >= 60 ? 'bg-blue-500/20 text-blue-500' :
                  analysis?.leadScore >= 40 ? 'bg-yellow-500/20 text-yellow-500' :
                  analysis?.leadScore >= 20 ? 'bg-orange-500/20 text-orange-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {analysis?.leadScore || lead.lead_score || '?'}
                </div>
                <div>
                  <p className="text-zinc-200 font-medium">
                    {analysis?.leadScore >= 80 ? 'Exceptional Match' :
                     analysis?.leadScore >= 60 ? 'Strong Match' :
                     analysis?.leadScore >= 40 ? 'Good Match' :
                     analysis?.leadScore >= 20 ? 'Fair Match' :
                     'Poor Match'}
                  </p>
                  <p className="text-sm text-zinc-400">AI Interest Level: {analysis?.aiInterestLevel || 'N/A'}/100</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-zinc-200 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  onClick={() => navigate(`/email-editor/${lead.id}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                {analysis?.linkedinUrl && (
                  <Button 
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
                    onClick={() => window.open(analysis.linkedinUrl, '_blank')}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    View LinkedIn
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}