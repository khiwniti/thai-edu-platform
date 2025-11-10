'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'TEACHER' | 'ADMIN')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push('/login');
        return;
      }

      // Check role authorization
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard
        if (user.role === 'STUDENT') {
          router.push('/student/dashboard');
        } else if (user.role === 'TEACHER') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
