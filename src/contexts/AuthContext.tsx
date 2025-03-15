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

  // Helper to fetch the latest session
  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return;
    }
    const sessionUser = data?.session?.user || null;
    setUser(sessionUser);
  };

  useEffect(() => {
    // Initial session fetch
    (async () => {
      setLoading(true);
      await fetchSession();
      setLoading(false);
    })();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Update user state immediately from listener
        const sessionUser = session?.user || null;
        setUser(sessionUser);
        if (sessionUser) {
          const welcomeKey = `welcomeToastShown-${sessionUser.id}`;
          if (!localStorage.getItem(welcomeKey)) {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
            localStorage.setItem(welcomeKey, 'true');
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
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
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    // Note: If your sign up flow requires email confirmation, the session might not be active immediately.
    return data;
  };

  const signIn = async (email: string, password: string) => {
    // If a different user is already signed in, sign them out first.
    if (user && user.email !== email) {
      await supabase.auth.signOut();
      // Optionally, wait a short moment before proceeding
    }

    // For development purposes, override credentials if needed:
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

    // Manually update user state from the response
    if (data.user) {
      setUser(data.user);
    } else if (data.session && data.session.user) {
      setUser(data.session.user);
    } else {
      // If for some reason the response doesn't include user data, re-fetch the session
      await fetchSession();
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
    // Directly clear the user state.
    setUser(null);
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
