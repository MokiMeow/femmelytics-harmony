
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart, Sparkles, Shield } from 'lucide-react';

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureSection = () => {
  const features: FeatureItem[] = [
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

  return (
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
  );
};

export default FeatureSection;
