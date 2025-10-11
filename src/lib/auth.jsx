'use client';
import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useDispatch } from 'react-redux';
import { login, signup, logout, changePassword, getProfile } from '@/redux/auth/authThunks';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated, error } = useAuthRedux();
  
  // Initialize authentication on app start
  useAuthInit();


  const loginUser = async (email, password) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap();
      
      // Check if login was successful but role validation failed
      // This should be caught by the reducer, but check here too
      if (!result || !result.token) {
        return { success: false, error: 'Login failed. Please check your credentials.' };
      }
      
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      // Check if it's a role validation error
      if (error && typeof error === 'string' && error.includes('Access denied')) {
        return { success: false, error: error };
      }
      return { success: false, error: error?.message || error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(signup(userData)).unwrap();
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logoutUser = async () => {
    try {
      await dispatch(logout()).unwrap();
      router.push('/auth/sign-in');
    } catch (error) {
      // Even if logout fails on server, clear local state
      router.push('/auth/sign-in');
    }
  };

  const changeUserPassword = async (passwordData) => {
    try {
      await dispatch(changePassword(passwordData)).unwrap();
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, error: error.message || 'Password update failed' };
    }
  };

  const fetchProfile = async () => {
    try {
      await dispatch(getProfile()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login: loginUser, 
      register,
      logout: logoutUser, 
      changePassword: changeUserPassword,
      fetchProfile,
      isLoading: loading, 
      isAuthenticated,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
