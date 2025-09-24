import { API_ENDPOINTS } from '@/config/constant';
import { axiosInstance } from '@/lib/axios';

class PaymentAPI {
  constructor() {
    this.endpoints = API_ENDPOINTS.PAYMENTS;
    this.configEndpoints = API_ENDPOINTS.PAYMENT_CONFIG;
  }

  // Get all payment configurations
  async getAllPaymentConfigs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.isActive !== '') params.append('isActive', filters.isActive);
      
      const response = await axiosInstance.get(`${this.configEndpoints.LIST}?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get single payment configuration by ID
  async getPaymentConfigById(id) {
    try {
      const response = await axiosInstance.get(this.configEndpoints.GET_ONE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Create new payment configuration
  async createPaymentConfig(paymentConfigData) {
    try {
      const response = await axiosInstance.post(this.configEndpoints.CREATE, paymentConfigData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Update payment configuration
  async updatePaymentConfig(id, paymentConfigData) {
    try {
      const response = await axiosInstance.put(this.configEndpoints.UPDATE(id), paymentConfigData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Delete payment configuration
  async deletePaymentConfig(id) {
    try {
      const response = await axiosInstance.delete(this.configEndpoints.DELETE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Toggle payment configuration active status
  async togglePaymentConfigStatus(id) {
    try {
      const response = await axiosInstance.patch(this.configEndpoints.TOGGLE(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get active payment configurations
  async getActivePaymentConfigs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      
      const response = await axiosInstance.get(`${this.configEndpoints.ACTIVE}?${params}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const paymentAPI = new PaymentAPI();