
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, User, Mail, Calendar, Shield, Settings, Upload, Camera } from 'lucide-react';
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from 'date-fns';
import { ThemeToggle } from '@/components/ThemeToggle';
import GoogleCalendarIntegration from '@/components/GoogleCalendarIntegration';
import { v4 as uuidv4 } from 'uuid';

interface Activity {
  id: string;
  action: string;
  date: Date;
  type: 'profile' | 'cycle' | 'mood' | 'auth' | 'medication';
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, is_calendar_connected')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error in profile fetch:', error);
          // Don't return early on error, set default values instead
          setFirstName("");
          setLastName("");
          setAvatarUrl(null);
          setIsCalendarConnected(false);
          return;
        }
        
        if (data) {
          setFirstName(data.first_name || "");
          setLastName(data.last_name || "");
          setAvatarUrl(data.avatar_url || null);
          setIsCalendarConnected(data.is_calendar_connected || false);
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

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;
      
      setActivitiesLoading(true);
      try {
        // Fetch latest cycle entries
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycle_entries')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (cycleError) {
          console.error('Error fetching cycle entries:', cycleError);
        }
        
        // Fetch latest mood entries
        const { data: moodData, error: moodError } = await supabase
          .from('mood_entries')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (moodError) {
          console.error('Error fetching mood entries:', moodError);
        }
        
        // Fetch latest medication log entries
        const { data: medData, error: medError } = await supabase
          .from('medication_history')
          .select('id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2);
          
        if (medError) {
          console.error('Error fetching medication history:', medError);
        }
        
        const activities: Activity[] = [];
        
        // Add profile creation activity
        activities.push({
          id: 'profile-creation',
          action: 'Created account',
          date: new Date(user.created_at || Date.now()),
          type: 'auth'
        });
        
        // Add cycle entries
        if (cycleData && cycleData.length > 0) {
          cycleData.forEach(entry => {
            activities.push({
              id: entry.id,
              action: 'Added cycle data',
              date: new Date(entry.created_at),
              type: 'cycle'
            });
          });
        }
        
        // Add mood entries
        if (moodData && moodData.length > 0) {
          moodData.forEach(entry => {
            activities.push({
              id: entry.id,
              action: 'Tracked mood',
              date: new Date(entry.created_at),
              type: 'mood'
            });
          });
        }
        
        // Add medication logs
        if (medData && medData.length > 0) {
          medData.forEach(entry => {
            activities.push({
              id: entry.id,
              action: 'Logged medication',
              date: new Date(entry.created_at),
              type: 'medication'
            });
          });
        }
        
        // Sort by date, most recent first
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        // Take top 5
        setRecentActivities(activities.slice(0, 5));
      } catch (error) {
        console.error('Error fetching activity data:', error);
      } finally {
        setActivitiesLoading(false);
      }
    };
    
    fetchRecentActivity();
  }, [user]);

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    
    setUploadingAvatar(true);
    
    try {
      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const avatarUrl = urlData.publicUrl;
      
      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(avatarUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error uploading avatar",
        description: "Could not upload your profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCalendarStatusChange = async (connected: boolean) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_calendar_connected: connected,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setIsCalendarConnected(connected);
    } catch (error) {
      console.error('Error updating calendar connection status:', error);
      toast({
        title: "Error updating calendar connection",
        description: "Could not update your calendar connection status.",
        variant: "destructive",
      });
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <User className="h-3 w-3 text-blue-500" />;
      case 'profile':
        return <User className="h-3 w-3 text-lavender-500" />;
      case 'cycle':
        return <Calendar className="h-3 w-3 text-pink-500" />;
      case 'mood':
        return <div className="h-3 w-3 text-yellow-500">😊</div>;
      case 'medication':
        return <div className="h-3 w-3 text-green-500">💊</div>;
      default:
        return <div className="h-3 w-3 text-gray-500">•</div>;
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (firstName) {
      return firstName[0].toUpperCase();
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/dashboard" className="inline-flex items-center text-primary hover:underline mr-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Your Profile</h1>
        </div>
        <ThemeToggle />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-gradient-to-b from-lavender-50 to-background dark:from-lavender-900/30 dark:to-background">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url || ''} alt="Profile" />
                  <AvatarFallback className="bg-lavender-200 text-lavender-600 dark:bg-lavender-800 dark:text-lavender-200 text-xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  {uploadingAvatar ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-center">
                {firstName && lastName 
                  ? `${firstName} ${lastName}`
                  : user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mt-1">{user?.email}</p>
              
              <Separator className="my-6" />
              
              <div className="w-full space-y-4">
                <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <Shield className="h-4 w-4 mr-3 text-lavender-500" />
                  <span className="text-sm">Security</span>
                </div>
                <div className="flex items-center p-2 rounded-md hover:bg-muted cursor-pointer transition-colors">
                  <Settings className="h-4 w-4 mr-3 text-lavender-500" />
                  <span className="text-sm">Preferences</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="personal">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-lavender-500" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and account settings
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4">
                    {profileLoading ? (
                      <div className="py-6 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input 
                              id="firstName" 
                              value={firstName} 
                              onChange={(e) => setFirstName(e.target.value)} 
                              placeholder="Enter your first name"
                              className="bg-muted/50 focus:bg-background dark:focus:bg-muted transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input 
                              id="lastName" 
                              value={lastName} 
                              onChange={(e) => setLastName(e.target.value)} 
                              placeholder="Enter your last name"
                              className="bg-muted/50 focus:bg-background dark:focus:bg-muted transition-colors"
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
                            Your email address is used for login and cannot be changed.
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-lavender-50 dark:bg-lavender-900/20 rounded-md border border-lavender-200 dark:border-lavender-800">
                          <div className="p-2 bg-lavender-100 dark:bg-lavender-800 rounded-full">
                            <Calendar className="h-4 w-4 text-lavender-600 dark:text-lavender-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Account Created</div>
                            <div className="text-sm text-muted-foreground">
                              {user?.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-6">
                    <Button 
                      type="submit" 
                      disabled={loading || profileLoading} 
                      className="bg-lavender-600 hover:bg-lavender-700 dark:bg-lavender-600 dark:hover:bg-lavender-700"
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
            </TabsContent>
            
            <TabsContent value="integrations">
              <div className="space-y-6">
                <GoogleCalendarIntegration 
                  isConnected={isCalendarConnected} 
                  onStatusChange={handleCalendarStatusChange} 
                />
                
                {/* Can add more integrations here in the future */}
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-lavender-500" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    View your recent account activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="flex justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    <div className="relative pl-6 border-l border-muted space-y-4">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="relative pb-4">
                          <div className="absolute -left-[21px] top-1">
                            <div className="h-5 w-5 rounded-full bg-background dark:bg-card flex items-center justify-center border border-muted">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(activity.date, { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>No recent activity found</p>
                      <p className="text-sm mt-2">Activities will appear here as you use the app</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
