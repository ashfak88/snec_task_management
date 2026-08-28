'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { KeyRound, ShieldAlert, User as UserIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { PermissionsMatrix } from '@/components/settings/PermissionsMatrix';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'permissions'>('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/auth/change-password', data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
      setErrorMessage('');
      reset();
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to change password');
    }
  });

  const onSubmitPassword = (data: PasswordFormValues) => {
    passwordMutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {}
          <aside className="md:w-64 flex-shrink-0">
            <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-olive-100 text-olive-900' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                Profile & Security
              </button>

              {user?.role === 'Super Admin' && (
                <button
                  onClick={() => setActiveTab('permissions')}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'permissions' 
                      ? 'bg-olive-100 text-olive-900' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Roles & Permissions
                </button>
              )}
            </nav>
          </aside>

          {}
          <div className="flex-1 space-y-6">

            {activeTab === 'profile' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal account details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Full Name</Label>
                        <p className="font-medium text-lg">{user?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Email Address</Label>
                        <p className="font-medium text-lg">{user?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs uppercase tracking-wider">Role</Label>
                        <p className="font-medium flex items-center gap-2">
                          <span className="inline-flex rounded-full bg-olive-100 text-olive-800 px-2 py-0.5 text-xs font-semibold">
                            {user?.role || 'User'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-olive-600" /> 
                      Change Password
                    </CardTitle>
                    <CardDescription>Update your password to keep your account secure.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4 max-w-md">

                      {errorMessage && (
                        <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200">
                          {errorMessage}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="oldPassword">Current Password</Label>
                        <Input 
                          id="oldPassword" 
                          type="password" 
                          {...register('oldPassword')} 
                        />
                        {errors.oldPassword && <p className="text-sm text-red-500">{errors.oldPassword.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input 
                          id="newPassword" 
                          type="password" 
                          {...register('newPassword')} 
                        />
                        {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          {...register('confirmPassword')} 
                        />
                        {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                      </div>

                      <div className="pt-2">
                        <Button type="submit" disabled={isSubmitting || passwordMutation.isPending} className="w-full sm:w-auto">
                          {isSubmitting || passwordMutation.isPending ? 'Updating...' : 'Update Password'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}

            {activeTab === 'permissions' && (
              <Card>
                <CardHeader>
                  <CardTitle>Configurable Permissions Matrix</CardTitle>
                  <CardDescription>Dynamically assign capabilities to specific roles across the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <PermissionsMatrix />
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
