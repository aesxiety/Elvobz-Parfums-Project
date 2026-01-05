import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about-brand.jpg';

const features = [
  {
    icon: Sparkles,
    title: 'Personal Consultation',
    description: 'One-on-one session with our master perfumer',
  },
  {
    icon: Palette,
    title: 'Custom Formula',
    description: 'A fragrance uniquely crafted for you',
  },
  {
    icon: Calendar,
    title: 'By Appointment',
    description: 'Exclusive sessions in our Jakarta atelier',
  },
];

export function BespokeSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-sm">
              <img
                src={aboutImage}
                alt="Master perfumer at work"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border border-primary/30 rounded-sm -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:pl-8"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Bespoke Experience
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              Create Your
              <br />
              <span className="text-gradient-gold italic">Signature Scent</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Embark on an intimate journey of olfactory discovery. Our master perfumer 
              will guide you through an exclusive consultation to craft a fragrance 
              that captures your essence, memories, and aspirations.
            </p>

            {/* Features */}
            <div className="space-y-6 mb-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="p-2 bg-primary/10 rounded-sm">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/custom-parfume">
              <Button size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90">
                Book Your Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
