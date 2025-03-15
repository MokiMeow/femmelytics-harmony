
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Save, User } from 'lucide-react';
import { Link } from "react-router-dom";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error fetching profile",
          description: "Could not load your profile information.",
          variant: "destructive",
        });
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Could not update your profile information.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="bg-lavender-100 p-3 rounded-full">
              <User className="h-8 w-8 text-lavender-600" />
            </div>
            <div>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <div className="py-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)} 
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={loading || profileLoading} 
              className="w-full md:w-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProfilePage;
