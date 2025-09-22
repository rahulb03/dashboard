import { createAsyncThunk } from '@reduxjs/toolkit'
import { axiosInstance } from '@/lib/axios'
import { API_ENDPOINTS } from '@/config/constant'

// Fetch all loan applications
export const fetchLoanApplicationsThunk = createAsyncThunk(
  'loan/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.LOAN_APPLICATION.LIST)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan applications')
    }
  }
)
  
// Fetch single loan application
export const fetchLoanApplicationByIdThunk = createAsyncThunk(
  'loan/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.LOAN_APPLICATION.GET_ONE(id))
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch loan application')
    }
  }
)

// Create new loan application
export const createLoanApplicationThunk = createAsyncThunk(
  'loan/create',
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOAN_APPLICATION.CREATE, loanData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create loan application')
    }
  }
)

// Update loan application
export const updateLoanApplicationThunk = createAsyncThunk(
  'loan/update',
  async ({ id, loanData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(API_ENDPOINTS.LOAN_APPLICATION.UPDATE(id), loanData)
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update loan application')
    }
  }
)

// Delete loan application
export const deleteLoanApplicationThunk = createAsyncThunk(
  'loan/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.LOAN_APPLICATION.DELETE(id))
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete loan application')
    }
  }
)

// Download document
export const downloadDocumentThunk = createAsyncThunk(
  'loan/downloadDocument',
  async ({ loanId  }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        API_ENDPOINTS.DOCUMENT.DOWNLOAD_DOCUMENT(loanId),
        {
          responseType: 'blob'
        }
      )
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', documentName || `document_${documentId}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      return { documentId, documentName }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download document')
    }
  }
)

// Update loan status
export const updateLoanStatusThunk = createAsyncThunk(
  'loan/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE_STATUS(id),
        { applicationStatus: status }
      )
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update loan status')
    }
  }
)

// Update payment status
export const updatePaymentStatusThunk = createAsyncThunk(
  'loan/updatePaymentStatus',
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE_PAYMENT_STATUS(id),
        { paymentStatus }
      )
      return response.data.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status')
    }
  }
)
