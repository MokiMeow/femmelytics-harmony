
import React, { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import FeatureSection from '@/components/landing/FeatureSection';
import DashboardPreview from '@/components/landing/DashboardPreview';
import TestimonialSection from '@/components/landing/TestimonialSection';
import CTASection from '@/components/landing/CTASection';
import FooterSection from '@/components/landing/FooterSection';

const Index = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
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
