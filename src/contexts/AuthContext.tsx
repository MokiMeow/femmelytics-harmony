
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

  // Function to refresh user data - we'll call this when needed
  const refreshUserData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error refreshing user data:', error);
        setUser(null);
      } else {
        console.log('User data refreshed:', data.user?.email);
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing');
    
    // Initial user fetch on component mount
    refreshUserData();

    // Set up auth state change listener with immediate callback
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change event:', event, 'User:', session?.user?.email);
        
        // Important: Force a complete refresh of user data on any auth event
        if (event) {
          // Clear any previous user data immediately on auth events before fetching new data
          if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('hasShownWelcomeToast');
          }
          
          // For any auth event, get fresh user data
          await refreshUserData();
          
          // Handle toast messages for sign in
          if (event === 'SIGNED_IN' && session?.user && !localStorage.getItem('hasShownWelcomeToast')) {
            toast({
              title: "Welcome back!",
              description: "You have successfully signed in.",
            });
            localStorage.setItem('hasShownWelcomeToast', 'true');
          }
        }
      }
    );

    // Cleanup function
    return () => {
      console.log('AuthProvider cleanup');
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
      // Clear the welcome toast flag before signing in
      localStorage.removeItem('hasShownWelcomeToast');
      
      setLoading(true);
      
      // For development purposes, we'll hardcode mack@gmail.com credentials
      const actualEmail = email === 'mack@gmail.com' ? 'mack@gmail.com' : email;
      const actualPassword = email === 'mack@gmail.com' ? 'mohithtony' : password;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: actualEmail,
        password: actualPassword,
      });

      if (error) {
        setLoading(false);
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      // Force an immediate user data refresh after sign in
      await refreshUserData();
      
      // Navigate to dashboard on successful sign in
      navigate('/dashboard');
      
      return data;
    } catch (error: any) {
      setLoading(false);
      console.error('Error signing in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state immediately
      setUser(null);
      
      // Remove welcome toast flag
      localStorage.removeItem('hasShownWelcomeToast');
      
      // Navigate to home page
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
    } finally {
      setLoading(false);
    }
  };

  // Add this logging to see when context values change
  console.log('AuthContext rendering with user:', user?.email, 'loading:', loading);

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
