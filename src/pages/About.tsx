
import React from 'react';
import { ArrowLeft, BookOpen, Heart, ShieldCheck, Award, UserCheck, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="container px-4 py-16 mx-auto max-w-6xl">
        <div className="flex items-center mb-10 mt-16">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-md hover:bg-muted">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold mb-4">About Femmelytics</h1>
          <p className="text-lg text-muted-foreground">
            Empowering women with data-driven insights for better health understanding and management.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-4">
              Femmelytics was created with a simple but powerful mission: to help women understand their bodies better through accurate tracking and personalized insights.
            </p>
            <p className="text-muted-foreground mb-4">
              We believe that when women have access to comprehensive data about their menstrual cycles, mood patterns, and symptoms, they can make more informed decisions about their health and well-being.
            </p>
            <p className="text-muted-foreground">
              Our platform combines intuitive tracking tools with advanced analytics to provide a clear picture of individual patterns and cycles, empowering users to take control of their health journey.
            </p>
          </div>
          <div className="bg-gradient-to-r from-lavender-100 to-teal-100 rounded-2xl p-6">
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4">
                  <Heart className="h-8 w-8 text-lavender-500" />
                </div>
                <h3 className="text-xl font-medium mb-3">Women's Health Focus</h3>
                <p className="text-muted-foreground">
                  Designed specifically for women's unique health tracking needs with a focus on holistic well-being.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-6 text-center">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background rounded-xl shadow-sm p-6 border border-border">
              <div className="w-12 h-12 bg-lavender-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-lavender-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Comprehensive Tracking</h3>
              <p className="text-muted-foreground">
                Track your cycle, mood, energy levels, and symptoms all in one place with our intuitive interface.
              </p>
            </div>
            
            <div className="bg-background rounded-xl shadow-sm p-6 border border-border">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Receive personalized insights and predictions based on your unique patterns and health data.
              </p>
            </div>
            
            <div className="bg-background rounded-xl shadow-sm p-6 border border-border">
              <div className="w-12 h-12 bg-coral-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-coral-600" />
              </div>
              <h3 className="text-xl font-medium mb-2">Privacy Focused</h3>
              <p className="text-muted-foreground">
                Your health data is fully encrypted and protected with industry-leading security measures.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-20">
          <h2 className="text-2xl font-semibold mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start p-4">
              <div className="mr-4 mt-1">
                <UserCheck className="h-6 w-6 text-lavender-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Women-Centered Design</h3>
                <p className="text-muted-foreground">
                  Every feature is designed with women's specific health needs in mind, based on extensive research and feedback.
                </p>
              </div>
            </div>
            
            <div className="flex items-start p-4">
              <div className="mr-4 mt-1">
                <Award className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Scientific Accuracy</h3>
                <p className="text-muted-foreground">
                  Our cycle algorithms and health insights are built on medically-reviewed research for reliable recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-lavender-500 to-teal-500 rounded-3xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Ready to Start Your Health Journey?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of women who are gaining valuable insights about their bodies and taking control of their health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth" className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-colors">
              Create Free Account
            </Link>
            <Link to="/dashboard" className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg font-medium transition-colors">
              Explore Dashboard
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="py-12 border-t border-border">
        <div className="container px-4 mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Femmelytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
