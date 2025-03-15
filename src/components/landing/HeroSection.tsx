
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fadeInUp, staggerContainer } from '@/utils/animations';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-b from-background via-purple-50/30 to-background dark:from-background dark:via-purple-900/10 dark:to-background relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-3xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="mb-6 inline-block">
            <span className="inline-block bg-primary/10 text-primary font-medium rounded-full px-4 py-1 text-sm mb-4 dark:bg-primary/20">
              Women's Health Tracking
            </span>
          </motion.div>
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 via-primary to-purple-600 text-transparent bg-clip-text leading-tight dark:from-violet-400 dark:via-lavender-400 dark:to-purple-400"
          >
            Track Your Cycle, Transform Your Life
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-xl text-muted-foreground dark:text-gray-300"
          >
            Empowering women with personalized insights and AI-powered health assistance
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/auth?tab=signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 dark:from-lavender-500 dark:to-purple-500 dark:hover:from-lavender-500/90 dark:hover:to-purple-500/90">
                Create Free Account
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/10 dark:border-lavender-400 dark:text-lavender-400 dark:hover:bg-lavender-400/10">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Improved decorative elements for dark mode */}
        <div className="absolute -z-10 top-1/3 left-1/4 w-72 h-72 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -z-10 top-1/4 right-1/4 w-96 h-96 bg-lavender-400/10 dark:bg-lavender-500/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Add a subtle dark overlay for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/5 to-transparent dark:from-purple-900/10 dark:via-purple-800/5 dark:to-background/80 pointer-events-none"></div>
    </section>
  );
};

export default HeroSection;
