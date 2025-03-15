
import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import DashboardPreview from '@/components/landing/DashboardPreview';
import TestimonialSection from '@/components/landing/TestimonialSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Show a welcome toast when landing page loads
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
    if (!hasSeenWelcome) {
      toast({
        title: "Welcome to Femmelytics!",
        description: "Discover personalized insights for your menstrual health journey.",
        duration: 5000,
      });
      localStorage.setItem('has_seen_welcome', 'true');
    }
  }, [toast]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background dark:bg-gradient-to-b dark:from-background dark:to-background">
      <Navigation />
      <HeroSection />
      <FeatureSection />
      <DashboardPreview />
      <TestimonialSection />
      <CTASection />
      <FooterSection />
    </div>
  );
};

export default Index;
