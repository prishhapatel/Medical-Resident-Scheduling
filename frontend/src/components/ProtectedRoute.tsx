'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { isAuthenticated } from '../lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
    }
  }, [router]);

  // Show nothing while checking authentication
  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}