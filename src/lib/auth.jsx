'use client';
import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRedux } from '@/hooks/useAuthRedux';
import { useDispatch } from 'react-redux';
import { loginThunk, registerThunk, logoutThunk, updatePasswordThunk, fetchUserProfileThunk } from '@/redux/auth/authThunks';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated, error } = useAuthRedux();

  useEffect(() => {
    // Set cookie for middleware when user is authenticated
    if (isAuthenticated && user) {
      document.cookie = `session=true; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    } else {
      // Remove session cookie when not authenticated
      document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }, [isAuthenticated, user]);

  const login = async (email, password) => {
    try {
      await dispatch(loginThunk({ email, password })).unwrap();
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await dispatch(registerThunk(userData)).unwrap();
      router.push('/dashboard/overview');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.push('/auth/sign-in');
    } catch (error) {
      // Even if logout fails on server, clear local state
      router.push('/auth/sign-in');
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await dispatch(updatePasswordThunk(passwordData)).unwrap();
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      return { success: false, error: error.message || 'Password update failed' };
    }
  };

  const fetchProfile = async () => {
    try {
      await dispatch(fetchUserProfileThunk()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Failed to fetch profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      changePassword,
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
