
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, isPast, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      try {
        // Fetch cycle statistics to check for period predictions
        const { data: statsData, error: statsError } = await supabase
          .from('cycle_statistics')
          .select('next_predicted_date')
          .eq('user_id', user.id)
          .single();
          
        if (statsError && statsError.code !== 'PGRST116') {
          console.error('Error fetching cycle statistics:', statsError);
          return;
        }
        
        // Check local storage for read notifications
        const readNotificationsString = localStorage.getItem(`${user.id}_read_notifications`);
        const readNotifications = readNotificationsString ? JSON.parse(readNotificationsString) : [];
        
        // Check local storage for dismissed notifications
        const dismissedNotificationsString = localStorage.getItem(`${user.id}_dismissed_notifications`);
        const dismissedNotifications = dismissedNotificationsString ? JSON.parse(dismissedNotificationsString) : [];
        
        let tempNotifications: Notification[] = [];
        
        // Add period prediction notification if available
        if (statsData?.next_predicted_date) {
          const predictionDate = parseISO(statsData.next_predicted_date);
          const daysUntil = Math.ceil((predictionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          const periodPredictionId = 'period-prediction';
          if (daysUntil <= 5 && daysUntil >= 0 && !dismissedNotifications.includes(periodPredictionId)) {
            tempNotifications.push({
              id: periodPredictionId,
              title: 'Period Coming Soon',
              message: `Your period is predicted to start in ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `${daysUntil} days`}. Consider stocking up on supplies.`,
              date: new Date().toISOString(),
              read: readNotifications.includes(periodPredictionId)
            });
          }
          
          const periodStartedId = 'period-started';
          if (daysUntil === -1 && !dismissedNotifications.includes(periodStartedId)) {
            tempNotifications.push({
              id: periodStartedId,
              title: 'Period Predicted Today',
              message: 'Your period is predicted to have started today. Track your flow to improve future predictions.',
              date: new Date().toISOString(),
              read: readNotifications.includes(periodStartedId)
            });
          }
        }
        
        // Add welcome notification for new users
        const welcomeId = 'welcome';
        if (!dismissedNotifications.includes(welcomeId)) {
          const { data: cycleData, error: cycleError } = await supabase
            .from('cycle_entries')
            .select('count')
            .eq('user_id', user.id);
            
          if (cycleError) {
            console.error('Error checking user data:', cycleError);
          } else if (!cycleData || cycleData.length === 0) {
            tempNotifications.push({
              id: welcomeId,
              title: 'Welcome to Femmelytics',
              message: 'Track your first cycle to get personalized insights.',
              date: new Date().toISOString(),
              read: readNotifications.includes(welcomeId)
            });
          }
        }
        
        // Add chat suggestion if not dismissed
        const chatSuggestionId = 'luna-chat';
        if (!dismissedNotifications.includes(chatSuggestionId)) {
          tempNotifications.push({
            id: chatSuggestionId,
            title: 'Chat with Luna',
            message: 'Need advice or information? Chat with Luna, your AI health assistant.',
            date: new Date().toISOString(),
            read: readNotifications.includes(chatSuggestionId)
          });
        }
        
        setNotifications(tempNotifications);
        setUnreadCount(tempNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error in notification system:', error);
      }
    };
    
    fetchNotifications();
    // Set up a refresh interval
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [user]);

  // Mark all notifications as read when dropdown is opened
  useEffect(() => {
    if (isOpen && unreadCount > 0 && user) {
      // Get IDs of all notifications
      const allIds = notifications.map(n => n.id);
      
      // Update localStorage with read notification IDs
      localStorage.setItem(`${user.id}_read_notifications`, JSON.stringify(allIds));
      
      // Update state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  }, [isOpen, unreadCount, notifications, user]);

  const dismissNotification = (id: string) => {
    if (!user) return;
    
    // Get current dismissed notifications from localStorage
    const dismissedNotificationsString = localStorage.getItem(`${user.id}_dismissed_notifications`);
    const dismissedNotifications = dismissedNotificationsString ? JSON.parse(dismissedNotificationsString) : [];
    
    // Add this ID if not already present
    if (!dismissedNotifications.includes(id)) {
      dismissedNotifications.push(id);
      localStorage.setItem(`${user.id}_dismissed_notifications`, JSON.stringify(dismissedNotifications));
    }
    
    // Remove from current notifications
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n.id === id && !n.read) ? 1 : 0)));
    
    toast({
      title: "Notification dismissed",
      description: "You won't see this notification again.",
      duration: 3000,
    });
  };

  const dismissAllNotifications = () => {
    if (!user || notifications.length === 0) return;
    
    // Get all notification IDs
    const allIds = notifications.map(n => n.id);
    
    // Get current dismissed notifications from localStorage
    const dismissedNotificationsString = localStorage.getItem(`${user.id}_dismissed_notifications`);
    const dismissedNotifications = dismissedNotificationsString ? JSON.parse(dismissedNotificationsString) : [];
    
    // Add all current notification IDs
    const updatedDismissedNotifications = [...new Set([...dismissedNotifications, ...allIds])];
    localStorage.setItem(`${user.id}_dismissed_notifications`, JSON.stringify(updatedDismissedNotifications));
    
    // Clear current notifications
    setNotifications([]);
    setUnreadCount(0);
    setIsOpen(false);
    
    toast({
      title: "All notifications dismissed",
      description: "Your notification list has been cleared.",
      duration: 3000,
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={dismissAllNotifications}
            >
              Dismiss all
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-72 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`cursor-pointer p-3 ${!notification.read ? 'bg-lavender-50 dark:bg-lavender-900/30' : ''}`}
              >
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(notification.date), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex justify-end mt-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs h-6 px-2 text-primary hover:text-primary-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notification.id);
                      }}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Notifications;
