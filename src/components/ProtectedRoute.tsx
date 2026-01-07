// components/ProtectedRoute.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAuth();

  // Tampilkan loading sampai auth selesai
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Jika user tidak ada, redirect ke auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Jika require admin tapi bukan admin, redirect ke home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Jika semua kondisi terpenuhi, render children
  return <>{children}</>;
}