import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Users as UsersIcon,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Mail,
  Phone,
  CalendarDays,
  MoreVertical,
  Filter,
  Check,
  MapPin

} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase , supabaseAdmin} from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { log } from 'console';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
  user_id: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'user';
  created_at: string;
  total_bookings: number;
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-green-500/20 text-green-500',
  completed: 'bg-blue-500/20 text-blue-500',
  cancelled: 'bg-destructive/20 text-destructive',
};

const roleColors = {
  admin: 'bg-purple-500/20 text-purple-500',
  user: 'bg-blue-500/20 text-blue-500',
};

// Status filter options
const statusOptions = [
  { value: 'pending', label: 'Pending', color: statusColors.pending },
  { value: 'confirmed', label: 'Confirmed', color: statusColors.confirmed },
  { value: 'completed', label: 'Completed', color: statusColors.completed },
  { value: 'cancelled', label: 'Cancelled', color: statusColors.cancelled },
];

export default function Admin() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'reservations' | 'users'>('reservations');
  const [isSpecificReservation, setIsSpecificReservation] = useState(false);
  const [specificUserId, setSpecificUserId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['pending', 'confirmed', 'completed']);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (isSpecificReservation && specificUserId) {
      fetchReservationsUserId(specificUserId);
    } else {
      fetchReservations();
    }
  }, [selectedStatuses]);

  

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .order('preferred_date', { ascending: true });

      // Apply status filter
      if (selectedStatuses.length > 0) {
        query = query.in('status', selectedStatuses);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) setReservations(data);
    } catch (error: any) {
      toast({
        title: 'Failed to fetch reservations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchReservationsUserId = async (userId: string) => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .eq('user_id', userId);

      // Apply status filter even for specific user
      if (selectedStatuses.length > 0) {
        query = query.in('status', selectedStatuses);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) setReservations(data);
    } catch (error: any) {
      toast({
        title: 'Failed to fetch reservations',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('reservations')
        .select('user_id');

      if (bookingsError) throw bookingsError;

      const bookingCounts: Record<string, number> = {};
      bookingsData?.forEach(booking => {
        bookingCounts[booking.user_id] = (bookingCounts[booking.user_id] || 0) + 1;
      });

      const combinedUsers = (usersData || []).map(user => {
        const userRole = rolesData?.find(role => role.user_id === user.id);
        const totalBookings = bookingCounts[user.id] || 0;

        return {
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          phone: user.phone || '',
          role: (userRole?.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
          created_at: user.created_at,
          total_bookings: totalBookings,
        };
      });

      setUsers(combinedUsers);
    } catch (error: any) {
      toast({
        title: 'Failed to fetch users',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setIsSpecificReservation(false);
    setSpecificUserId(null);
    setTimeout(async () => {
      await fetchReservations();
    }, 500);
  };

  const handleRefreshUsers = async () => {
    await fetchUsers();
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
    setUpdatingId(null);
    if (!error) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast({ title: 'Status updated' });
    } else {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateAdminNotes = async (id: string, admin_notes: string) => {
    const { error } = await supabase.from('reservations').update({ admin_notes }).eq('id', id);
    if (!error) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, admin_notes } : r)));
    } else {
      toast({
        title: 'Failed to update notes',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const selectAllStatuses = () => {
    setSelectedStatuses(['pending', 'confirmed', 'completed', 'cancelled']);
  };

  const clearAllStatuses = () => {
    setSelectedStatuses([]);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const stats = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    completed: reservations.filter((r) => r.status === 'completed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
    users: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
    console.log(user)
  };
  const handleDeleteAccount = async () => {
  if (!userToDelete) return;
  setIsDeleting(true);
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('You need to be logged in to perform this action');
    }
    
    const { data, error } = await supabaseAdmin.functions.invoke('delete-user', {
      body: {
        userId: userToDelete.id,
        currentUserId: session.user.id
      }
    });

    if (error) throw error;

    setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
    setIsSpecificReservation(false);
    setSpecificUserId(null);
    toast({
      title: 'Account deleted',
      description: 'User account has been permanently removed.',
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    toast({
      title: 'Failed to delete account',
      description: error.message || 'An error occurred while deleting the account',
      variant: 'destructive',
    });
  } finally {
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  }
};
  return (
    <Layout>
      <section className="pt-20 pb-8 bg-gradient-noir">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          >
            <div>
              <h1 className="font-display text-3xl font-semibold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage reservations, users, and system settings</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh All
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Total Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <Calendar className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.users}</div>
                  <UsersIcon className="h-8 w-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Pending Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.pending}</div>
                  <Clock className="h-8 w-8 text-yellow-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Complete Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold">{stats.completed}</div>
                  <Check className="h-8 w-8 text-yellow-500/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'reservations' | 'users')} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="reservations" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  Reservations
                </TabsTrigger>
                <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  User Management
                </TabsTrigger>
              </TabsList>
            </div>

            <div className='p-2'>
              {activeTab === 'reservations' ? (isSpecificReservation ? (
                <p className='text-muted-foreground'>{reservations[0]?.email} Reservation</p>
              ) : (
                <p className='text-muted-foreground capitalize'>All Reservations</p>
              )) : null}
            </div>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-6">
              {/* Status Filter */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Filter by Status</CardTitle>
                      <CardDescription>
                        Showing {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
                        {selectedStatuses.length > 0 && ` (${selectedStatuses.length} status${selectedStatuses.length !== 1 ? 'es' : ''} selected)`}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <DropdownMenu open={statusFilterOpen} onOpenChange={setStatusFilterOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Status Filter
                            {selectedStatuses.length > 0 && (
                              <Badge variant="secondary" className="ml-1">
                                {selectedStatuses.length}
                              </Badge>
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Select Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {statusOptions.map((option) => (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={selectedStatuses.includes(option.value)}
                              onCheckedChange={() => handleStatusFilterChange(option.value)}
                              className="flex items-center gap-2"
                            >
                              <div className={`h-2 w-2 rounded-full ${option.color}`} />
                              {option.label}
                              {selectedStatuses.includes(option.value) && (
                                <Check className="h-3 w-3 ml-auto" />
                              )}
                            </DropdownMenuCheckboxItem>
                          ))}
                          <DropdownMenuSeparator />
                          <div className="flex justify-between p-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={selectAllStatuses}
                              className="h-8 text-xs"
                            >
                              Select All
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllStatuses}
                              className="h-8 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {isSpecificReservation && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsSpecificReservation(false);
                            setSpecificUserId(null);
                            fetchReservations();
                          }}
                          className="flex items-center gap-2"
                        >
                          View All Reservations
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedStatuses.length === 0 ? (
                      <Badge variant="outline" className="text-muted-foreground">
                        No status selected
                      </Badge>
                    ) : (
                      selectedStatuses.map(status => {
                        const option = statusOptions.find(opt => opt.value === status);
                        return (
                          <Badge
                            key={status}
                            className={`${option?.color} border-0 flex items-center gap-1`}
                          >
                            {option?.label}
                            <button
                              onClick={() => handleStatusFilterChange(status)}
                              className="ml-1 hover:opacity-70"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reservations List */}
              <div className="space-y-4">
                {reservations.length === 0 ? (
                  <Card className="border-border">
                    <CardContent className="pt-6 pb-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No reservations found</h3>
                      <p className="text-muted-foreground">
                        {selectedStatuses.length === 0
                          ? "Please select at least one status to view reservations."
                          : "No reservations match the selected status filter."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  reservations.map((reservation) => (
                    <Card key={reservation.id} className="border-border overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{reservation.full_name}</CardTitle>
                            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {reservation.email}
                              </span>
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {reservation.phone}
                              </span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${statusColors[reservation.status as keyof typeof statusColors]} border-0`}>
                              {reservation.status}
                            </Badge>
                            <Select
                              value={reservation.status}
                              onValueChange={(v) => updateStatus(reservation.id, v)}
                              disabled={updatingId === reservation.id}
                            >
                              <SelectTrigger className="w-32">
                                {updatingId === reservation.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                          <div className='flex items-center'>
                            <MapPin  className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span><strong>Location:</strong> {reservation.city}</span>
                          </div>
                        </div>
                        <div className='flex flex-col gap-2'>

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

                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground mb-2">Admin Notes</p>
                          <Textarea
                            placeholder="Add notes about this reservation..."
                            defaultValue={reservation.admin_notes || ''}
                            onBlur={(e) => updateAdminNotes(reservation.id, e.target.value)}
                            className="bg-background min-h-[80px]"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage user accounts and permissions</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshUsers}
                        disabled={isLoadingUsers}
                      >
                        {isLoadingUsers ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name, email, or phone..."
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-48">
                      <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                        <SelectTrigger>
                          <Filter className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin Only</SelectItem>
                          <SelectItem value="user">User Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="space-y-4">
                    {isLoadingUsers ? (
                      <div className="text-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="mt-2 text-muted-foreground">Loading users...</p>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-center py-12">
                        <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No users found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(user.full_name || user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{user.full_name || 'No Name'}</h4>
                                <Badge className={`${roleColors[user.role]} border-0 text-xs`}>
                                  {user.role !== 'user' ? `${user.role} (you)` : user.role}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {user.email}
                                </span>
                                {user.phone && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {user.phone}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                {user.role === 'user' && (
                                  <span>Bookings: {user.total_bookings}</span>
                                )
                                }
                                <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.role !== 'admin' ? (

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setActiveTab('reservations');
                                    setSpecificUserId(user.id);
                                    setIsSpecificReservation(true);
                                    fetchReservationsUserId(user.id);
                                  }}>
                                    View Bookings
                                  </DropdownMenuItem>
                                  {/* <DropdownMenuItem>Send Email</DropdownMenuItem> */}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    Delete Account
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and all associated data including their booking history.
            </AlertDialogDescription>
            <div className='text-muted-foreground text-sm'>
                <p>This will delete: </p>
              <ul className='list-disc mx-4'>
                <li>User Account</li>
                <li>All bookings ({userToDelete?.total_bookings} total)</li>
                <li>User profile data</li>
              </ul>
                <p>This action cannot be undone.</p>
            </div>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}