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

  // Helper: fetch current session and update user state
  const updateUserFromSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return;
    }
    setUser(data?.session?.user || null);
  };

  // Listen for auth state changes
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await updateUserFromSession();
      setLoading(false);
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Immediately clear the user state so that old data is removed.
      setUser(null);
      setLoading(true);

      // Wait a short time then update user state.
      setTimeout(async () => {
        await updateUserFromSession();
        setLoading(false);
      }, 100);

      if (event === 'SIGNED_IN' && session?.user) {
        // Only show welcome toast once per account (using user id)
        const welcomeKey = `welcomeToastShown-${session.user.id}`;
        if (!localStorage.getItem(welcomeKey)) {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully signed in.',
          });
          localStorage.setItem(welcomeKey, 'true');
        }
      }

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
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      // The auth listener will update the state on session change.
      return data;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // If there is already a signed-in user with a different email, sign them out first.
      if (user && user.email !== email) {
        await supabase.auth.signOut();
        // Wait briefly to let the sign-out process complete.
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // For development purposes, override credentials if needed.
      const actualEmail = email === 'mack@gmail.com' ? 'mack@gmail.com' : email;
      const actualPassword = email === 'mack@gmail.com' ? 'mohithtony' : password;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password: actualPassword,
      });
      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      // The auth listener will update the user state.
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
      // Auth listener will handle clearing state and navigation.
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
