'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import SolarLogo from './SolarLogo';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication - in real app, this would call your API
      if (formData.email === 'admin@solar.com' && formData.password === 'admin123') {
        // Store auth token in localStorage and cookies
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', 'admin');
        
        // Set cookie for middleware
        document.cookie = 'authToken=mock-jwt-token; path=/; max-age=86400'; // 24 hours
        
        // Force page reload to ensure middleware picks up the new token
        window.location.href = '/';
      } else if (formData.email === 'user@solar.com' && formData.password === 'user123') {
        // Store auth token in localStorage and cookies
        localStorage.setItem('authToken', 'mock-jwt-token');
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('userRole', 'user');
        
        // Set cookie for middleware
        document.cookie = 'authToken=mock-jwt-token; path=/; max-age=86400'; // 24 hours
        
        // Force page reload to ensure middleware picks up the new token
        window.location.href = '/';
      } else {
        setError('Nieprawidłowy email lub hasło');
      }
    } catch (err) {
      setError('Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <SolarLogo width={200} height={48} className="h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Zaloguj się
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Do swojego konta Solar Monitoring
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Logowanie</CardTitle>
            <CardDescription>
              Wprowadź swoje dane logowania, aby uzyskać dostęp do systemu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="twoj@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Logowanie...' : 'Zaloguj się'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Dane testowe:
              </h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Admin:</strong> admin@solar.com / admin123</div>
                <div><strong>User:</strong> user@solar.com / user123</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
