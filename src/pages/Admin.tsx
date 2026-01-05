import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Package, Users, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-green-500/20 text-green-500',
  completed: 'bg-primary/20 text-primary',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function Admin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/');
        return;
      }
      fetchReservations();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchReservations = async () => {
    const { data } = await supabase.from('reservations').select('*').order('preferred_date', { ascending: true });
    if (data) setReservations(data);
    setIsLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    setUpdatingId(null);
    if (!error) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: 'Status updated' });
    }
  };

  const updateAdminNotes = async (id: string, admin_notes: string) => {
    await supabase.from('reservations').update({ admin_notes }).eq('id', id);
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes } : r)));
  };

  if (authLoading || isLoading) {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
  };

  return (
    <Layout>
      <section className="pt-20 pb-8 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-semibold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage reservations and products</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[{ label: 'Total Reservations', value: stats.total, icon: Calendar },
              { label: 'Pending', value: stats.pending, icon: Clock },
              { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2 }].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-sm p-6 flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-sm"><stat.icon className="h-6 w-6 text-primary" /></div>
                <div><p className="text-2xl font-semibold">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
              </div>
            ))}
          </div>

          <Tabs defaultValue="reservations">
            <TabsList className="bg-card border border-border"><TabsTrigger value="reservations">Reservations</TabsTrigger></TabsList>
            <TabsContent value="reservations" className="mt-6">
              <div className="space-y-4">
                {reservations.map((reservation) => (
                  <div key={reservation.id} className="bg-card border border-border rounded-sm p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-medium text-lg">{reservation.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{reservation.email} · {reservation.phone}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${statusColors[reservation.status as keyof typeof statusColors]} border-0`}>{reservation.status}</Badge>
                        <Select defaultValue={reservation.status} onValueChange={(v) => updateStatus(reservation.id, v)}>
                          <SelectTrigger className="w-32">{updatingId === reservation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}</SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div><span className="text-muted-foreground">Date:</span> {reservation.preferred_date}</div>
                      <div><span className="text-muted-foreground">Time:</span> {reservation.preferred_time}</div>
                      <div><span className="text-muted-foreground">City:</span> {reservation.city}</div>
                    </div>
                    {reservation.fragrance_preferences && <p className="text-sm mb-4"><span className="text-muted-foreground">Preferences:</span> {reservation.fragrance_preferences}</p>}
                    <Textarea placeholder="Admin notes..." defaultValue={reservation.admin_notes || ''} onBlur={(e) => updateAdminNotes(reservation.id, e.target.value)} className="bg-background" rows={2} />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}
