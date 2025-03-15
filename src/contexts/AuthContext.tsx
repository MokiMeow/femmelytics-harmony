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

  // Fetch current session on mount
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error('Error fetching session:', error);
      setUser(data?.session?.user || null);
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth event: ${event}`, session);
      setUser(session?.user || null);
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        // Check if welcome toast was already shown for this account
        const welcomeKey = `welcomeToastShown-${session.user.email}`;
        if (!localStorage.getItem(welcomeKey)) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          localStorage.setItem(welcomeKey, 'true');
        }
      } else if (event === 'SIGNED_OUT') {
        // On sign-out, clear the user state and navigate away
        setUser(null);
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
      // The auth listener will pick up the new session so no need to manually update user
      return data;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // For development purposes, hardcode credentials if email matches
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
      // The auth listener will handle updating the state
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
      // The auth listener will clear the user state and navigate away
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
