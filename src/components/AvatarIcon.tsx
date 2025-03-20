import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Brain, Target, Handshake } from 'lucide-react';

const avatarEmojis = {
  brain: <Brain className="h-4 w-4" />, // Analytical/innovative thinking
  target: <Target className="h-4 w-4" />, // Strategic/goal-oriented
  handshake: <Handshake className="h-4 w-4" />, // Networking/relationships
};

export function AvatarIcon() {
  const { user } = useAuth();
  const [avatarType, setAvatarType] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvatarType = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('avatar_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setAvatarType(data?.avatar_type);
      } catch (error) {
        console.error('Error fetching avatar type:', error);
      }
    };

    fetchAvatarType();
  }, [user]);

  const getAvatarStyle = () => {
    switch (avatarType) {
      case 'brain':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
          icon: avatarEmojis.brain
        };
      case 'target':
        return {
          background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
          icon: avatarEmojis.target
        };
      case 'handshake':
        return {
          background: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
          icon: avatarEmojis.handshake
        };
      default:
        return {
          background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
          icon: <Brain className="h-4 w-4 text-zinc-400" />
        };
    }
  };

  const style = getAvatarStyle();

  return (
    <div 
      className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg text-white"
      style={{ background: style.background }}
    >
      {style.icon}
    </div>
  );
}