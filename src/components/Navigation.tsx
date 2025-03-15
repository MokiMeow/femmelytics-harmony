import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import UserNavigation from './UserNavigation';

const Navigation = () => {
  const { pathname } = useLocation();
  const isMobile = useMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Track', path: '/track' },
    { name: 'Chat with Luna', path: '/chat' },
    { name: 'About', path: '/about' },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background py-4 shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Femmelytics
        </Link>

        {isMobile ? (
          <>
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
                  </nav>
                </div>
                <UserNavigation />
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex items-center gap-8">
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
            </nav>
            <UserNavigation />
          </div>
        )}
      </div>
    </header>
  );
};

export default Navigation;
