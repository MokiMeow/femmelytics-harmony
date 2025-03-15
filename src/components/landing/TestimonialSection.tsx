
import React from 'react';
import { motion } from 'framer-motion';

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
}

const TestimonialSection = () => {
  const testimonials: TestimonialItem[] = [
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
  );
};

export default TestimonialSection;
