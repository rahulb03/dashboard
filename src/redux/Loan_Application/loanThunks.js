import { createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/constant';
import dataCache from '@/utils/DataCacheManager';

// Fetch all loan applications
export const fetchLoanApplicationsThunk = createAsyncThunk(
  'loan/fetchAll',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const cacheKey = {};

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('loanApplications', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.LOAN_APPLICATION.LIST
      );
      const data = {
        loanApplications: response.data.data.loanApplications,
        summary: response.data.data.summary,
        pagination: response.data.data.pagination,
        cached: false
      };

      // Update cache with new data
      dataCache.set('loanApplications', data, cacheKey);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch loan applications'
      );
    }
  }
);

// Fetch single loan application
export const fetchLoanApplicationByIdThunk = createAsyncThunk(
  'loan/fetchById',
  async ({ id, forceRefresh = false }, { rejectWithValue }) => {
    try {
      const cacheKey = { loanId: id };

      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = dataCache.get('loanApplication', cacheKey);
        if (cached.cached) {
          return cached.data;
        }
      }

      const response = await axiosInstance.get(
        API_ENDPOINTS.LOAN_APPLICATION.GET_ONE(id)
      );
      const data = response.data.data;

      // Update cache with new data
      dataCache.set('loanApplication', data, cacheKey);

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch loan application'
      );
    }
  }
);

// Create new loan application
export const createLoanApplicationThunk = createAsyncThunk(
  'loan/create',
  async (loanData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        API_ENDPOINTS.LOAN_APPLICATION.CREATE,
        loanData
      );
      const newLoan = response.data.data;
      // Redux state handles the update now - no cache manipulation
      return newLoan;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create loan application'
      );
    }
  }
);

// Update loan application
export const updateLoanApplicationThunk = createAsyncThunk(
  'loan/update',
  async ({ id, loanData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE(id),
        loanData
      );
      const updatedLoan = response.data.data;
      // Redux state handles the update now - no cache manipulation
      return updatedLoan;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update loan application'
      );
    }
  }
);

// Delete loan application
export const deleteLoanApplicationThunk = createAsyncThunk(
  'loan/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.LOAN_APPLICATION.DELETE(id));
      // Redux state handles the update now - no cache manipulation
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete loan application'
      );
    }
  }
);

// View document (get URL for viewing)
export const viewDocumentThunk = createAsyncThunk(
  'loan/viewDocument',
  async (
    { documentId, applicationId, documentName, documentPath },
    { rejectWithValue }
  ) => {
    console.log('🔍 View thunk called with:', {
      documentId,
      applicationId,
      documentName,
      documentPath
    });

    if (!applicationId) {
      console.error('❌ View thunk: Missing applicationId');
      return rejectWithValue('Application ID is required');
    }

    try {
      // Extract filename from path (which contains the actual saved filename with timestamp)
      let fileName;
      if (documentPath) {
        // Extract filename from path - this will be the actual saved filename with timestamp
        fileName = documentPath.split(/[\\/]/).pop(); // Handle both Windows and Unix path separators
        console.log('📁 Using filename from path:', fileName);
      } else if (documentName) {
        // Fallback to document name if no path available
        fileName = documentName;
        console.log('📝 Using document name as fallback:', fileName);
      } else {
        console.error(
          '❌ Cannot determine filename - no path or name provided'
        );
        return rejectWithValue('Cannot determine document filename');
      }

      // URL encode the filename to handle spaces and special characters
      const encodedFileName = encodeURIComponent(fileName);

      // Construct direct file URL: localhost:3000/uploads/documents/applicationid/filename
      const fileUrl = `http://localhost:3000/uploads/documents/${applicationId}/${encodedFileName}`;
      console.log('🔗 Direct file view URL:', fileUrl);
      console.log('📝 Original filename:', fileName);
      console.log('📝 Encoded filename:', encodedFileName);

      // Open document directly in new tab for viewing
      window.open(fileUrl, '_blank');

      console.log('✅ Document opened in new tab for viewing:', fileName);

      return {
        url: fileUrl,
        documentId,
        applicationId
      };
    } catch (error) {
      console.error('❌ View document error:', error);
      return rejectWithValue(error.message || 'Failed to view document');
    }
  }
);

