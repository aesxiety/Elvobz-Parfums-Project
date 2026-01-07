import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, Sparkles, Loader2, MapPin, AlertCircle, CalendarDays } from 'lucide-react';
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
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format, getDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const AVAILABLE_CITY = 'Tanah Grogot, Paser';

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


const TIME_SLOTS = {
  tuesday: [ // Selasa (day 2)
    '19:00',  '20:00',  '21:00',  '22:00'
  ],
  wednesday: [ // Rabu (day 3)
    '19:00',  '20:00',  '21:00',  '22:00'
  ],
  saturday: [ 
    '09:00',  '10:00',  '11:00',  '12:00',
    '13:00',  '14:00',  '15:00',  '16:00',
     '17:00',  '18:00',  '19:00', 
    '20:00',  '21:00',  '22:00'
  ]
};

// Helper function untuk mendapatkan time slots berdasarkan hari
const getTimeSlotsForDay = (dayOfWeek: number | undefined) => {
  if (!dayOfWeek) return [];
  
  switch (dayOfWeek) {
    case 2: // Tuesday (Selasa)
      return TIME_SLOTS.tuesday;
    case 3: // Wednesday (Rabu)
      return TIME_SLOTS.wednesday;
    case 6: // Saturday (Sabtu)
      return TIME_SLOTS.saturday;
    default:
      return [];
  }
};

// Helper function untuk mendapatkan nama hari dalam bahasa Inggris
const getDayName = (dayOfWeek: number) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
};

