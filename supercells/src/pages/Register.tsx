import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LockKeyhole, Mail, UserPlus, User } from "lucide-react";
import { AuthLayout } from '@/components/AuthLayout';
import { signUp } from '@/lib/auth';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabase';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (password !== confirmPassword) {
    toast({
      variant: "destructive",
      title: "Passwords do not match",
      description: "Please ensure both passwords are identical",
    });
    return;
  }

  if (password.length < 6) {
    toast({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long",
    });
    return;
  }

  setIsLoading(true);

  try {
    const { data, error } = await signUp(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
      return;
    }

    if (data?.user) {
      // Account creation success
      const { error: updateError } = await supabase
        .from('users')
        .update({ display_name: displayName })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Error updating display name:', updateError);
        toast({
          variant: "warning",
          title: "Partial success",
          description: "Account created but display name could not be set",
        });
      } else {
        toast({
          title: "Account created successfully",
          description: "Please select your avatar",
        });
      }

      navigate('/avatar-selection');
    }
  } catch (error) {
    console.error('Registration error:', error);
    toast({
      variant: "destructive",
      title: "Registration failed",
      description: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <AuthLayout>
      <Card className="auth-card card-hover">
        <CardHeader className="space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-black/50 ring-1 ring-zinc-800">
              <UserPlus className="w-6 h-6 text-zinc-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-zinc-400">Create Account</CardTitle>
          <CardDescription className="text-center text-zinc-500">
            Sign up for a new account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-zinc-400 text-sm">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  className="pl-9 bg-black/50 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 input-glow"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400 text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9 bg-black/50 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 input-glow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-400 text-sm">Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 bg-black/50 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 input-glow"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-400 text-sm">Confirm Password</Label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 bg-black/50 border-zinc-800 text-zinc-400 placeholder:text-zinc-600 input-glow"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              type="submit" 
              className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Next"}
            </Button>
            <div className="text-center text-sm text-zinc-500">
              Already have an account?{' '}
              <Button 
                variant="link" 
                className="px-1 text-zinc-400 hover:text-zinc-300" 
                type="button"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Sign in
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}