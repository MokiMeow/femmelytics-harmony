
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="bg-gradient-to-r from-lavender-500 to-primary rounded-3xl p-8 md:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          
          <div className="max-w-2xl relative">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Start your personalized health journey today
            </h2>
            <p className="text-white/80 mb-8">
              Join thousands of women who are taking control of their health with data-driven insights and personalized recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?tab=signup">
                <Button className="bg-white text-primary hover:bg-white/90">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/about">
                <Button variant="outline" className="bg-white/20 text-white hover:bg-white/30 border-white">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
