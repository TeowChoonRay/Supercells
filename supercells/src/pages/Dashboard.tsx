import { useState, useEffect } from "react";
import { BarChart3, Target, ArrowUpRight, ArrowDownRight, MessageSquare } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { AppHeader } from '@/components/AppHeader';
import { BusinessmanCanvas } from '@/components/BusinessmanModel';
import { useNavigate } from 'react-router-dom';

interface LeadStats {
  totalLeads: number;
  messagesSent: number;
  conversionRate: number;
  totalLeadsChange: number;
  messagesSentChange: number;
  conversionRateChange: number;
}

interface RecentLead {
  id: string;
  company_name: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    messagesSent: 0,
    conversionRate: 0,
    totalLeadsChange: 0,
    messagesSentChange: 0,
    conversionRateChange: 0
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        // Get today's leads count
        const { data: todayLeads, error: todayLeadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (todayLeadsError) throw todayLeadsError;

        // Get yesterday's leads count
        const { data: yesterdayLeads, error: yesterdayLeadsError } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString())
          .lt('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (yesterdayLeadsError) throw yesterdayLeadsError;

        // Get today's messages count
        const { data: todayMessages, error: todayMessagesError } = await supabase
          .from('email_sent')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (todayMessagesError) throw todayMessagesError;

        // Get yesterday's messages count
        const { data: yesterdayMessages, error: yesterdayMessagesError } = await supabase
          .from('email_sent')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString())
          .lt('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (yesterdayMessagesError) throw yesterdayMessagesError;

        // Get recent leads
        const { data: recentData, error: recentError } = await supabase
          .from('leads')
          .select('id, company_name, status, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) throw recentError;

        // Get total converted leads for today
        const { data: todayConverted, error: todayConvertedError } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'Converted')
          .gte('updated_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (todayConvertedError) throw todayConvertedError;

        // Get total converted leads for yesterday
        const { data: yesterdayConverted, error: yesterdayConvertedError } = await supabase
          .from('leads')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'Converted')
          .gte('updated_at', new Date(new Date().setDate(new Date().getDate() - 1)).toISOString())
          .lt('updated_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        if (yesterdayConvertedError) throw yesterdayConvertedError;

        // Calculate metrics
        const todayLeadsCount = todayLeads?.length || 0;
        const yesterdayLeadsCount = yesterdayLeads?.length || 0;
        const todayMessagesCount = todayMessages?.length || 0;
        const yesterdayMessagesCount = yesterdayMessages?.length || 0;
        const todayConvertedCount = todayConverted?.length || 0;
        const yesterdayConvertedCount = yesterdayConverted?.length || 0;

        // Calculate conversion rates
        const todayConversionRate = todayLeadsCount ? (todayConvertedCount / todayLeadsCount) * 100 : 0;
        const yesterdayConversionRate = yesterdayLeadsCount ? (yesterdayConvertedCount / yesterdayLeadsCount) * 100 : 0;

        // Calculate changes
        const totalLeadsChange = calculatePercentageChange(yesterdayLeadsCount, todayLeadsCount);
        const messagesSentChange = calculatePercentageChange(yesterdayMessagesCount, todayMessagesCount);
        const conversionRateChange = calculatePercentageChange(yesterdayConversionRate, todayConversionRate);

        setStats({
          totalLeads: todayLeadsCount,
          messagesSent: todayMessagesCount,
          conversionRate: Math.round(todayConversionRate * 10) / 10,
          totalLeadsChange,
          messagesSentChange,
          conversionRateChange
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
  }, [user]);

  const calculatePercentageChange = (oldValue: number, newValue: number): number => {
    if (oldValue === 0) return newValue > 0 ? 100 : 0;
    return Math.round(((newValue - oldValue) / oldValue) * 100);
  };

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

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      
      <div className="flex-1 p-4 pb-24 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-zinc-200 mb-4">Welcome Back!</h1>
            
            {/* Recent Activity Preview */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-zinc-300 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentLeads.slice(0, 3).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Target className={`h-5 w-5 ${getStatusColor(lead.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-300 truncate">{lead.company_name}</p>
                      <p className="text-xs text-zinc-500">{getTimeAgo(lead.created_at)}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)} bg-zinc-800/50`}>
                      {lead.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Model */}
          <div className="h-[400px] lg:h-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden">
            <BusinessmanCanvas />
          </div>

          {/* Stats Cards */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400">Total Leads</h3>
                <span className="text-3xl font-bold text-zinc-200">{stats.totalLeads}</span>
              </div>
              <div className={`flex items-center gap-2 ${stats.totalLeadsChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.totalLeadsChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(stats.totalLeadsChange)}% from yesterday</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400">Messages Sent</h3>
                <span className="text-3xl font-bold text-zinc-200">{stats.messagesSent}</span>
              </div>
              <div className={`flex items-center gap-2 ${stats.messagesSentChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.messagesSentChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(stats.messagesSentChange)}% from yesterday</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-zinc-400">Conversion Rate</h3>
                <span className="text-3xl font-bold text-zinc-200">{stats.conversionRate}%</span>
              </div>
              <div className={`flex items-center gap-2 ${stats.conversionRateChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {stats.conversionRateChange >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm">{Math.abs(stats.conversionRateChange)}% from yesterday</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-zinc-300 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/leads/new')}
                  className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  <Target className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-sm font-medium text-zinc-300">Add Lead</p>
                  <p className="text-xs text-zinc-500">Track new company</p>
                </button>
                <button 
                  onClick={() => navigate('/emails')}
                  className="p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                >
                  <MessageSquare className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-sm font-medium text-zinc-300">Send Message</p>
                  <p className="text-xs text-zinc-500">Contact leads</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}