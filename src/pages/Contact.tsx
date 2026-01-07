import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { WHATSAPP_NUMBER } from '@/lib/utils';
// const WHATSAPP_NUMBER = '6285172272514'; // Replace with actual WhatsApp number

export default function Contact() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Message sent',
      description: 'We will get back to you within 24 hours.',
    });
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hello! I would like to inquire about Maison Élixir fragrances.');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-20 pb-16 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Get In Touch
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6">
              We'd Love to{' '}
              <span className="text-gradient-gold italic">Hear From You</span>
            </h1>
            <p className="text-muted-foreground">
              Have questions about our fragrances or bespoke services? 
              Our team is here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-2xl font-semibold mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="bg-card border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="bg-card border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help?"
                    className="bg-card border-border"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={6}
                    className="bg-card border-border resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:pl-8"
            >
              <h2 className="font-display text-2xl font-semibold mb-6">
                Contact Information
              </h2>

              <div className="space-y-6 mb-10">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-sm">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Our Atelier</h4>
                    <p className="text-muted-foreground text-sm">
                      Jl. Kemang Raya No. 88<br />
                      Jakarta Selatan 12730<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-sm">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Phone</h4>
                    <p className="text-muted-foreground text-sm">
                      +62 812 3456 7890
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-sm">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <p className="text-muted-foreground text-sm">
                      hello@maisonelixir.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-primary/10 rounded-sm">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Atelier Hours</h4>
                    <p className="text-muted-foreground text-sm">
                      Monday - Friday: 10:00 - 19:00<br />
                      Saturday: 10:00 - 17:00<br />
                      Sunday: By Appointment
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <div className="p-6 bg-card border border-border rounded-sm">
                <h3 className="font-display text-lg font-medium mb-3">
                  Quick Response via WhatsApp
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get instant assistance from our team through WhatsApp.
                </p>
                <Button
                  onClick={openWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
