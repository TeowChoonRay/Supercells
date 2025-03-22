import { useState, useEffect } from 'react';
import { Mail, Linkedin, BarChart3, MessageSquare, PenSquare, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseGenerator, MessageStyle } from '@/lib/response-generator';
import { format } from 'date-fns';

interface Lead {
  id: string;
  company_name: string;
  industry: string | null;
  status: string | null;
  lead_score: number | null;
}

interface SentEmail {
  id: string;
  company_name: string;
  industry: string | null;
  message_content: string;
  message_type: 'email' | 'linkedin';
  created_at: string;
}

type MessageTone = 'visionary' | 'strategist' | 'socialite';

const toneToStyleMap: Record<MessageTone, MessageStyle> = {
  'visionary': 'confident',
  'strategist': 'authoritative',
  'socialite': 'empathetic'
};

export default function Networking() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
  const [selectedTone, setSelectedTone] = useState<MessageTone>('visionary');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch leads
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('id, company_name, industry, status, lead_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (leadsError) throw leadsError;
        setLeads(leadsData || []);

        // Fetch sent emails
        const { data: emailsData, error: emailsError } = await supabase
          .from('email_sent')
          .select('id, company_name, industry, message_content, message_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (emailsError) throw emailsError;
        setSentEmails(emailsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDraftMessage = (leadId: string, type: 'email' | 'linkedin') => {
    navigate(`/email-editor/${leadId}?tone=${selectedTone}&type=${type}`);
  };

  const toneOptions: { id: MessageTone; title: string; description: string; color: string }[] = [
    {
      id: 'visionary',
      title: 'The Visionary',
      description: 'Bold, Aggressive Strategies',
      color: 'from-emerald-500/20 to-emerald-500/5 hover:from-emerald-500/30 hover:to-emerald-500/10',
    },
    {
      id: 'strategist',
      title: 'The Strategist',
      description: 'Calculated, Data-Driven Moves',
      color: 'from-blue-500/20 to-blue-500/5 hover:from-blue-500/30 hover:to-blue-500/10',
    },
    {
      id: 'socialite',
      title: 'The Socialite',
      description: 'Relationship-Focused',
      color: 'from-purple-500/20 to-purple-500/5 hover:from-purple-500/30 hover:to-purple-500/10',
    },
  ];

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
          <h1 className="text-2xl font-bold text-zinc-200">Networking</h1>
          <p className="text-zinc-400 mt-2">
            Generate personalized outreach messages for your leads
          </p>
        </div>

        {/* Message Tone Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Select Message Tone</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toneOptions.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`p-6 rounded-lg transition-all duration-200 bg-gradient-to-b ${
                  tone.color
                } ${
                  selectedTone === tone.id
                    ? 'ring-2 ring-zinc-500 shadow-lg'
                    : 'hover:shadow-md'
                }`}
              >
                <h3 className="text-lg font-semibold text-zinc-200">{tone.title}</h3>
                <p className="text-sm text-zinc-400">{tone.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs for Leads and Sent Emails */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden">
          <Tabs defaultValue="leads" className="w-full">
            <div className="p-4 border-b border-zinc-800">
              <TabsList className="bg-zinc-800">
                <TabsTrigger value="leads" className="data-[state=active]:bg-zinc-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Potential Leads
                </TabsTrigger>
                <TabsTrigger value="sent" className="data-[state=active]:bg-zinc-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Sent Messages
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="leads" className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-zinc-400 font-medium">Company Name</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Industry</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Lead Score</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Status</th>
                      <th className="text-right p-4 text-zinc-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-zinc-800/50">
                        <td className="p-4 text-zinc-200">{lead.company_name}</td>
                        <td className="p-4 text-zinc-400">{lead.industry || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.lead_score === null ? 'bg-zinc-800 text-zinc-200' :
                            lead.lead_score >= 80 ? 'bg-emerald-500/10 text-emerald-500' :
                            lead.lead_score >= 60 ? 'bg-blue-500/10 text-blue-500' :
                            lead.lead_score >= 40 ? 'bg-yellow-500/10 text-yellow-500' :
                            lead.lead_score >= 20 ? 'bg-orange-500/10 text-orange-500' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {lead.lead_score === null ? 'N/A' : `${lead.lead_score}/100`}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'New Lead'
                              ? 'bg-blue-500/10 text-blue-500'
                              : lead.status === 'Qualified'
                              ? 'bg-purple-500/10 text-purple-500'
                              : lead.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-zinc-500/10 text-zinc-500'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => handleDraftMessage(lead.id, 'email')}
                              className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </Button>
                            <Button
                              onClick={() => handleDraftMessage(lead.id, 'linkedin')}
                              className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              LinkedIn
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="sent" className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left p-4 text-zinc-400 font-medium">Company Name</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Industry</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Type</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Sent At</th>
                      <th className="text-left p-4 text-zinc-400 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sentEmails.map((email) => (
                      <tr key={email.id} className="border-b border-zinc-800/50">
                        <td className="p-4 text-zinc-200">{email.company_name}</td>
                        <td className="p-4 text-zinc-400">{email.industry || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            email.message_type === 'email'
                              ? 'bg-blue-500/10 text-blue-500'
                              : 'bg-purple-500/10 text-purple-500'
                          }`}>
                            {email.message_type === 'email' ? (
                              <Mail className="w-3 h-3" />
                            ) : (
                              <Linkedin className="w-3 h-3" />
                            )}
                            {email.message_type}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-400">
                          {format(new Date(email.created_at), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="p-4">
                          <div className="max-w-md">
                            <p className="text-zinc-400 text-sm line-clamp-2">
                              {email.message_content}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}