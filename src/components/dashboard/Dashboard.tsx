'use client';

import { useState, useEffect } from "react";
import { BarChart3, Target } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { HumanModel } from '@/components/HumanModel';

interface LeadStats {
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
}

interface RecentLead {
  id: string;
  company_name: string;
  status: string;
  created_at: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    qualifiedLeads: 0,
    conversionRate: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get total leads count
        const { count: totalCount, error: totalError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (totalError) throw totalError;

        // Get qualified leads count
        const { count: qualifiedCount, error: qualifiedError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'Qualified');

        if (qualifiedError) throw qualifiedError;

        // Get recent leads
        const { data: recentData, error: recentError } = await supabase
          .from('leads')
          .select('id, company_name, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // Calculate conversion rate
        const total = totalCount || 0;
        const qualified = qualifiedCount || 0;
        const rate = total > 0 ? (qualified / total) * 100 : 0;

        setStats({
          totalLeads: total,
          qualifiedLeads: qualified,
          conversionRate: Math.round(rate * 10) / 10,
        });

        setRecentLeads(recentData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          variant: "destructive",
          title: "Error loading dashboard",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-emerald-500';
      case 'new lead':
        return 'text-blue-500';
      case 'qualified':
        return 'text-purple-500';
      case 'closed':
        return 'text-zinc-500';
      case 'lost':
        return 'text-red-500';
      default:
        return 'text-zinc-500';
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const leadDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return format(leadDate, 'MMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-zinc-200 mb-4">Welcome back!</h1>
          <p className="text-zinc-400">Here's what's happening with your leads</p>
          
          {/* Recent Activity Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-zinc-300 mb-4">Recent Activity</h3>
            {recentLeads.slice(0, 2).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-3 mb-3"
              >
                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Target className={`h-4 w-4 ${getStatusColor(lead.status)}`} />
                </div>
                <div>
                  <p className="text-sm text-zinc-300">{lead.company_name}</p>
                  <p className="text-xs text-zinc-500">{getTimeAgo(lead.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2D Model */}
        <div className="flex items-center justify-center">
          <HumanModel />
        </div>

        {/* Stats Cards */}
        <div className="space-y-6">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400">Total Leads</h3>
              <span className="text-3xl font-bold text-zinc-200">{stats.totalLeads}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">3% from yesterday</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400">Hot Leads</h3>
              <span className="text-3xl font-bold text-zinc-200">{stats.qualifiedLeads}</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">12% from yesterday</span>
            </div>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400">Conversion Rate</h3>
              <span className="text-3xl font-bold text-zinc-200">{stats.conversionRate}%</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">5% from yesterday</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}