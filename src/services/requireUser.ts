import { supabase } from "@/integrations/supabase/client";

export async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("User not authenticated");
  return data.user.id;
}
