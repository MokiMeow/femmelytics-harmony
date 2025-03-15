
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Activity, BarChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Card from '@/components/Card';

const DashboardPreview = () => {
  return (
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
            
            <Link to="/dashboard" className="mt-8 inline-flex items-center">
              <Button className="bg-gradient-to-r from-lavender-500 to-primary">
                <span>View Dashboard</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="col-span-2 lg:col-span-1 overflow-hidden p-4 border-2 border-lavender-100 bg-white/80 backdrop-blur-sm shadow-xl rounded-xl">
              <img 
                src="/lovable-uploads/d687e40f-ad20-4eb4-b607-3fa4130517db.png" 
                alt="Dashboard Preview" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </Card>
            
            {/* Float elements */}
            <div className="absolute -top-8 -right-8 bg-white rounded-xl shadow-lg p-4 animate-float hidden md:block">
              <Activity className="h-6 w-6 text-coral-500" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2 hidden md:block">
              <BarChart className="h-6 w-6 text-lavender-500" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
