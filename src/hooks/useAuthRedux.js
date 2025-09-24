"use client";

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login, signup, logout, getProfile, updateProfile, changePassword } from '@/redux/auth/authThunks';
import { logoutSuccess } from '@/redux/auth/authSlice';
import { useToast } from '@/hooks/use-toast';

export const useAuthRedux = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { toast } = useToast();

  // No longer needed - redux-persist handles localStorage automatically

  const loginUser = useCallback(async (email, password) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      toast({
        title: "Login successful",
        description: `Welcome, ${result.user.name || result.user.email}`,
      });
      router.push('/dashboard');
      return { success: true, user: result.user };
    } catch (error) {
      toast({ 
        title: "Login failed", 
        description: error, 
        variant: "destructive" 
      });
      return { success: false, error };
    }
  }, [dispatch, router, toast]);

  const signupUser = useCallback(async (userData) => {
    try {
      const result = await dispatch(signup(userData)).unwrap();
      toast({
        title: "Signup successful",
        description: `Welcome, ${result.user.name || result.user.email}`,
      });
      router.push('/dashboard');
      return { success: true, user: result.user };
    } catch (error) {
      toast({ 
        title: "Signup failed", 
        description: error, 
        variant: "destructive" 
      });
      return { success: false, error };
    }
  }, [dispatch, router, toast]);

  const logoutUser = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap();
      dispatch(logoutSuccess());
      toast({ 
        title: "Logged out", 
        description: "You have been logged out." 
      });
      router.push('/login');
    } catch (error) {
      dispatch(logoutSuccess());
      toast({ 
        title: "Logged out", 
        description: "You have been logged out." 
      });
      router.push('/login');
    }
  }, [dispatch, router, toast]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const result = await dispatch(getProfile()).unwrap();
      return result;
    } catch (error) {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      });
      dispatch(logoutSuccess());
      router.push('/login');
      throw error;
    }
  }, [dispatch, router, toast]);

  const updateUserProfile = useCallback(async (profileData) => {
    try {
      const result = await dispatch(updateProfile(profileData)).unwrap();
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });
      return { success: true, user: result };
    } catch (error) {
      toast({
        title: "Update failed",
        description: error,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [dispatch, toast]);

  const changeUserPassword = useCallback(async (oldPassword, newPassword) => {
    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      toast({
        title: "Password changed successfully",
        description: "Your password has been updated.",
      });
      return { success: true, message: "Password changed successfully" };
    } catch (error) {
      toast({
        title: "Password change failed",
        description: error,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [dispatch, toast]);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: loginUser,
    signup: signupUser,
    logout: logoutUser,
    fetchProfile: fetchUserProfile,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
  };
};
