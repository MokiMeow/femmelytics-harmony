
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Sparkles, Shield, BarChart, Activity, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Index = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-lavender-500" />,
      title: 'Cycle Tracking',
      description: 'Keep track of your menstrual cycle with smart predictions and personalized insights.',
    },
    {
      icon: <BarChart className="h-6 w-6 text-teal-500" />,
      title: 'Health Analytics',
      description: 'Visualize your health data through intuitive charts and understand patterns over time.',
    },
    {
      icon: <Sparkles className="h-6 w-6 text-coral-500" />,
      title: 'Personalized Insights',
      description: 'Receive AI-powered recommendations tailored to your unique health profile.',
    },
    {
      icon: <Shield className="h-6 w-6 text-lavender-500" />,
      title: 'Private & Secure',
      description: 'Your health data is encrypted and never shared with third parties.',
    },
  ];

  const testimonials = [
    {
      quote: "Femmelytics transformed how I understand my body. The personalized insights have been incredibly accurate!",
      author: "Sarah J.",
      role: "Regular User"
    },
    {
      quote: "As a healthcare professional, I'm impressed by the accuracy and comprehensiveness of the tracking features.",
      author: "Dr. Emily Chen",
      role: "OB/GYN"
    },
    {
      quote: "This app helped me identify patterns I would have never noticed on my own. Truly empowering!",
      author: "Michelle R.",
      role: "Premium Member"
    }
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center rounded-full border border-lavender-200 bg-lavender-50 px-3 py-1 text-sm text-lavender-700"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              <span>Introducing Femmelytics</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-3xl"
            >
              Your personal health insights, <span className="text-transparent bg-clip-text bg-gradient-to-r from-lavender-500 to-teal-500">intelligently analyzed</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="text-lg text-muted-foreground max-w-2xl mb-2"
            >
              Track, visualize, and understand your health with AI-powered insights that help you make informed decisions.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col sm:flex-row gap-4 mt-4"
            >
              <Link to="/track" className="premium-button bg-primary text-white">
                <span>Get Started</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/about" className="premium-button bg-muted text-foreground hover:bg-muted/80">
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-lavender-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold mb-4">Health tracking reimagined</h2>
            <p className="text-muted-foreground">
              Our platform combines advanced analytics with intuitive design to give you the clearest picture of your health.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl hover-card"
              >
                <div className="rounded-xl bg-white p-3 w-12 h-12 flex items-center justify-center shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Dashboard Preview Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-semibold mb-4">Your health dashboard, beautifully visualized</h2>
              <p className="text-muted-foreground mb-6">
                Track all your health metrics in one place with intuitive visualizations and personalized insights.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Track your cycle with precision and insights',
                  'Monitor symptoms and identify patterns',
                  'Receive personalized health recommendations',
                  'Visualize your data with beautiful charts'
                ].map((item, i) => (
                  <motion.li 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start"
                  >
                    <CheckCircle className="text-teal-500 h-5 w-5 mr-2 mt-0.5" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              
              <Link to="/dashboard" className="premium-button bg-lavender-500 text-white mt-8 inline-flex items-center">
                <span>View Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-lavender-100 to-teal-100 rounded-2xl p-1">
                <div className="rounded-xl overflow-hidden shadow-lg border border-white/50">
                  <img 
                    src="https://placehold.co/600x400/f5f3ff/6d28d9?text=Dashboard+Preview"
                    alt="Dashboard Preview" 
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>
              
              {/* Float elements */}
              <div className="absolute -top-8 -right-8 bg-white rounded-xl shadow-lg p-4 animate-float">
                <Activity className="h-6 w-6 text-coral-500" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2">
                <BarChart className="h-6 w-6 text-lavender-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-gradient-to-t from-background to-lavender-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold mb-4">What our users say</h2>
            <p className="text-muted-foreground">
              Join thousands of women who have transformed their health journey with Femmelytics.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="italic mb-6">"{testimonial.quote}"</p>
                <div>
                  <p className="font-medium">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="bg-gradient-to-r from-lavender-500 to-teal-500 rounded-3xl p-8 md:p-12 overflow-hidden relative">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            
            <div className="max-w-2xl relative">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Start your personalized health journey today
              </h2>
              <p className="text-white/80 mb-8">
                Join thousands of women who are taking control of their health with data-driven insights and personalized recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="premium-button bg-white text-primary hover:bg-white/90">
                  Create Free Account
                </Link>
                <Link to="/about" className="premium-button bg-white/20 text-white hover:bg-white/30">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 md:py-16 border-t border-border">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center">
                <div className="rounded-xl bg-gradient-to-br from-lavender-500 to-teal-500 p-2 mr-2">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-lavender-600 font-semibold text-lg">F</span>
                  </div>
                </div>
                <span className="font-semibold text-xl tracking-tight">Femmelytics</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Empowering women through health analytics
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><Link to="/features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                  <li><Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                  <li><Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                  <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                  <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link></li>
                  <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 Femmelytics. All rights reserved.
            </p>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
              </a>
              
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
              </a>
              
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
