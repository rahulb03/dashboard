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
    //  console.log('🔐 Auth.jsx: Login attempt');
      const result = await dispatch(login({ email, password })).unwrap();
    //  console.log('✅ Auth.jsx: Login result:', result);
      
      // With cookie-based auth, we only check for user (token is in httpOnly cookie)
      if (!result || !result.user) {
        console.error('❌ Auth.jsx: No user in result');
        return { success: false, error: 'Login failed. Please check your credentials.' };
      }
      
    //  console.log('✅ Auth.jsx: Login successful, redirecting to dashboard');
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      console.error('❌ Auth.jsx: Login error:', error);
      // Check if it's a role validation error
      if (error && typeof error === 'string' && error.includes('Access denied')) {
        return { success: false, error: error };
      }
      return { success: false, error: error?.message || error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const result = await dispatch(signup(userData)).unwrap();
      
      // Only redirect and return success if we have a valid user
      if (!result || !result.user) {
        console.error('❌ Auth.jsx: No user in signup result');
        return { success: false, error: 'Registration failed. Please try again.' };
      }
      
      // Signup successful, redirect to dashboard
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      console.error('❌ Auth.jsx: Signup error:', error);
      return { success: false, error: error.message || error || 'Registration failed' };
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
