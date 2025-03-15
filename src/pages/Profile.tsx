import React, { useState, useEffect } from 'react';
import { 
  User, Bell, Lock, HelpCircle, Shield, LogOut, 
  Smartphone, Calendar, RefreshCcw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import GoogleCalendarIntegration from '@/components/GoogleCalendarIntegration';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [calendarConnected, setCalendarConnected] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: "Could not sign you out. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-16 px-4 md:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-8">Profile Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-lavender-500 flex items-center justify-center text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-medium">{user?.email}</h2>
                <p className="text-sm text-muted-foreground">Free Account</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <Button 
                variant={activeTab === 'account' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('account')}
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </Button>
              <Button 
                variant={activeTab === 'notifications' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </Button>
              <Button 
                variant={activeTab === 'privacy' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('privacy')}
              >
                <Shield className="mr-2 h-4 w-4" />
                Privacy & Data
              </Button>
              <Button 
                variant={activeTab === 'integrations' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('integrations')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Integrations
              </Button>
              <Button 
                variant={activeTab === 'help' ? "secondary" : "ghost"} 
                className="w-full justify-start"
                onClick={() => setActiveTab('help')}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Button>
            </nav>
            
            <div className="pt-4">
              <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
          
          <div>
            {activeTab === 'account' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Email</h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Password</h3>
                      <Button variant="outline" disabled>
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                    <CardDescription>Manage your subscription plan</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      You are currently on the Free plan.
                    </p>
                    <Button disabled>Upgrade to Premium</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Manage your notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Email Notifications</h3>
                      <p className="text-muted-foreground">
                        Receive important updates and announcements via email.
                      </p>
                      <Button disabled>Enable Email Notifications</Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Push Notifications</h3>
                      <p className="text-muted-foreground">
                        Get real-time updates on your mobile device.
                      </p>
                      <Button disabled>Enable Push Notifications</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>Manage your privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Data Sharing</h3>
                      <p className="text-muted-foreground">
                        Control whether your data is shared with third parties.
                      </p>
                      <Button disabled>Disable Data Sharing</Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Account Deletion</h3>
                      <p className="text-muted-foreground">
                        Permanently delete your account and all associated data.
                      </p>
                      <Button variant="destructive" disabled>
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'integrations' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>External Integrations</CardTitle>
                    <CardDescription>
                      Connect Luna with your favorite apps and services
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <GoogleCalendarIntegration 
                      isConnected={calendarConnected} 
                      onStatusChange={setCalendarConnected} 
                    />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Smartphone className="h-5 w-5 mr-2 text-teal-500" />
                          Mobile App Sync
                        </CardTitle>
                        <CardDescription>
                          Sync your data with our mobile app
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          The Luna mobile app is coming soon. Stay tuned for updates!
                        </p>
                        <Button disabled className="w-full sm:w-auto">
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <RefreshCcw className="h-5 w-5 mr-2 text-coral-500" />
                          Health App Integration
                        </CardTitle>
                        <CardDescription>
                          Connect with health tracking platforms
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          Integration with Apple Health, Google Fit, and Fitbit coming soon.
                        </p>
                        <Button disabled className="w-full sm:w-auto">
                          Coming Soon
                        </Button>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeTab === 'help' && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>Get assistance and find answers to common questions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">FAQ</h3>
                      <p className="text-muted-foreground">
                        Find answers to frequently asked questions.
                      </p>
                      <Button variant="outline" disabled>
                        Browse FAQ
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Contact Support</h3>
                      <p className="text-muted-foreground">
                        Get in touch with our support team for personalized assistance.
                      </p>
                      <Button disabled>Contact Support</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
