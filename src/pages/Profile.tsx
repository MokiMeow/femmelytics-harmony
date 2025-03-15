
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, ArrowLeft, Save, LogOut, Shield, UserCheck, Clock, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-5xl mx-auto">
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
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Card className="bg-gradient-to-b from-lavender-50 to-background">
              <CardContent className="pt-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="Profile" />
                  <AvatarFallback className="bg-lavender-100 text-lavender-600 text-xl">
                    {profileData.first_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="mt-4 text-xl font-semibold text-center">
                  {profileData.first_name && profileData.last_name 
                    ? `${profileData.first_name} ${profileData.last_name}`
                    : user.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground text-center mt-1">{user.email}</p>
                
                <Separator className="my-6" />
                
                <div className="w-full space-y-4">
                  <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer">
                    <Shield className="h-4 w-4 mr-3 text-lavender-500" />
                    <span className="text-sm">Security</span>
                  </div>
                  <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer">
                    <Settings className="h-4 w-4 mr-3 text-lavender-500" />
                    <span className="text-sm">Preferences</span>
                  </div>
                  <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer">
                    <UserCheck className="h-4 w-4 mr-3 text-lavender-500" />
                    <span className="text-sm">Account</span>
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={signOut}
                  className="mt-6 w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-lavender-500" />
                      Personal Information
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
                          className="bg-muted/50 focus:bg-background transition-colors"
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
                          className="bg-muted/50 focus:bg-background transition-colors"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <div className="flex items-center p-3 bg-muted/50 rounded-md">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{user?.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your email address is used for login and cannot be changed here.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-lavender-50 rounded-md border border-lavender-200">
                      <div className="p-2 bg-lavender-100 rounded-full">
                        <Calendar className="h-4 w-4 text-lavender-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Account Created</div>
                        <div className="text-sm text-muted-foreground">
                          {user?.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-6">
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
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-lavender-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative pl-6 border-l border-muted space-y-4">
                      {[
                        { action: "Profile updated", date: "Today", time: "10:30 AM" },
                        { action: "Logged into account", date: "Today", time: "9:45 AM" },
                        { action: "Added new cycle data", date: "Yesterday", time: "3:20 PM" },
                        { action: "Updated mood information", date: "Last week", time: "2:15 PM" },
                      ].map((item, index) => (
                        <div key={index} className="relative pb-4">
                          <div className="absolute -left-[29px] h-3 w-3 rounded-full bg-lavender-300 border-4 border-background"></div>
                          <p className="font-medium">{item.action}</p>
                          <p className="text-sm text-muted-foreground">{item.date} at {item.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
