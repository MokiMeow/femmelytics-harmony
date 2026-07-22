import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Calendar, Loader2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  start?: { date?: string; dateTime?: string };
}

interface GoogleCalendarIntegrationProps {
  isConnected: boolean;
  onStatusChange?: (connected: boolean) => void;
}

const GoogleCalendarIntegration = ({ isConnected, onStatusChange }: GoogleCalendarIntegrationProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const { toast } = useToast();

  const fetchGoogleCalendarEvents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const accessToken = data.session?.provider_token;
      if (!accessToken) throw new Error("Reconnect Google Calendar to refresh access.");

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=" +
          encodeURIComponent(new Date().toISOString()),
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      if (!response.ok) throw new Error("Google Calendar did not accept the request.");

      const payload = (await response.json()) as { items?: GoogleCalendarEvent[] };
      setEvents(payload.items ?? []);
      onStatusChange?.(true);
      toast({ title: "Google Calendar synced", description: "Upcoming events are up to date." });
    } catch (caughtError) {
      console.error("Unable to sync Google Calendar", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Unable to sync Google Calendar.");
    } finally {
      setLoading(false);
    }
  }, [onStatusChange, toast]);

  useEffect(() => {
    if (isConnected) void fetchGoogleCalendarEvents();
  }, [fetchGoogleCalendarEvents, isConnected]);

  const handleConnectGoogle = async () => {
    if (isConnected) {
      await fetchGoogleCalendarEvents();
      return;
    }

    setLoading(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/profile`,
        scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly",
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-lavender-500" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>Sync your cycle predictions with Google Calendar</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Calendar sync failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <p className="mb-4 text-sm text-muted-foreground">
          {isConnected
            ? "Your Google Calendar connection is active. Re-sync to refresh the event preview."
            : "Connect Google Calendar to review upcoming events alongside your planning workflow."}
        </p>
        <div className="flex items-center">
          <div className={`mr-2 h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm">{isConnected ? "Connected" : "Not connected"}</span>
        </div>
        {isConnected && (
          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Upcoming events</h3>
            {events.length ? (
              <ul className="list-disc space-y-1 pl-5">
                {events.map((event, index) => (
                  <li key={event.id ?? `${event.start?.dateTime ?? event.start?.date ?? "event"}-${index}`} className="text-sm">
                    {event.summary ?? "Untitled event"} — {event.start?.dateTime ?? event.start?.date ?? "Date unavailable"}
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
        <Button onClick={() => void handleConnectGoogle()} disabled={loading} variant={isConnected ? "outline" : "default"}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isConnected ? "Re-sync calendar" : "Connect with Google"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GoogleCalendarIntegration;
