'use client';

import { useState, useEffect } from 'react';
import { Camera, Loader2, Upload, Brain, Target, Handshake } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/lib/supabase';
import { useToast } from "@/components/ui/use-toast";

const avatarOptions = [
  {
    id: 'brain',
    title: 'The Analyst',
    description: 'Analytical thinker with a passion for solving complex problems',
    icon: <Brain className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    ringColor: 'ring-red-400',
  },
  {
    id: 'target',
    title: 'The Strategist',
    description: 'Goal-oriented mind focused on achieving objectives',
    icon: <Target className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    ringColor: 'ring-blue-400',
  },
  {
    id: 'handshake',
    title: 'The Connector',
    description: 'Relationship builder who creates valuable networks',
    icon: <Handshake className="h-8 w-8" />,
    bgGradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
    ringColor: 'ring-green-400',
  },
];

interface UserProfile {
  display_name: string | null;
  profile_image_url: string | null;
  avatar_type: string | null;
}

export function Settings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    profile_image_url: '',
    avatar_type: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('users')
          .select('display_name, profile_image_url, avatar_type')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setProfile({
          display_name: data.display_name || '',
          profile_image_url: data.profile_image_url || '',
          avatar_type: data.avatar_type,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          variant: "destructive",
          title: "Error loading profile",
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Delete old avatar if exists
      if (profile.profile_image_url) {
        const oldFileName = profile.profile_image_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([oldFileName]);
        }
      }

      // Update profile with new image URL
      setProfile({ ...profile, profile_image_url: publicUrl });
      
      toast({
        title: "Image uploaded",
        description: "Your profile picture has been updated",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('users')
        .update({
          display_name: profile.display_name,
          profile_image_url: profile.profile_image_url,
          avatar_type: profile.avatar_type,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error saving changes",
        description: "Please try again later",
      });
    } finally {
      setIsSaving(false);
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-zinc-200 mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-200">Profile Information</CardTitle>
            <CardDescription>Update your profile details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label htmlFor="profile_image" className="text-zinc-400">Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {profile.profile_image_url ? (
                    <img 
                      src={profile.profile_image_url} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Label
                    htmlFor="picture"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-2" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-zinc-400 mb-2" />
                          <p className="mb-2 text-sm text-zinc-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-zinc-500">PNG, JPG or GIF (MAX. 5MB)</p>
                        </>
                      )}
                    </div>
                    <Input
                      id="picture"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </Label>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-zinc-400">Display Name</Label>
              <Input
                id="display_name"
                placeholder="Enter your display name"
                className="bg-zinc-800/50 border-zinc-700 text-zinc-200"
                value={profile.display_name || ''}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <Label className="text-zinc-400">Avatar Type</Label>
              <div className="grid gap-4">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setProfile({ ...profile, avatar_type: avatar.id })}
                    className={`p-4 rounded-lg transition-all duration-200 ${
                      profile.avatar_type === avatar.id
                        ? 'bg-zinc-800 ring-2 ring-zinc-700'
                        : 'bg-black/50 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-200 text-white ${
                          profile.avatar_type === avatar.id
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
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}