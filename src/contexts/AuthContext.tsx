import type { AuthResponse, AuthTokenResponsePassword, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  signUp: (email: string, password: string) => Promise<AuthResponse["data"]>;
  signIn: (email: string, password: string) => Promise<AuthTokenResponsePassword["data"]>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        console.error("Unable to restore the authentication session", error);
      }
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      setLoading(false);

      if (event === "SIGNED_IN" && sessionUser) {
        const welcomeKey = `welcomeToastShown-${sessionUser.id}`;
        if (!localStorage.getItem(welcomeKey)) {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          localStorage.setItem(welcomeKey, "true");
        }
      }

      if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account.",
        });
        navigate("/");
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      throw error;
    }
    return data;
  };

  const signIn = async (email: string, password: string) => {
    if (user && user.email !== email) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      throw error;
    }
    setUser(data.user);
    return data;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) {
      toast({ title: "Google sign in failed", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, signInWithGoogle, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
