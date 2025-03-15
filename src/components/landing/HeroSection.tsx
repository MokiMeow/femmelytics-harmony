
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/utils/animations';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-background via-purple-50/30 to-background">
      <div className="container px-4 md:px-6">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="mb-6 inline-block">
            <span className="inline-block bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-sm mb-4">
              Women's Health Tracking
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 via-primary to-purple-600 text-transparent bg-clip-text leading-tight"
          >
            Track Your Cycle, Transform Your Life
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-xl text-muted-foreground"
          >
            Empowering women with personalized insights and AI-powered health assistance
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth?tab=signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                Create Free Account
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute -z-10 top-1/3 left-1/4 w-72 h-72 bg-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 top-1/4 right-1/4 w-96 h-96 bg-lavender-400/10 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;
