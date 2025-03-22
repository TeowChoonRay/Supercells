import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Mail, Linkedin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { ResponseGenerator, MessageStyle } from '@/lib/response-generator';
import { useAuth } from '@/lib/auth';

interface Lead {
  id: string;
  company_name: string;
  industry: string | null;
  employees: string | null;
  lead_score: number | null;
}

const toneToStyleMap: Record<string, MessageStyle> = {
  'visionary': 'confident',
  'strategist': 'authoritative',
  'socialite': 'empathetic'
};

export default function MessageEditor() {
  const { leadId } = useParams();
  const [searchParams] = useSearchParams();
  const tone = searchParams.get('tone') || 'visionary';
  const type = (searchParams.get('type') || 'email') as 'email' | 'linkedin';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [lead, setLead] = useState<Lead | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) return;

      try {
        const { data, error } = await supabase
          .from('leads')
          .select('id, company_name, industry, employees, lead_score')
          .eq('id', leadId)
          .single();

        if (error) throw error;
        setLead(data);

        // Generate initial message
        generateMessage(data);
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast({
          variant: "destructive",
          title: "Error loading lead",
          description: "Please try again later",
        });
      }
    };

    fetchLead();
  }, [leadId]);

  const generateMessage = async (leadData: Lead) => {
    setIsGenerating(true);
    try {
      const generator = new ResponseGenerator();
      const message = await generator.generateMessage(
        leadData.company_name,
        leadData.industry,
        leadData.employees,
        toneToStyleMap[tone],
        type
      );
      setMessageContent(message);
    } catch (error) {
      console.error('Error generating message:', error);
      toast({
        variant: "destructive",
        title: "Error generating message",
        description: "Please try again later",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!user || !lead) return;
    
    setIsSending(true);
    try {
      // Update lead status to "Converted"
      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'Converted' })
        .eq('id', lead.id);

      if (updateError) throw updateError;

      // Log the sent email
      const { error: logError } = await supabase
        .from('email_sent')
        .insert([{
          user_id: user.id,
          lead_id: lead.id,
          company_name: lead.company_name,
          industry: lead.industry,
          message_content: messageContent,
          message_type: type
        }]);

      if (logError) throw logError;

      toast({
        title: `${type === 'email' ? 'Email' : 'LinkedIn message'} sent`,
        description: "Your message has been sent successfully",
      });
      
      navigate('/emails');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error sending message",
        description: "Please try again later",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />
      
      <div className="flex-1 p-4 pb-24">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-200"
            onClick={() => navigate('/emails')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-200">
              {type === 'email' ? 'Email Editor' : 'LinkedIn Message Editor'}
            </h1>
            <p className="text-zinc-400 mt-1">
              {lead?.company_name ? `Draft ${type} for ${lead.company_name}` : 'Loading...'}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Message Content
              </label>
              {isGenerating ? (
                <div className="flex items-center justify-center h-64 bg-zinc-800/50 rounded-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                </div>
              ) : (
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  className={`min-h-[300px] bg-zinc-800/50 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 ${
                    type === 'linkedin' ? 'max-h-[150px]' : ''
                  }`}
                  placeholder="Message content will appear here..."
                />
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
                onClick={() => lead && generateMessage(lead)}
                disabled={isGenerating || !lead}
              >
                Regenerate
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || isGenerating || !messageContent.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    {type === 'email' ? (
                      <Mail className="mr-2 h-4 w-4" />
                    ) : (
                      <Linkedin className="mr-2 h-4 w-4" />
                    )}
                    Send {type === 'email' ? 'Email' : 'Message'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}