
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
        
        let tempNotifications: Notification[] = [];
        
        // Add period prediction notification if available
        if (statsData?.next_predicted_date) {
          const predictionDate = parseISO(statsData.next_predicted_date);
          const daysUntil = Math.ceil((predictionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 3 && daysUntil >= 0) {
            tempNotifications.push({
              id: 'period-prediction',
              title: 'Period Coming Soon',
              message: `Your period is predicted to start in ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `${daysUntil} days`}.`,
              date: new Date().toISOString(),
              read: false
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
        } else if (!cycleData || cycleData.length === 0) {
          tempNotifications.push({
            id: 'welcome',
            title: 'Welcome to Femmelytics',
            message: 'Track your first cycle to get personalized insights.',
            date: new Date().toISOString(),
            read: false
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

  const markAsRead = (id: string) => {
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
                className={`cursor-pointer p-3 ${!notification.read ? 'bg-lavender-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(notification.date), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
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
