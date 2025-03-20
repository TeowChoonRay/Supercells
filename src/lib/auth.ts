import { AuthError, User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useEffect, useState } from 'react';

// Custom error class for authentication
export class AuthenticationError extends Error {
  constructor(message: string, public originalError?: AuthError) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// Types for authentication
export interface AuthState {
  user: User | null;
  loading: boolean;
}

export interface SecurityQuestion {
  id: number;
  question: string;
}

// Hook to manage authentication state
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Check if user exists
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (error) {
      console.error('Error checking user existence:', error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
}

// Sign up function with enhanced error handling
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    // First check if user exists
    const userExists = await checkUserExists(email);
    
    if (userExists) {
      throw new AuthenticationError('This email is already registered. Please sign in instead.');
    }

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (response.error) {
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (response.error.message) {
        case 'Password should be at least 6 characters':
          errorMessage = 'Password must be at least 6 characters long';
          break;
        case 'Unable to validate email address: invalid format':
          errorMessage = 'Please enter a valid email address';
          break;
        case 'User already registered':
          errorMessage = 'This email is already registered. Please sign in instead.';
          break;
        default:
          errorMessage = response.error.message;
      }
      
      throw new AuthenticationError(errorMessage, response.error);
    }

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred during sign up',
      error as AuthError
    );
  }
}

// Sign in function with enhanced error handling
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      let errorMessage = 'Failed to sign in. Please try again.';
      
      switch (response.error.message) {
        case 'Invalid login credentials':
          errorMessage = 'Incorrect email or password';
          break;
        case 'Email not confirmed':
          errorMessage = 'Please verify your email address before signing in';
          break;
        default:
          errorMessage = response.error.message;
      }
      
      throw new AuthenticationError(errorMessage, response.error);
    }

    return response;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred during sign in',
      error as AuthError
    );
  }
}

// Sign out function with enhanced error handling
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AuthenticationError(
        error.message || 'Failed to sign out',
        error
      );
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred during sign out',
      error as AuthError
    );
  }
}

// Reset password
export async function resetPassword(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      throw new AuthenticationError(
        error.message || 'Failed to send password reset email',
        error
      );
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred while sending password reset email',
      error as AuthError
    );
  }
}

// Update password
export async function updatePassword(newPassword: string): Promise<void> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new AuthenticationError(
        error.message || 'Failed to update password',
        error
      );
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred while updating password',
      error as AuthError
    );
  }
}

// Update user profile
export async function updateProfile(profile: { display_name?: string; avatar_url?: string }) {
  try {
    const { error } = await supabase
      .from('users')
      .update(profile)
      .eq('id', supabase.auth.getUser().then(({ data }) => data.user?.id));

    if (error) {
      throw new AuthenticationError(
        error.message || 'Failed to update profile',
        error
      );
    }
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError(
      'An unexpected error occurred while updating profile',
      error as AuthError
    );
  }
}