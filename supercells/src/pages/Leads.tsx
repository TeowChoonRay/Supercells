import { useState, useEffect } from 'react';
import { Plus, Filter, Building2, Users, MapPin, Mail, Globe, ArrowUpRight, MoreHorizontal, Loader2, Target, X, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from '@/components/AppHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { findLeads, findHighPotentialLead } from '@/lib/openai';

interface Lead {
  id: string;
  company_name: string;
  industry: string | null;
  location: string | null;
  employees: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  last_contact: string | null;
  description: string | null;
  lead_score: number | null;
  logo_url: string | null;
}

interface Filters {
  industry: string | null;
  location: string | null;
  employeeRange: string | null;
  minLeadScore: number;
}

interface FindLeadsFilters {
  industry: string;
  location: string;
  avatarType: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinding, setIsFinding] = useState(false);
  const [isEngaging, setIsEngaging] = useState(false);
  const [showFindLeadsDialog, setShowFindLeadsDialog] = useState(false);
  const [findLeadsFilters, setFindLeadsFilters] = useState<FindLeadsFilters>({
    industry: '',
    location: '',
    avatarType: 'brain'
  });
  const [filters, setFilters] = useState<Filters>({
    industry: null,
    location: null,
    employeeRange: null,
    minLeadScore: 0
  });
  const [uniqueIndustries, setUniqueIndustries] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // For each lead, ensure it has a logo URL
        const leadsWithLogos = data?.map(lead => {
          let logoUrl = lead.logo_url;
          if (!logoUrl && lead.website) {
            try {
              // Ensure website has protocol
              const websiteUrl = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`;
              const url = new URL(websiteUrl);
              logoUrl = `https://logo.clearbit.com/${url.hostname}`;
            } catch (e) {
              console.warn('Invalid website URL:', lead.website);
              logoUrl = null;
            }
          }
          return {
            ...lead,
            logo_url: logoUrl
          };
        }) || [];

        setLeads(leadsWithLogos);
        setFilteredLeads(leadsWithLogos);

        // Extract unique values for filters
        const industries = [...new Set(leadsWithLogos.map(lead => lead.industry).filter(Boolean))];
        const locations = [...new Set(leadsWithLogos.map(lead => lead.location).filter(Boolean))];
        
        setUniqueIndustries(industries);
        setUniqueLocations(locations);
      } catch (error) {
        console.error('Error fetching leads:', error);
        toast({
          variant: "destructive",
          title: "Error loading leads",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [user]);

  useEffect(() => {
    // Apply filters
    let filtered = [...leads];

    if (filters.industry) {
      filtered = filtered.filter(lead => lead.industry === filters.industry);
    }

    if (filters.location) {
      filtered = filtered.filter(lead => lead.location === filters.location);
    }

    if (filters.employeeRange) {
      filtered = filtered.filter(lead => {
        if (!lead.employees) return false;
        const [min, max] = filters.employeeRange.split('-').map(Number);
        const leadEmployees = parseInt(lead.employees.split('-')[0]);
        return leadEmployees >= min && (!max || leadEmployees <= max);
      });
    }

    if (filters.minLeadScore > 0) {
      filtered = filtered.filter(lead => (lead.lead_score || 0) >= filters.minLeadScore);
    }

    setFilteredLeads(filtered);
  }, [filters, leads]);

  const handleFindLeads = async () => {
    if (!user || !findLeadsFilters.industry || !findLeadsFilters.location) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both industry and location",
      });
      return;
    }

    setIsFinding(true);
    try {
      const suggestions = await findLeads(
        findLeadsFilters.industry,
        findLeadsFilters.location,
        findLeadsFilters.avatarType
      );
      
      // Add each suggestion as a new lead
      for (const suggestion of suggestions) {
        const { data: lead, error } = await supabase
          .from('leads')
          .insert([{
            user_id: user.id,
            company_name: suggestion.companyName,
            industry: suggestion.industry,
            location: suggestion.location,
            website: suggestion.website,
            description: suggestion.description,
            employees: suggestion.employees,
            lead_score: suggestion.leadScore,
            status: 'New Lead',
            ai_evidence: suggestion.aiEvidence
          }])
          .select()
          .single();

        if (error) {
          console.error('Error adding lead:', error);
          continue;
        }
      }

      toast({
        title: "Leads found!",
        description: `Added ${suggestions.length} new leads to your list`,
      });

      // Refresh leads list
      const { data: newLeads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (newLeads) {
        setLeads(newLeads);
        setFilteredLeads(newLeads);
      }

      setShowFindLeadsDialog(false);
    } catch (error) {
      console.error('Error finding leads:', error);
      toast({
        variant: "destructive",
        title: "Error finding leads",
        description: "Please try again later",
      });
    } finally {
      setIsFinding(false);
    }
  };

  const handleEngageLeads = async () => {
    if (!user) return;

    setIsEngaging(true);
    try {
      const result = await findHighPotentialLead(user.id);
      
      if (!result) {
        toast({
          variant: "destructive",
          title: "No high potential leads found",
          description: "Please try again later",
        });
        return;
      }

      // Navigate to email editor with the draft
      const { data: lead } = await supabase
        .from('leads')
        .select('id')
        .eq('company_name', result.companyName)
        .single();

      if (lead) {
        navigate(`/email-editor/${lead.id}?type=email`);
      }

      toast({
        title: "High potential lead found!",
        description: "Opening email editor with draft message",
      });
    } catch (error) {
      console.error('Error engaging leads:', error);
      toast({
        variant: "destructive",
        title: "Error engaging leads",
        description: "Please try again later",
      });
    } finally {
      setIsEngaging(false);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;

      setLeads(leads.filter(lead => lead.id !== leadId));
      setFilteredLeads(filteredLeads.filter(lead => lead.id !== leadId));

      toast({
        title: "Lead deleted",
        description: "The lead has been removed from your list",
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        variant: "destructive",
        title: "Error deleting lead",
        description: "Please try again later",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'new lead':
        return 'bg-blue-500/10 text-blue-500';
      case 'qualified':
        return 'bg-purple-500/10 text-purple-500';
      case 'closed':
        return 'bg-zinc-500/10 text-zinc-500';
      case 'lost':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-zinc-500/10 text-zinc-500';
    }
  };

  const getLeadScoreColor = (score: number | null) => {
    if (score === null) return 'bg-zinc-500/10 text-zinc-500';
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-500';
    if (score >= 60) return 'bg-blue-500/10 text-blue-500';
    if (score >= 40) return 'bg-yellow-500/10 text-yellow-500';
    if (score >= 20) return 'bg-orange-500/10 text-orange-500';
    return 'bg-red-500/10 text-red-500';
  };

  const clearFilters = () => {
    setFilters({
      industry: null,
      location: null,
      employeeRange: null,
      minLeadScore: 0
    });
  };

  const employeeRanges = [
    { label: '1-10 employees', value: '1-10' },
    { label: '11-50 employees', value: '11-50' },
    { label: '51-200 employees', value: '51-200' },
    { label: '201-500 employees', value: '201-500' },
    { label: '501+ employees', value: '501-999999' }
  ];

  const hasActiveFilters = filters.industry || filters.location || filters.employeeRange || filters.minLeadScore > 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      <div className="flex-1 p-4 pb-24">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-zinc-200">Company Leads</h1>
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    {hasActiveFilters && (
                      <span className="ml-2 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-zinc-900 border-zinc-800">
                  <SheetHeader>
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-zinc-200">Filter Leads</SheetTitle>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearFilters}
                          className="text-zinc-400 hover:text-zinc-200"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    {/* Industry Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">
                        Industry
                      </label>
                      <Select
                        value={filters.industry || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          industry: value === 'all' ? null : value 
                        }))}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">All industries</SelectItem>
                          {uniqueIndustries.map(industry => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">
                        Location
                      </label>
                      <Select
                        value={filters.location || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          location: value === 'all' ? null : value 
                        }))}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">All locations</SelectItem>
                          {uniqueLocations.map(location => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Employee Range Filter */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">
                        Company Size
                      </label>
                      <Select
                        value={filters.employeeRange || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ 
                          ...prev, 
                          employeeRange: value === 'all' ? null : value 
                        }))}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all">Any size</SelectItem>
                          {employeeRanges.map(range => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lead Score Filter */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-zinc-400">
                          Minimum Lead Score
                        </label>
                        <span className="text-sm text-zinc-400">
                          {filters.minLeadScore}/100
                        </span>
                      </div>
                      <Slider
                        value={[filters.minLeadScore]}
                        onValueChange={([value]) => setFilters(prev => ({ ...prev, minLeadScore: value }))}
                        max={100}
                        step={10}
                        className="[&_[role=slider]]:bg-blue-500"
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Button
                onClick={handleEngageLeads}
                disabled={isEngaging}
                className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                {isEngaging ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Engaging...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Engage Leads
                  </>
                )}
              </Button>

              <Dialog open={showFindLeadsDialog} onOpenChange={setShowFindLeadsDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    disabled={isFinding}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Leads
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-200">Find New Leads</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                      Search for companies that match your target criteria.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Industry</label>
                      <input
                        type="text"
                        value={findLeadsFilters.industry}
                        onChange={(e) => setFindLeadsFilters(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="e.g., Software Development"
                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-200 placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Location</label>
                      <input
                        type="text"
                        value={findLeadsFilters.location}
                        onChange={(e) => setFindLeadsFilters(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., San Francisco, CA"
                        className="w-full px-3 py-2 bg-zinc-800/50 border border-zinc-700 rounded-md text-zinc-200 placeholder:text-zinc-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">AI Agent Personality</label>
                      <Select
                        value={findLeadsFilters.avatarType}
                        onValueChange={(value) => setFindLeadsFilters(prev => ({ ...prev, avatarType: value }))}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="brain">The Trailblazer</SelectItem>
                          <SelectItem value="target">The Advisor</SelectItem>
                          <SelectItem value="handshake">The Explorer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowFindLeadsDialog(false)}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleFindLeads}
                      disabled={isFinding || !findLeadsFilters.industry || !findLeadsFilters.location}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isFinding ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finding Leads...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Find Leads
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button 
                className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                onClick={() => navigate('/leads/new')}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400">
              {hasActiveFilters 
                ? "No leads match the selected filters. Try adjusting your filters or clear them to see all leads."
                : "No leads found. Start by adding a new company or finding leads."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <div className="aspect-video relative overflow-hidden">
                  {lead.logo_url ? (
                    <img
                      src={lead.logo_url}
                      alt={lead.company_name}
                      className="w-full h-full object-contain p-8 bg-white"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{lead.company_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Building2 className="h-4 w-4" />
                      <span>{lead.industry || 'Industry not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status || '')}`}>
                        {lead.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(lead.lead_score)}`}>
                        Score: {lead.lead_score ?? 'N/A'}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px] bg-zinc-900 border-zinc-800">
                        <DropdownMenuItem 
                          className="text-red-500 hover:text-red-400 hover:bg-zinc-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLead(lead.id);
                          }}
                        >
                          Delete Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-zinc-400 line-clamp-2">{lead.description || 'No description available.'}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <Users className="h-4 w-4" />
                      <span>{lead.employees || 'Team size not specified'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4" />
                      <span>{lead.location || 'Location not specified'}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-400 hover:text-zinc-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/emails');
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    {lead.website && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-zinc-400 hover:text-zinc-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(lead.website, '_blank');
                        }}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                        <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}