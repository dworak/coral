'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        const email = localStorage.getItem('userEmail');
        const role = localStorage.getItem('userRole');

        if (token && email && role) {
          setUser({ email, role });
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (email: string, role: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', 'mock-jwt-token');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userRole', role);
      setUser({ email, role });
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      
      // Clear cookie
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      setUser(null);
      router.push('/login');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    logout
  };
}
