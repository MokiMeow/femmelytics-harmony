
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Book, MessageSquare, Library, Pill } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import UserNavigation from './UserNavigation';
import { ThemeToggle } from './ThemeToggle';
import Notifications from './Notifications';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';

const Navigation = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Define navigation links based on authentication status
  const navLinks = user ? [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Track', path: '/track' },
    { name: 'Chat with Luna', path: '/chat' },
    { name: 'About', path: '/about' },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  // Health Resources section links
  const healthLinks = [
    { name: 'Health Journal', path: '/journal', icon: <Book className="mr-2 h-4 w-4" /> },
    { name: 'Community Forums', path: '/forums', icon: <MessageSquare className="mr-2 h-4 w-4" /> },
    { name: 'Health Library', path: '/library', icon: <Library className="mr-2 h-4 w-4" /> },
    { name: 'Medication Tracking', path: '/medications', icon: <Pill className="mr-2 h-4 w-4" /> },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm py-4 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
          Femmelytics
        </Link>

        {isMobile ? (
          <>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user && <Notifications />}
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleMenu}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="sm:w-64">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Explore Femmelytics
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <nav className="grid gap-4">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          to={link.path}
                          className={`flex items-center text-sm font-medium ${pathname === link.path ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                      
                      {user && (
                        <>
                          <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">Health Resources</div>
                          {healthLinks.map((link) => (
                            <Link
                              key={link.name}
                              to={link.path}
                              className={`flex items-center text-sm font-medium ${pathname === link.path ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {link.icon}
                              {link.name}
                            </Link>
                          ))}
                        </>
                      )}
                    </nav>
                  </div>
                  <UserNavigation />
                </SheetContent>
              </Sheet>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium ${pathname === link.path ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                  {link.name}
                </Link>
              ))}
              
              {user && (
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm font-medium text-muted-foreground hover:text-primary">
                        Health Resources
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {healthLinks.map((link) => (
                            <li key={link.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={link.path}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    pathname === link.path ? "bg-accent text-accent-foreground" : ""
                                  )}
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                    {link.icon}
                                    {link.name}
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {link.name === 'Health Journal' && 'Track symptoms, mood, and health patterns'}
                                    {link.name === 'Community Forums' && 'Connect with others and share experiences'}
                                    {link.name === 'Health Library' && 'Access expert-reviewed health articles'}
                                    {link.name === 'Medication Tracking' && 'Manage medication schedules and refills'}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </nav>
            <div className="flex items-center gap-4">
              {user && <Notifications />}
              <ThemeToggle />
              <UserNavigation />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
