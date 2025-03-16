import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@supabase/supabase-js";

// ✅ Use your Supabase project details
const SUPABASE_URL = "https://rdtwkqwbdkyznbmdhajl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdHdrcXdiZGt5em5ibWRoYWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDc5OTAsImV4cCI6MjA1NzYyMzk5MH0.23dQ-IEcw_c6MAw2Vym8PkKIrvAHbKvj-3zxmQ12wp4";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface GoogleCalendarIntegrationProps {
  isConnected: boolean;
  onStatusChange?: (connected: boolean) => void;
}

const GoogleCalendarIntegration = ({ isConnected, onStatusChange }: GoogleCalendarIntegrationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const { toast } = useToast();

  // ✅ Function to connect Google via Supabase OAuth
  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      setError("");

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://femmelytics.vercel.app/auth/callback",
          scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
        },
      });

      if (error) throw new Error(error.message);
    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to Google Calendar");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Function to retrieve Google OAuth Access Token from Supabase
  const fetchGoogleAccessToken = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        console.error("Error fetching session:", error);
        setError("Failed to get Google session");
        return null;
      }

      return data.session.provider_token;
    } catch (err) {
      console.error("Error getting access token:", err);
      setError("Failed to retrieve Google Access Token");
      return null;
    }
  };

  // ✅ Function to fetch Google Calendar events using the Access Token
  const fetchGoogleCalendarEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const accessToken = await fetchGoogleAccessToken();
      if (!accessToken) throw new Error("Missing Google Access Token");

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch calendar events");

      const data = await response.json();
      setEvents(data.items || []);

      toast({
        title: "Google Calendar Synced",
        description: "Fetched events successfully!",
      });

    } catch (err) {
      console.error("Error fetching Google Calendar:", err);
      setError("Failed to retrieve Google Calendar data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchGoogleCalendarEvents();
    }
  }, [isConnected]);

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
          <div className={`h-2 w-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm">
            {isConnected ? "Connected" : "Not connected"}
          </span>
        </div>

        {isConnected && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Upcoming Events:</h3>
            {events.length > 0 ? (
              <ul className="list-disc pl-5">
                {events.slice(0, 5).map((event, index) => (
                  <li key={index} className="text-sm">
                    {event.summary} - {event.start?.dateTime || event.start?.date}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events found.</p>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button onClick={handleConnectGoogle} disabled={loading} variant={isConnected ? "outline" : "default"}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConnected ? "Re-Sync Calendar" : "Connect with Google"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarIntegration;