// Download document
export const downloadDocumentThunk = createAsyncThunk(
  'loan/downloadDocument',
  async (
    { documentId, applicationId, documentName, documentPath },
    { rejectWithValue }
  ) => {
    console.log('🚀 Download thunk called with:', {
      documentId,
      applicationId,
      documentName,
      documentPath
    });

    // Validate required parameters
    if (!applicationId) {
      console.error('❌ Download thunk: Missing applicationId');
      return rejectWithValue('Application ID is required');
    }

    if (!documentName && !documentPath) {
      console.error('❌ Download thunk: Missing document name or path');
      return rejectWithValue('Document name or path is required');
    }

    try {
      // Extract filename from path (which contains the actual saved filename with timestamp)
      let fileName;
      if (documentPath) {
        // Extract filename from path - this will be the actual saved filename with timestamp
        fileName = documentPath.split(/[\\/]/).pop(); // Handle both Windows and Unix path separators
        console.log('📁 Using filename from path:', fileName);
      } else if (documentName) {
        // Fallback to document name if no path available
        fileName = documentName;
        console.log('📝 Using document name as fallback:', fileName);
      } else {
        console.error(
          '❌ Cannot determine filename - no path or name provided'
        );
        return rejectWithValue('Cannot determine document filename');
      }

      // URL encode the filename to handle spaces and special characters
      const encodedFileName = encodeURIComponent(fileName);

      // Construct direct file URL: localhost:3000/uploads/documents/applicationid/filename
      const fileUrl = `http://localhost:3000/uploads/documents/${applicationId}/${encodedFileName}`;
      console.log('🔗 Direct file URL:', fileUrl);
      console.log('📝 Original filename:', fileName);
      console.log('📝 Encoded filename:', encodedFileName);

      // Try to download using fetch and blob (more reliable)
      try {
        console.log('📦 Attempting fetch-based download...');
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        // Create download link with blob
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);

        console.log('✅ Document downloaded successfully via fetch:', fileName);
      } catch (fetchError) {
        console.log(
          '⚠️ Fetch download failed, trying direct link method:',
          fetchError.message
        );

        // Fallback to direct link method
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName; // This forces download instead of opening in tab
        link.target = '_blank'; // Fallback for browsers that don't support download

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(
          '✅ Document download triggered via direct link:',
          fileName
        );
      }

      return { documentId, documentName: fileName };
    } catch (error) {
      console.error('❌ Download error:', error);
      return rejectWithValue(error.message || 'Failed to download document');
    }
  }
);

// Update loan status
export const updateLoanStatusThunk = createAsyncThunk(
  'loan/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE_STATUS(id),
        { applicationStatus: status }
      );
      const updatedLoan = response.data.data;
      // Redux state handles the update now - no cache manipulation
      return updatedLoan;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update loan status'
      );
    }
  }
);

// Update payment status
export const updatePaymentStatusThunk = createAsyncThunk(
  'loan/updatePaymentStatus',
  async ({ id, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE_PAYMENT_STATUS(id),
        { paymentStatus }
      );
      const updatedLoan = response.data.data;
      // Redux state handles the update now - no cache manipulation
      return updatedLoan;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update payment status'
      );
    }
  }
);

// Create loan application with documents
export const createLoanApplicationWithDocumentsThunk = createAsyncThunk(
  'loan/createWithDocuments',
  async ({ loanData, documents }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Add loan application data to FormData
      Object.keys(loanData).forEach((key) => {
        if (loanData[key] !== null && loanData[key] !== undefined) {
          formData.append(key, loanData[key]);
        }
      });

      // Add documents to FormData
      const documentTypes = [];
      documents.forEach((doc, index) => {
        formData.append('documents', doc.file);
        documentTypes.push(doc.type);
      });

      // Add document types array
      documentTypes.forEach((type) => {
        formData.append('documentTypes', type);
      });

      console.log('📤 Creating loan application with documents:', {
        loanDataKeys: Object.keys(loanData),
        documentCount: documents.length,
        documentTypes
      });

      const response = await axiosInstance.post(
        API_ENDPOINTS.LOAN_APPLICATION.CREATE_WITH_DOCUMENTS(),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('❌ Create with documents error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.data?.non_field_message ||
          'Failed to create loan application with documents'
      );
    }
  }
);

// Update loan application with documents
export const updateLoanApplicationWithDocumentsThunk = createAsyncThunk(
  'loan/updateWithDocuments',
  async (
    { id, loanData, documents, replaceExistingDocuments = false },
    { rejectWithValue }
  ) => {
    try {
      const formData = new FormData();

      // Add loan application data to FormData
      Object.keys(loanData).forEach((key) => {
        if (loanData[key] !== null && loanData[key] !== undefined) {
          formData.append(key, loanData[key]);
        }
      });

      // Add document replacement flag
      formData.append(
        'replaceExistingDocuments',
        replaceExistingDocuments.toString()
      );

      // Add documents to FormData if any
      if (documents && documents.length > 0) {
        const documentTypes = [];
        documents.forEach((doc, index) => {
          formData.append('documents', doc.file);
          documentTypes.push(doc.type);
        });

        // Add document types array
        documentTypes.forEach((type) => {
          formData.append('documentTypes', type);
        });
      }

      console.log('📤 Updating loan application with documents:', {
        id,
        loanDataKeys: Object.keys(loanData),
        documentCount: documents?.length || 0,
        replaceExistingDocuments
      });

      const response = await axiosInstance.put(
        API_ENDPOINTS.LOAN_APPLICATION.UPDATE_WITH_DOCUMENTS(id),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('❌ Update with documents error:', error);
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data?.data?.non_field_message ||
          'Failed to update loan application with documents'
      );
    }
  }
);
