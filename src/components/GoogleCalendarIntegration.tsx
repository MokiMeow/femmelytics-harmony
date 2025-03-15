
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { syncWithGoogleCalendar } from '@/services/calendarService';
import { cn } from '@/lib/utils';

interface GoogleCalendarIntegrationProps {
  isConnected: boolean;
  onStatusChange?: (connected: boolean) => void;
}

const GOOGLE_API_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // This would come from environment variables in a real app
const GOOGLE_API_SCOPES = "https://www.googleapis.com/auth/calendar.events";

const GoogleCalendarIntegration = ({ isConnected, onStatusChange }: GoogleCalendarIntegrationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  
  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load the Google API client
      await loadGoogleApiScript();
      
      // Initialize the Google API client
      (window as any).gapi.load('client:auth2', async () => {
        try {
          await (window as any).gapi.client.init({
            clientId: GOOGLE_API_CLIENT_ID,
            scope: GOOGLE_API_SCOPES,
            plugin_name: 'Luna Health'
          });
          
          // Sign in with Google
          const authInstance = (window as any).gapi.auth2.getAuthInstance();
          const user = await authInstance.signIn();
          
          // Get the access token
          const authResponse = user.getAuthResponse();
          const accessToken = authResponse.access_token;
          
          // Get user's primary calendar
          const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch calendars');
          }
          
          const data = await response.json();
          const primaryCalendar = data.items.find((cal: any) => cal.primary) || data.items[0];
          
          if (!primaryCalendar) {
            throw new Error('No calendars found');
          }
          
          // Sync cycle data with the primary calendar
          const success = await syncWithGoogleCalendar(accessToken);
          
          if (success) {
            toast({
              title: "Calendar Connected",
              description: "Your cycle predictions have been synced to Google Calendar"
            });
            
            if (onStatusChange) {
              onStatusChange(true);
            }
          } else {
            throw new Error('Failed to sync cycle data');
          }
        } catch (err) {
          console.error('Google Sign-In Error:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect to Google Calendar');
        } finally {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('Error loading Google API:', err);
      setLoading(false);
      setError('Failed to load Google Calendar API');
    }
  };
  
  const handleDisconnect = async () => {
    try {
      setLoading(true);
      const authInstance = (window as any).gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      
      toast({
        title: "Calendar Disconnected",
        description: "Your Google Calendar has been disconnected"
      });
      
      if (onStatusChange) {
        onStatusChange(false);
      }
    } catch (err) {
      console.error('Error disconnecting:', err);
      setError('Failed to disconnect from Google Calendar');
    } finally {
      setLoading(false);
    }
  };
  
  const loadGoogleApiScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).gapi) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-lavender-500" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Sync your cycle predictions with Google Calendar
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <p className="text-sm text-muted-foreground mb-4">
          {isConnected 
            ? "Your cycle predictions are being synced to your Google Calendar. This makes it easier to track and plan around your cycle."
            : "Connect your Google Calendar to automatically sync your cycle predictions. This makes it easier to track and plan around your cycle."}
        </p>
        
        <div className="flex items-center">
          <div className={cn(
            "h-2 w-2 rounded-full mr-2",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Not connected"}
          </span>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={isConnected ? handleDisconnect : handleConnectGoogle}
          disabled={loading}
          variant={isConnected ? "outline" : "default"}
          className={isConnected ? "" : "bg-lavender-500 hover:bg-lavender-600"}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConnected ? "Disconnect Calendar" : "Connect with Google"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarIntegration;
