'use client';

import { useState, useEffect } from 'react';
import { Plus, Filter, Building2, Users, MapPin, Mail, Globe, ArrowUpRight, MoreHorizontal, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';

interface Lead {
  id: string;
  company_name: string;
  logo_url: string | null;
  industry: string | null;
  location: string | null;
  employees: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  last_contact: string | null;
  description: string | null;
}

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLeads(data || []);
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
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-zinc-200">Company Leads</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Link href="/leads/new">
              <Button className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">No leads found. Start by adding a new company.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-900/70 transition-all duration-200"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={lead.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'}
                  alt={lead.company_name}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status || '')}`}>
                    {lead.status}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px] bg-zinc-900 border-zinc-800">
                      <DropdownMenuItem className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800">
                        Edit Company
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500 hover:text-red-400 hover:bg-zinc-800">
                        Remove
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
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  {lead.website && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-zinc-400 hover:text-zinc-200"
                      onClick={() => window.open(lead.website, '_blank')}
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
  );
}