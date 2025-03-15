
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X, User, Bell, ChevronDown, Calendar, BarChart, Home, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Home', path: '/', icon: <Home className="h-5 w-5" /> },
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart className="h-5 w-5" /> },
    { name: 'Track', path: '/track', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Insights', path: '/insights', icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out px-4 md:px-6',
          isScrolled ? 'py-3 bg-white/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div
              className={cn(
                'flex items-center transition-all duration-300',
                isScrolled ? 'scale-90' : 'scale-100'
              )}
            >
              <div className="rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 p-2 mr-2">
                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-lavender-600 font-semibold text-lg">F</span>
                </div>
              </div>
              <span className="font-semibold text-xl tracking-tight">Femmelytics</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative px-3 py-2 rounded-lg text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 rounded-full text-foreground/70 hover:text-primary hover:bg-primary/5 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lavender-100">
                <User className="h-4 w-4 text-lavender-600" />
              </div>
              <span className="text-sm font-medium">Profile</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden pt-16 bg-white"
          >
            <div className="p-4 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lavender-100">
                    <User className="h-4 w-4 text-lavender-600" />
                  </div>
                  <span className="font-medium">Profile</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Settings</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
