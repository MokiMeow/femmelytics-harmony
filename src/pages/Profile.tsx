
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ArrowLeft, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData({
            first_name: data.first_name,
            last_name: data.last_name,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) {
        toast({
          title: "Error saving profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error saving profile",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!user) {
    return null; // No need to render anything if redirecting
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex items-center"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold">Your Profile</h1>
        </motion.div>
        
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-lavender-500" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={profileData.first_name || ''}
                    onChange={handleInputChange}
                    placeholder="Your first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={profileData.last_name || ''}
                    onChange={handleInputChange}
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center p-2 bg-muted rounded-md">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your email address is used for login and cannot be changed here.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="flex items-center p-2 bg-muted rounded-md">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{user?.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-lavender-500 hover:bg-lavender-600"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
