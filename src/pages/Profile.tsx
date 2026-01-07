import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Lock, Eye, EyeOff, Save, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Schema untuk update profile
const profileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function Profile() {
    const { user, signIn,  } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // console.log(user);
    const profileForm = useForm<ProfileData>({
        resolver: zodResolver(profileSchema),
    });

    const passwordForm = useForm<PasswordData>({
        resolver: zodResolver(passwordSchema),
    });

    // Load user data when component mounts
    useEffect(() => {
        if (user) {
            const userData = {
                fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
                email: user.email || '',
            };
            profileForm.reset(userData);
        }
    }, [user, profileForm]);

    const handleProfileUpdate = async (data: ProfileData) => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Update user metadata in Supabase
            const { error: updateError } = await supabase.auth.updateUser({
                data: {
                    full_name: data.fullName,
                    name: data.fullName
                }
            });

            if (updateError) throw updateError;

            toast({
                title: 'Profile updated',
                description: 'Your profile information has been updated successfully.',
            });
        } catch (error: any) {
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update profile. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (data: PasswordData) => {
        if (!user?.email) return;

        setIsUpdatingPassword(true);
        try {
            // First, sign in with current password to verify
            const { error: signInError } = await signIn(user.email, data.currentPassword);

            if (signInError) {
                throw new Error('Current password is incorrect');
            }

            // Update password
            const { error: updateError } = await supabase.auth.updateUser({
                password: data.newPassword,
            });

            if (updateError) throw updateError;

            toast({
                title: 'Password updated',
                description: 'Your password has been changed successfully.',
            });

            // Reset password form
            passwordForm.reset();
        } catch (error: any) {
            toast({
                title: 'Password update failed',
                description: error.message || 'Failed to update password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <Layout>
            <div className="container mx-auto px-4 lg:px-8 py-20 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
                            <p className="text-muted-foreground">
                                Manage your personal information and account settings
                            </p>
                        </div>

                        {/* Profile Information Card */}
                        <Card className="mb-6 border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details here
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName">Full Name</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="fullName"
                                                    placeholder="Your full name"
                                                    className="pl-10 bg-background border-border"
                                                    {...profileForm.register('fullName')}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            {profileForm.formState.errors.fullName && (
                                                <p className="text-sm text-destructive">
                                                    {profileForm.formState.errors.fullName.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    className="pl-10 bg-background border-border"
                                                    {...profileForm.register('email')}
                                                    disabled
                                                    readOnly
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed. Please contact support if you need to update your email.
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || !profileForm.formState.isDirty}
                                        className="w-full sm:w-auto"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Change Password Card */}
                        <Card className="border-border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5" />
                                    Change Password
                                </CardTitle>
                                <CardDescription>
                                    Update your password to keep your account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="currentPassword"
                                                    type={showCurrentPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 bg-background border-border"
                                                    {...passwordForm.register('currentPassword')}
                                                    disabled={isUpdatingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    disabled={isUpdatingPassword}
                                                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showCurrentPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.currentPassword && (
                                                <p className="text-sm text-destructive">
                                                    {passwordForm.formState.errors.currentPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    type={showNewPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 bg-background border-border"
                                                    {...passwordForm.register('newPassword')}
                                                    disabled={isUpdatingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    disabled={isUpdatingPassword}
                                                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showNewPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.newPassword && (
                                                <p className="text-sm text-destructive">
                                                    {passwordForm.formState.errors.newPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10 bg-background border-border"
                                                    {...passwordForm.register('confirmPassword')}
                                                    disabled={isUpdatingPassword}
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    disabled={isUpdatingPassword}
                                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {passwordForm.formState.errors.confirmPassword && (
                                                <p className="text-sm text-destructive">
                                                    {passwordForm.formState.errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <Button
                                            type="submit"
                                            disabled={isUpdatingPassword || !passwordForm.formState.isDirty}
                                            className="w-full sm:w-auto"
                                        >
                                            {isUpdatingPassword ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-2" />
                                            )}
                                            Update Password
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                passwordForm.reset();
                                                setShowCurrentPassword(false);
                                                setShowNewPassword(false);
                                                setShowConfirmPassword(false);
                                            }}
                                            className="w-full sm:w-auto"
                                            disabled={isUpdatingPassword}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Info (Read-only) */}
                        <Card className="mt-6 border-border">
                            <CardHeader>
                                <CardTitle>Account Information</CardTitle>
                                <CardDescription>
                                    Your account details
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-border">
                                        <span className="text-muted-foreground">Account Created:</span>
                                        <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'numeric',
                                            year: 'numeric',
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <span className="text-muted-foreground">Last Sign In:</span>
                                        <span>{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'numeric',
                                            year: 'numeric',
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        }) : 'N/A'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}