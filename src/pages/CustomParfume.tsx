import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Sparkles, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import aboutImage from '@/assets/about-brand.jpg';

const AVAILABLE_CITY = 'Jakarta';

const reservationSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name').max(100),
  email: z.string().email('Please enter a valid email').max(255),
  phone: z.string().min(10, 'Please enter a valid phone number').max(20),
  preferredDate: z.string().min(1, 'Please select a date'),
  preferredTime: z.string().min(1, 'Please select a time'),
  fragrancePreferences: z.string().max(500).optional(),
  notes: z.string().max(500).optional(),
});

type ReservationData = z.infer<typeof reservationSchema>;

const timeSlots = [
  '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function CustomParfume() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
  });

  const handleSubmit = async (data: ReservationData) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to book a consultation.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.from('reservations').insert({
      user_id: user.id,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      city: AVAILABLE_CITY,
      fragrance_preferences: data.fragrancePreferences || null,
      notes: data.notes || null,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Consultation booked!',
        description: 'We will confirm your appointment via email shortly.',
      });
      navigate('/my-reservations');
    }
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src={aboutImage}
            alt="Bespoke perfume creation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-noir/80" />
        </div>

        <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Bespoke Experience
            </p>
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-6">
              Create Your{' '}
              <span className="text-gradient-gold italic">Signature Scent</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Book a private consultation with our master perfumer and 
              embark on a journey to create a fragrance uniquely yours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-semibold mb-6">
                The Bespoke Journey
              </h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Consultation</h4>
                    <p className="text-sm text-muted-foreground">
                      Meet with our master perfumer to discuss your preferences, 
                      memories, and the emotions you want your scent to evoke.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Exploration</h4>
                    <p className="text-sm text-muted-foreground">
                      Discover our collection of rare ingredients and explore 
                      different scent families to find your perfect composition.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Creation</h4>
                    <p className="text-sm text-muted-foreground">
                      Your unique formula is crafted and refined until it 
                      perfectly captures your essence.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Your Signature</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive your bespoke fragrance in an elegant bottle, 
                      with your formula kept exclusively on file for refills.
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Notice */}
              <div className="p-6 bg-card border border-primary/30 rounded-sm">
                <div className="flex items-start space-x-4">
                  <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Currently Available in {AVAILABLE_CITY}</h4>
                    <p className="text-sm text-muted-foreground">
                      Our bespoke consultations are currently offered exclusively 
                      at our {AVAILABLE_CITY} atelier. We're working to expand to other cities soon.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="glass-card p-8 rounded-sm">
                <div className="flex items-center space-x-2 mb-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-medium">
                    Book Your Consultation
                  </h3>
                </div>

                {!user && (
                  <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-sm">
                    <p className="text-sm text-center">
                      Please{' '}
                      <a href="/auth" className="text-primary underline">
                        sign in
                      </a>{' '}
                      to book a consultation.
                    </p>
                  </div>
                )}

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      className="bg-background border-border"
                      {...form.register('fullName')}
                    />
                    {form.formState.errors.fullName && (
                      <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="bg-background border-border"
                        {...form.register('email')}
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+62 812 3456 7890"
                        className="bg-background border-border"
                        {...form.register('phone')}
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex items-center space-x-2 p-3 bg-background border border-border rounded-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{AVAILABLE_CITY} Atelier</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Preferred Date
                      </Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        min={minDate}
                        className="bg-background border-border"
                        {...form.register('preferredDate')}
                      />
                      {form.formState.errors.preferredDate && (
                        <p className="text-sm text-destructive">{form.formState.errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <Clock className="h-4 w-4 inline mr-2" />
                        Preferred Time
                      </Label>
                      <Select onValueChange={(value) => form.setValue('preferredTime', value)}>
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.preferredTime && (
                        <p className="text-sm text-destructive">{form.formState.errors.preferredTime.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fragrancePreferences">Fragrance Preferences (Optional)</Label>
                    <Textarea
                      id="fragrancePreferences"
                      placeholder="Tell us about scents you love or hate, any allergies..."
                      rows={3}
                      className="bg-background border-border resize-none"
                      {...form.register('fragrancePreferences')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or information..."
                      rows={2}
                      className="bg-background border-border resize-none"
                      {...form.register('notes')}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !user}
                    className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Book Consultation'
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
