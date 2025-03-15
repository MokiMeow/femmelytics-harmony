
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
        const dismissedNotificationsString = localStorage.getItem(`${user.id}_dismissed_notifications`) || '[]';
        const readNotifications = readNotificationsString ? JSON.parse(readNotificationsString) : [];
        const dismissedNotifications = JSON.parse(dismissedNotificationsString);
        
        let tempNotifications: Notification[] = [];
        
        // Add period prediction notification if available
        if (statsData?.next_predicted_date) {
          const predictionDate = parseISO(statsData.next_predicted_date);
          const daysUntil = Math.ceil((predictionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 5 && daysUntil >= 0 && !dismissedNotifications.includes('period-prediction')) {
            tempNotifications.push({
              id: 'period-prediction',
              title: 'Period Coming Soon',
              message: `Your period is predicted to start in ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `${daysUntil} days`}. Consider stocking up on supplies.`,
              date: new Date().toISOString(),
              read: readNotifications.includes('period-prediction')
            });
          } else if (daysUntil === -1 && !dismissedNotifications.includes('period-started')) {
            tempNotifications.push({
              id: 'period-started',
              title: 'Period Predicted Today',
              message: 'Your period is predicted to have started today. Track your flow to improve future predictions.',
              date: new Date().toISOString(),
              read: readNotifications.includes('period-started')
            });
          }
        }
        
        // Add welcome notification for new users
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycle_entries')
          .select('count')
          .eq('user_id', user.id);
          
        if (cycleError) {
          console.error('Error checking user data:', cycleError);
        } else if ((!cycleData || cycleData.length === 0) && !dismissedNotifications.includes('welcome')) {
          tempNotifications.push({
            id: 'welcome',
            title: 'Welcome to Femmelytics',
            message: 'Track your first cycle to get personalized insights.',
            date: new Date().toISOString(),
            read: readNotifications.includes('welcome')
          });
        }
        
        // Add chat suggestion if not dismissed
        if (!dismissedNotifications.includes('luna-chat')) {
          tempNotifications.push({
            id: 'luna-chat',
            title: 'Chat with Luna',
            message: 'Need advice or information? Chat with Luna, your AI health assistant.',
            date: new Date().toISOString(),
            read: readNotifications.includes('luna-chat')
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
    
    // Remove from current notifications list
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n.id === id && !n.read) ? 1 : 0)));
  };

  const markAsRead = (id: string) => {
    if (!user) return;
    
    // Get current read notifications from localStorage
    const readNotificationsString = localStorage.getItem(`${user.id}_read_notifications`);
    const readNotifications = readNotificationsString ? JSON.parse(readNotificationsString) : [];
    
    // Add this ID if not already present
    if (!readNotifications.includes(id)) {
      readNotifications.push(id);
      localStorage.setItem(`${user.id}_read_notifications`, JSON.stringify(readNotifications));
    }
    
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    if (!user) return;
    
    // Get all notification IDs
    const allIds = notifications.map(n => n.id);
    
    // Save to localStorage
    localStorage.setItem(`${user.id}_read_notifications`, JSON.stringify(allIds));
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
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
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-72 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={`cursor-pointer p-3 relative ${!notification.read ? 'bg-lavender-50 dark:bg-lavender-900/30' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex flex-col gap-1 pr-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(notification.date), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(notification.id);
                  }}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z" fill="currentColor" />
                  </svg>
                </Button>
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
