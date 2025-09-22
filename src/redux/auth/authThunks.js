import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance, unauthenticatedAxios } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';

const extractResponse = (data) => {
  const token = data?.data?.token || data?.token;
  const user = data?.data?.user || data?.user || data?.data || data;
  return { token, user };
};

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await unauthenticatedAxios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token, user } = extractResponse(response.data.data);
    if (!token || !user) throw new Error('Invalid login response');
    return { token, user };
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Login failed';
    return rejectWithValue(message);
  }
});

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await unauthenticatedAxios.post(API_ENDPOINTS.AUTH.SIGN_UP, userData);
    const { token, user } = extractResponse(response.data);
    if (!token || !user) throw new Error('Invalid signup response');
    return { token, user };
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Signup failed';
    return rejectWithValue(message);
  }
});

export const getProfile = createAsyncThunk('auth/getProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(API_ENDPOINTS.AUTH.PROFILE);
    const { user } = extractResponse(response.data.data);
    if (!user) throw new Error('No user data found');
    return user;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to fetch profile';
    return rejectWithValue(message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(API_ENDPOINTS.AUTH.UPDATE, profileData);
    const { user } = extractResponse(response.data.data);
    if (!user) throw new Error('Invalid profile update response');
    return user;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to update profile';
    return rejectWithValue(message);
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async ({ oldPassword, newPassword }, { rejectWithValue }) => {
  try {
    await axiosInstance.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, { oldPassword, newPassword });
    return;
  } catch (error) {
    const message = error?.response?.data?.message || error.message || 'Failed to change password';
    return rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.get(API_ENDPOINTS.AUTH.LOGOUT);
  } catch (error) {
    // Don't reject, just log the error and proceed with client-side logout
    console.warn('Logout request failed, continuing with client-side logout...', error);
  }
});
