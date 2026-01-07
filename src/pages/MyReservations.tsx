import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Reservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string;
  preferred_time: string;
  city: string;
  fragrance_preferences: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-500', icon: AlertCircle },
  confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-500', icon: CheckCircle2 },
  completed: { label: 'Completed', color: 'bg-primary/20 text-primary', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive', icon: XCircle },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchReservations();
    }
  }, [user, authLoading, navigate]);

  const fetchReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setReservations(data);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-20 pb-16 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <p className="text-primary uppercase tracking-[0.3em] text-sm font-medium mb-4">
              Your Consultations
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              My Reservations
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {reservations.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h2 className="font-display text-2xl font-medium mb-4">
                No reservations yet
              </h2>
              <p className="text-muted-foreground mb-8">
                Book your first bespoke consultation today.
              </p>
              <a href="/custom-parfume">
                <button className="bg-gradient-gold text-primary-foreground px-6 py-3 rounded-sm hover:opacity-90 transition-opacity">
                  Book Consultation
                </button>
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map((reservation, index) => {
                const status = statusConfig[reservation.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-sm p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-display text-lg font-medium mb-1">
                          Bespoke Consultation
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Booked on {new Date(reservation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={`${status.color} border-0 flex items-center gap-1 w-fit`}>
                        <StatusIcon className="h-3 w-3 " />
                        {status.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm">{formatDate(reservation.preferred_date)}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">{reservation.preferred_time}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm">{reservation.city} Atelier</span>
                      </div>
                    </div>

                    {reservation.fragrance_preferences && (
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Your Preferences
                        </p>
                        <p className="text-sm">{reservation.fragrance_preferences}</p>
                      </div>
                    )}

                    {reservation.admin_notes && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                        <p className="text-xs uppercase tracking-wide text-primary mb-1">
                          Note from Maison Élixir
                        </p>
                        <p className="text-sm">{reservation.admin_notes}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