export default function CustomParfume() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedDayName, setSelectedDayName] = useState<string>('');
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ReservationData>({
    resolver: zodResolver(reservationSchema),
  });
  console.log(form.getValues())
  useEffect(() => {
    if (user) {
      form.setValue('email', user.email || '');
    }
  }, [user, form]);

  // Update time slots ketika tanggal berubah
  useEffect(() => {
    if (selectedDate) {
      const dayOfWeek = getDay(selectedDate); // 0 = Sunday, 1 = Monday, ...
      const timeSlots = getTimeSlotsForDay(dayOfWeek);
      setAvailableTimeSlots(timeSlots);
      setSelectedDayName(getDayName(dayOfWeek));
      
      // Selalu reset waktu yang dipilih ketika tanggal berubah
      form.setValue('preferredTime', '');
      form.clearErrors('preferredTime');
    } else {
      setAvailableTimeSlots([]);
      setSelectedDayName('');
    }
  }, [selectedDate, form]);

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

    // Validasi tambahan untuk waktu
    if (selectedDate) {
      const dayOfWeek = getDay(selectedDate);
      const validTimes = getTimeSlotsForDay(dayOfWeek);
      
      if (!validTimes.includes(data.preferredTime)) {
        toast({
          title: 'Invalid time selection',
          description: `Please select a valid time for ${getDayName(dayOfWeek)}`,
          variant: 'destructive',
        });
        return;
      }
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

  // Handler untuk pemilihan tanggal
  const handleDaySelect = (day: Date | undefined) => {
    if (day) {
      setSelectedDate(day);
      form.setValue('preferredDate', format(day, 'yyyy-MM-dd'));
      form.clearErrors('preferredDate');
    }
  };


  const modifiers = {
    tuesday: { dayOfWeek: [2] }, 
    wednesday: { dayOfWeek: [3] }, 
    saturday: { dayOfWeek: [6] }, 
  };

  const modifiersStyles = {
    tuesday: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--accent))',
    },
    wednesday: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--accent))',
    },
    saturday: {
      backgroundColor: 'transparent',
      color: 'hsl(var(--accent))',
    },
  };

  
  const classNames = {
    caption: 'flex justify-center py-2 mb-4 relative items-center',
    caption_label: 'text-sm font-medium',
    nav: 'flex items-center',
    nav_button: 'h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-secondary/50 hover:rounded-sm transition-all duration-200',
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse',
    head_row: 'flex',
    head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
    row: 'flex w-full mt-2',
    cell: 'text-center text-sm p-0 relative last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
    day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-secondary/50 hover:text-foreground rounded-sm transition-colors duration-200',
    day_selected: 'bg-transparent  ring-1 ring-gray-300/60 rounded-md text-accent aria-selected:text-accent hover:bg-secondary/100 hover:text-accent-foreground',
    day_today: 'bg-accent! text-accent border-2 border-accent/60',
    day_outside: 'text-muted-foreground opacity-30 hover:bg-background hover:text-muted-foreground hover:opacity-50',
    day_disabled: 'text-muted-foreground opacity-20 hover:bg-transparent',
    day_range_middle: 'aria-selected:bg-secondary aria-selected:text-secondary-foreground',
    day_hidden: 'invisible',
  };

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
                  <div className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
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
                  <div className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
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
                  <div className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
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
                  <div className="flex items-center justify-center min-w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
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

              {/* Time Schedule Info */}
              <div className="mb-6 p-6 bg-card border border-border rounded-sm">
                <h4 className="font-medium mb-3">Available Time Slots:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tuesday:</span>
                    <span className="font-medium">19:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Wednesday:</span>
                    <span className="font-medium">19:00 - 22:00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Saturday:</span>
                    <span className="font-medium">09:00 - 22:00</span>
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
                        disabled={!!user?.email}
                        className={`bg-background border-border ${user?.email ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      <span>{AVAILABLE_CITY}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Preferred Date
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="preferredDate"
                          type="text"
                          readOnly
                          value={selectedDate ? format(selectedDate, 'EEEE, dd MMMM yyyy') : ''}
                          className="bg-background border-border flex-1"
                          placeholder="Select a date"
                          {...form.register('preferredDate')}
                        />
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="border-border"
                              disabled={!user}
                            >
                              <CalendarDays className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <div className="p-3">
                              <DayPicker
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDaySelect}
                                disabled={[
                                  { before: new Date() }, 
                                  { dayOfWeek: [0, 1, 4, 5] }, // Minggu, Senin, Kamis, Jumat
                                ]}
                                modifiers={modifiers}
                                modifiersStyles={modifiersStyles}
                                fromMonth={new Date()}
                                toMonth={new Date(new Date().getFullYear(), new Date().getMonth() + 3)}
                                classNames={classNames}
                                formatters={{
                                  formatCaption: (date) => format(date, 'MMMM yyyy'),
                                }}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      {form.formState.errors.preferredDate && (
                        <p className="text-sm text-destructive">{form.formState.errors.preferredDate.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Available days: Tuesday, Wednesday, Saturday only
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        <Clock className="h-4 w-4 inline mr-2" />
                        Preferred Time
                        {selectedDayName && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            ({selectedDayName})
                          </span>
                        )}
                      </Label>
                      <Select 
                        onValueChange={(value) => {form.setValue('preferredTime', value); console.log(form.getValues())}}
                        disabled={!user || !selectedDate}
                        value={form.watch('preferredTime')}
                      >
                        <SelectTrigger className="bg-background border-border">
                          <SelectValue 
                            placeholder={
                              !selectedDate 
                                ? "Select date first" 
                                : `Select time for ${selectedDayName}`
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))
                          ) : selectedDate ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No available times for {selectedDayName}
                            </div>
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Please select a date first
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.preferredTime && (
                        <p className="text-sm text-destructive">{form.formState.errors.preferredTime.message}</p>
                      )}
                      {selectedDayName && (
                        <div className="text-xs text-muted-foreground">
                          {selectedDayName === 'Saturday' ? (
                            <span>Available: 09:00 - 22:00</span>
                          ) : (
                            <span>Available: 19:00 - 22:00</span>
                          )}
                        </div>
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
                      disabled={!user}
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
                      disabled={!user}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !user || !selectedDate || !form.getValues('preferredTime')}
                    className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Booking...
                      </>
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