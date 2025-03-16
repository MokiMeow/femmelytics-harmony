import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: any;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      return null;
    }
    const sessionUser = data?.session?.user || null;
    setUser(sessionUser);
    return sessionUser;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchSession();
      setLoading(false);
    })();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
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
      }
    );

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
    return data;
  };

  const signIn = async (email: string, password: string) => {
    if (user && user.email !== email) {
      await supabase.auth.signOut();
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    if (data?.user) {
      setUser(data.user);
    } else if (data?.session?.user) {
      setUser(data.session.user);
    } else {
      await fetchSession();
    }
    return data;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
    // After Google redirect, the onAuthStateChange & fetchSession will update `user`
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
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        loading,
      }}
    >
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
