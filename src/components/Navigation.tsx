
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import UserNavigation from './UserNavigation';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    ...(user ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Track', path: '/track' },
    ] : [])
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        isScrolled || location.pathname !== '/' 
          ? 'bg-background/80 backdrop-blur-md border-b'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 p-2 mr-2">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-lavender-600 font-semibold text-lg">F</span>
                </div>
              </div>
              <span className="font-semibold text-xl tracking-tight">Femmelytics</span>
            </Link>
            
            <nav className="hidden md:flex ml-10 space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center">
            <UserNavigation />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'py-2 text-base font-medium transition-colors',
                      location.pathname === item.path
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t">
                  <UserNavigation />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
