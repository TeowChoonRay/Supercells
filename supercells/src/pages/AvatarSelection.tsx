import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthLayout } from '@/components/AuthLayout';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/lib/auth';
import { Brain, Target, Handshake } from 'lucide-react';

const avatarOptions = [
  {
    id: 'brain',
    title: 'The Trailblazer',
    description: 'Pursues high-value enterprises, tech giants, or Fortune 500 companies with aggressive strategies to secure major AI solution deals.',
    icon: <Brain className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)', // Emerald gradient
    ringColor: 'ring-emerald-400',
  },
  {
    id: 'target',
    title: 'The Advisor',
    description: 'Targets mid-sized, traditional, or mature businesses that are exploring AI adoption for improved efficiency.',
    icon: <Target className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', // Blue gradient
    ringColor: 'ring-blue-400',
  },
  {
    id: 'handshake',
    title: 'The Explorer',
    description: 'Focuses on discovering start-ups, unicorns, and fast-growing companies that are expanding and may need innovative AI solutions.',
    icon: <Handshake className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #A855F7 0%, #6B21A8 100%)', // Purple gradient
    ringColor: 'ring-purple-400',
  },
];

export default function AvatarSelection() {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleAvatarSelection = async () => {
    if (!selectedAvatar || !user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_type: selectedAvatar })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "AI Avatar selected!",
        description: "Your profile has been updated successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="auth-card">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-black/50 ring-1 ring-zinc-800">
              <Brain className="w-6 h-6 text-zinc-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-400">Choose Your Avatar</CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Select the persona that best represents you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {avatarOptions.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className={`p-4 rounded-lg transition-all duration-200 ${
                  selectedAvatar === avatar.id
                    ? 'bg-zinc-800 ring-2 ring-zinc-700'
                    : 'bg-black/50 hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div 
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-200 text-white ${
                      selectedAvatar === avatar.id
                        ? `scale-110 ring-2 ${avatar.ringColor}`
                        : 'ring-1 ring-zinc-700 hover:scale-105'
                    }`}
                    style={{ background: avatar.bgGradient }}
                  >
                    {avatar.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-zinc-300">{avatar.title}</h3>
                    <p className="text-sm text-zinc-500">{avatar.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleAvatarSelection}
            disabled={!selectedAvatar || isLoading}
            className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium"
          >
            {isLoading ? "Updating profile..." : "Continue"}
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}