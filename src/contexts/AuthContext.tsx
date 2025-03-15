import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: any;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to update user state based on current session
  const updateUserFromSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error);
      return;
    }
    setUser(data?.session?.user || null);
  };

  useEffect(() => {
    // Initially fetch session
    (async () => {
      setLoading(true);
      await updateUserFromSession();
      setLoading(false);
    })();

    // Listen to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Clear current user state to force re-render with new data
      setUser(null);
      setLoading(true);
      
      // Use a short delay to ensure the cache is cleared before updating
      setTimeout(async () => {
        await updateUserFromSession();
        setLoading(false);
      }, 100);

      // Show welcome toast only once per account (using user.id as key)
      if (event === 'SIGNED_IN' && session?.user) {
        const welcomeKey = `welcomeToastShown-${session.user.id}`;
        if (!localStorage.getItem(welcomeKey)) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          localStorage.setItem(welcomeKey, 'true');
        }
      }

      // On sign-out, show toast and navigate home
      if (event === 'SIGNED_OUT') {
        toast({
          title: 'Signed out successfully',
          description: 'You have been signed out of your account.',
        });
        navigate('/');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      // The auth listener will update the state on a new session.
      return data;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For development purposes, if the email matches, hardcode credentials
      const actualEmail = email === 'mack@gmail.com' ? 'mack@gmail.com' : email;
      const actualPassword = email === 'mack@gmail.com' ? 'mohithtony' : password;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password: actualPassword,
      });
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      // The auth listener will update state when the session changes.
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // No need to manually clear user; the listener will update state.
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
