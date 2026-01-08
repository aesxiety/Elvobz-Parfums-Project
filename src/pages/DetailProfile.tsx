import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Tag,
  CalendarDays,
  FileText,
  ShieldAlert,
  UserCog
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase,supabaseAdmin } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string | null;
  role: 'admin' | 'user';
  total_bookings: number;
}

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
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-500 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  completed: Shield,
  cancelled: XCircle,
};

export default function DetailProfile() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserReservations();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      // Fetch total bookings
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (bookingsError) console.error('Bookings count error:', bookingsError);

      const userProfile: UserProfile = {
        id: profileData.id,
        email: profileData.email || '',
        full_name: profileData.full_name,
        phone: profileData.phone,
        city: profileData.city,
        avatar_url: profileData.avatar_url,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        role: roleData?.role === 'admin' ? 'admin' : 'user',
        total_bookings: bookingsCount || 0,
      };

      setUser(userProfile);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      toast({
        title: 'Failed to load user data',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId)
        .order('preferred_date', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      console.error('Error fetching reservations:', error);
    }
  };

  

  const handleDeleteUser = async () => {
    if (!user) return;
    
    try {
      // Call the Edge Function to delete user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You need to be logged in to perform this action');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ 
            userId: user.id,
            currentUserId: session.user.id
          })
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete user');
      }

      toast({
        title: 'Account deleted',
        description: 'User account has been permanently removed.',
      });

      navigate('/admin');
    } catch (error: any) {
      toast({
        title: 'Failed to delete account',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The user you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  return (
    <Layout>
      <section className="pt-20 pb-8 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
                className="hover:bg-accent"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-3xl font-semibold mb-1">User Profile</h1>
                <p className="text-muted-foreground">Manage user account and view details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
            {/* opsional (boleh dipakek atau nggak), bisa action hapus user di /admin */}
              {/* <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button> */}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - User Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-4">
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>Account details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-background">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-lg bg-primary/10 text-primary">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{user.full_name || 'No Name'}</h3>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge className={`${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-500 border-purple-500/30' 
                            : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          ID: {user.id.substring(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="font-medium">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    {user.city && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{user.city}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Account Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">{user.total_bookings}</p>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold">
                        {completedReservations.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Pending</span>
                      <span className="font-medium">{pendingReservations.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confirmed</span>
                      <span className="font-medium">{confirmedReservations.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cancelled</span>
                      <span className="font-medium">{cancelledReservations.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Reservations & Activity */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-card border border-border">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="reservations">Reservations ({reservations.length})</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Recent Reservations</CardTitle>
                      <CardDescription>
                        Latest booking activities from this user
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reservations.length === 0 ? (
                        <div className="text-center py-8">
                          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No reservations found</h3>
                          <p className="text-muted-foreground">
                            This user hasn't made any reservations yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reservations.slice(0, 5).map((reservation) => {
                            const StatusIcon = statusIcons[reservation.status as keyof typeof statusIcons] || Tag;
                            return (
                              <div
                                key={reservation.id}
                                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`p-2 rounded-lg ${statusColors[reservation.status as keyof typeof statusColors]}`}>
                                    <StatusIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{reservation.full_name}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <CalendarDays className="h-3 w-3" />
                                      <span>{reservation.preferred_date} at {reservation.preferred_time}</span>
                                      <span>•</span>
                                      <MapPin className="h-3 w-3" />
                                      <span>{reservation.city}</span>
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${statusColors[reservation.status as keyof typeof statusColors]} border-0`}>
                                  {reservation.status}
                                </Badge>
                              </div>
                            );
                          })}
                          {reservations.length > 5 && (
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => setActiveTab('reservations')}
                            >
                              View all {reservations.length} reservations
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of reservation statuses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { status: 'Pending', count: pendingReservations.length, color: 'bg-yellow-500' },
                          { status: 'Confirmed', count: confirmedReservations.length, color: 'bg-green-500' },
                          { status: 'Completed', count: completedReservations.length, color: 'bg-blue-500' },
                          { status: 'Cancelled', count: cancelledReservations.length, color: 'bg-destructive' },
                        ].map((item) => (
                          <div key={item.status} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.status}</span>
                              <span className="text-muted-foreground">{item.count}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                style={{
                                  width: reservations.length > 0 
                                    ? `${(item.count / reservations.length) * 100}%` 
                                    : '0%'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reservations" className="space-y-4">
                  {reservations.length === 0 ? (
                    <Card className="border-border">
                      <CardContent className="pt-6 pb-6 text-center">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No reservations found</h3>
                        <p className="text-muted-foreground">
                          This user hasn't made any reservations yet.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    reservations.map((reservation) => {
                      const StatusIcon = statusIcons[reservation.status as keyof typeof statusIcons] || Tag;
                      return (
                        <Card key={reservation.id} className="border-border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${statusColors[reservation.status as keyof typeof statusColors]}`}>
                                  <StatusIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{reservation.full_name}</CardTitle>
                                  <CardDescription>
                                    {reservation.email} • {reservation.phone}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge className={`${statusColors[reservation.status as keyof typeof statusColors]} border-0`}>
                                {reservation.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span><strong>Date:</strong> {reservation.preferred_date}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span><strong>Time:</strong> {reservation.preferred_time}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span><strong>City:</strong> {reservation.city}</span>
                              </div>
                            </div>

                            {reservation.fragrance_preferences && (
                              <div className="text-sm">
                                <p className="font-medium text-muted-foreground mb-1">Fragrance Preferences:</p>
                                <p className="text-foreground">{reservation.fragrance_preferences}</p>
                              </div>
                            )}

                            {reservation.notes && (
                              <div className="text-sm">
                                <p className="font-medium text-muted-foreground mb-1">Notes:</p>
                                <p className="text-foreground">{reservation.notes}</p>
                              </div>
                            )}

                            {reservation.admin_notes && (
                              <div className="text-sm">
                                <p className="font-medium text-muted-foreground mb-1">Admin Notes:</p>
                                <p className="text-foreground">{reservation.admin_notes}</p>
                              </div>
                            )}

                            <div className="text-sm text-muted-foreground">
                              <p>Created: {formatDateTime(reservation.created_at)}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle>Account Activity</CardTitle>
                      <CardDescription>
                        Timeline of user actions and events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Account Created</p>
                            <p className="text-sm text-muted-foreground">
                              User registered on {formatDateTime(user.created_at)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            System
                          </Badge>
                        </div>

                        {reservations.length > 0 && (
                          <div className="flex items-start gap-4">
                            <div className="bg-blue-500/10 p-2 rounded-full">
                              <CalendarDays className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">First Reservation</p>
                              <p className="text-sm text-muted-foreground">
                                Made first reservation on {formatDateTime(reservations[reservations.length - 1].created_at)}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Booking
                            </Badge>
                          </div>
                        )}

                        {user.role === 'admin' && (
                          <div className="flex items-start gap-4">
                            <div className="bg-purple-500/10 p-2 rounded-full">
                              <ShieldAlert className="h-4 w-4 text-purple-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Admin Privileges Granted</p>
                              <p className="text-sm text-muted-foreground">
                                User has administrative access to the system
                              </p>
                            </div>
                            <Badge className="bg-purple-500/20 text-purple-500 border-0">
                              Admin
                            </Badge>
                          </div>
                        )}

                        {user.updated_at && (
                          <div className="flex items-start gap-4">
                            <div className="bg-green-500/10 p-2 rounded-full">
                              <Edit className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Profile Updated</p>
                              <p className="text-sm text-muted-foreground">
                                Last updated on {formatDateTime(user.updated_at)}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              User
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data including their booking history.
            </AlertDialogDescription>
            <div className="text-muted-foreground text-sm">
              <p>This will delete:</p>
              <ul className="list-disc mx-4">
                <li>User Account ({user.email})</li>
                <li>All bookings ({user.total_bookings} total)</li>
                <li>User profile data</li>
                <li>User role permissions</li>
              </ul>
              <p className="mt-2">This action cannot be undone.</p>
            </div>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}