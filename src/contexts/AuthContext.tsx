
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event);
        
        if (session?.user) {
          console.log('User signed in:', session.user.email);
          setUser(session.user);
          
          // Only show welcome toast on explicit SIGNED_IN event and if we haven't shown it already in this browser session
          if (event === 'SIGNED_IN' && !localStorage.getItem('hasShownWelcomeToast')) {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
            localStorage.setItem('hasShownWelcomeToast', 'true');
          }
        } else {
          console.log('User signed out or session expired');
          setUser(null);
          
          // Clear the welcome toast flag when user signs out
          if (event === 'SIGNED_OUT') {
            localStorage.removeItem('hasShownWelcomeToast');
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clear the welcome toast flag before signing in to ensure it shows for the new session
      localStorage.removeItem('hasShownWelcomeToast');
      
      // For development purposes, we'll hardcode mack@gmail.com credentials
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
      navigate('/');
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
      });
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
    <AuthContext.Provider
      value={{
        user,
        signUp,
        signIn,
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
