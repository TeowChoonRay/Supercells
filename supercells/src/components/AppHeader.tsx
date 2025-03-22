import { Link } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { AvatarIcon } from './AvatarIcon';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  display_name: string | null;
  profile_image_url: string | null;
}

export function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile>({ display_name: null, profile_image_url: null });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('display_name, profile_image_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile({
          display_name: data.display_name,
          profile_image_url: data.profile_image_url
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "Please try again",
      });
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-zinc-200">SUPERCELLS</span>
            <Link
              to="/leads-enquiry"
              className="ml-2 p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
            >
              <AvatarIcon />
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-zinc-200">
            <Bell className="h-5 w-5" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.profile_image_url || undefined} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-400">
                    {profile.display_name ? profile.display_name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {profile.display_name || user?.email}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800">
              <DropdownMenuItem onClick={handleSignOut} className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}