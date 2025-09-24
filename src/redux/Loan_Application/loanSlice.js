import { createSlice } from '@reduxjs/toolkit'
import {
  fetchLoanApplicationsThunk,
  fetchLoanApplicationByIdThunk,
  createLoanApplicationThunk,
  updateLoanApplicationThunk,
  deleteLoanApplicationThunk,
  downloadDocumentThunk,
  updateLoanStatusThunk,
  updatePaymentStatusThunk,
  createLoanApplicationWithDocumentsThunk,
  updateLoanApplicationWithDocumentsThunk
} from './loanThunks'

const initialState = {
  loanApplications: [],
  currentLoanApplication: null,
  loading: false,
  error: null,
  documentsLoading: false,
  stats: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    processing: 0
  },
  // Cache management
  cache: {
    lastFetched: null,
    ttl: 2 * 60 * 1000 // 2 minutes for loan applications
  }
}

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentLoanApplication: (state) => {
      state.currentLoanApplication = null
    },
    setCurrentLoanApplication: (state, action) => {
      state.currentLoanApplication = action.payload
    },
    updateStats: (state) => {
      const applications = state.loanApplications
      state.stats = {
        total: applications.length,
        approved: applications.filter(loan => loan.applicationStatus === 'APPROVED').length,
        pending: applications.filter(loan => loan.applicationStatus === 'PENDING').length,
        rejected: applications.filter(loan => loan.applicationStatus === 'REJECTED').length,
        processing: applications.filter(loan => loan.applicationStatus === 'PROCESSING').length
      }
    },
    invalidateCache: (state) => {
      state.cache.lastFetched = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all loan applications
      .addCase(fetchLoanApplicationsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoanApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false
        
        // Only update data if it's not from cache
        if (!action.payload.cached) {
          state.loanApplications = action.payload.loanApplications
          
          // Use API summary if available, otherwise calculate from data
          if (action.payload.summary) {
            state.stats = {
              total: action.payload.summary.totalApplications,
              approved: action.payload.summary.approvedApplications,
              pending: action.payload.summary.pendingApplications,
              rejected: action.payload.summary.rejectedApplications,
              processing: action.payload.loanApplications.filter(app => app.applicationStatus === 'PROCESSING').length
            }
          } else {
            loanSlice.caseReducers.updateStats(state)
          }
          
          // Update cache metadata only for fresh data
          state.cache.lastFetched = Date.now()
        }
      })
      .addCase(fetchLoanApplicationsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Fetch single loan application
      .addCase(fetchLoanApplicationByIdThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchLoanApplicationByIdThunk.fulfilled, (state, action) => {
        state.loading = false
        state.currentLoanApplication = action.payload
      })
      .addCase(fetchLoanApplicationByIdThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create loan application
      .addCase(createLoanApplicationThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLoanApplicationThunk.fulfilled, (state, action) => {
        state.loading = false
        state.loanApplications.push(action.payload)
        // Optimized stats update - just increment total and status count
        state.stats.total += 1
        if (action.payload.status) {
          const status = action.payload.status.toLowerCase()
          if (status.includes('pending')) {
            state.stats.pending += 1
          } else if (state.stats[status] !== undefined) {
            state.stats[status] += 1
          }
        }
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(createLoanApplicationThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update loan application
      .addCase(updateLoanApplicationThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLoanApplicationThunk.fulfilled, (state, action) => {
        state.loading = false
        const index = state.loanApplications.findIndex(
          loan => loan.id === action.payload.id
        )
        if (index !== -1) {
          const oldLoan = state.loanApplications[index]
          // Update stats only if status changed
          if (oldLoan.status !== action.payload.status) {
            // Decrement old status count
            const oldStatus = oldLoan.status?.toLowerCase()
            if (oldStatus) {
              if (oldStatus.includes('pending')) {
                state.stats.pending = Math.max(0, state.stats.pending - 1)
              } else if (state.stats[oldStatus] !== undefined) {
                state.stats[oldStatus] = Math.max(0, state.stats[oldStatus] - 1)
              }
            }
            // Increment new status count
            const newStatus = action.payload.status?.toLowerCase()
            if (newStatus) {
              if (newStatus.includes('pending')) {
                state.stats.pending += 1
              } else if (state.stats[newStatus] !== undefined) {
                state.stats[newStatus] += 1
              }
            }
          }
          state.loanApplications[index] = action.payload
        }
        if (state.currentLoanApplication?.id === action.payload.id) {
          state.currentLoanApplication = action.payload
        }
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(updateLoanApplicationThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Delete loan application
      .addCase(deleteLoanApplicationThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteLoanApplicationThunk.fulfilled, (state, action) => {
        state.loading = false
        const loanToDelete = state.loanApplications.find(loan => loan.id === action.payload)
        if (loanToDelete) {
          // Optimized stats update - just decrement total and status count
          state.stats.total = Math.max(0, state.stats.total - 1)
          if (loanToDelete.status) {
            const status = loanToDelete.status.toLowerCase()
            if (status.includes('pending')) {
              state.stats.pending = Math.max(0, state.stats.pending - 1)
            } else if (state.stats[status] !== undefined) {
              state.stats[status] = Math.max(0, state.stats[status] - 1)
            }
          }
        }
        state.loanApplications = state.loanApplications.filter(
          loan => loan.id !== action.payload
        )
        if (state.currentLoanApplication?.id === action.payload) {
          state.currentLoanApplication = null
        }
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(deleteLoanApplicationThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Download document
      .addCase(downloadDocumentThunk.pending, (state) => {
        state.documentsLoading = true
        state.error = null
      })
      .addCase(downloadDocumentThunk.fulfilled, (state) => {
        state.documentsLoading = false
      })
      .addCase(downloadDocumentThunk.rejected, (state, action) => {
        state.documentsLoading = false
        state.error = action.payload
      })

      // Update loan status (applicationStatus)
      .addCase(updateLoanStatusThunk.pending, (state) => {
        // Don't set loading to true to prevent full UI refresh
        state.error = null
      })
      .addCase(updateLoanStatusThunk.fulfilled, (state, action) => {
        const index = state.loanApplications.findIndex(
          loan => loan.id === action.payload.id
        )
        if (index !== -1) {
          const oldLoan = state.loanApplications[index]
          // Update stats only if applicationStatus changed
          if (oldLoan.applicationStatus !== action.payload.applicationStatus) {
            // Decrement old applicationStatus count
            const oldApplicationStatus = oldLoan.applicationStatus?.toLowerCase()
            if (oldApplicationStatus && state.stats[oldApplicationStatus] !== undefined) {
              state.stats[oldApplicationStatus] = Math.max(0, state.stats[oldApplicationStatus] - 1)
            }
            // Increment new applicationStatus count
            const newApplicationStatus = action.payload.applicationStatus?.toLowerCase()
            if (newApplicationStatus && state.stats[newApplicationStatus] !== undefined) {
              state.stats[newApplicationStatus] += 1
            }
          }
          // Only update the specific loan, preserving all other data
          state.loanApplications[index] = { ...oldLoan, ...action.payload }
        }
        if (state.currentLoanApplication?.id === action.payload.id) {
          state.currentLoanApplication = { ...state.currentLoanApplication, ...action.payload }
        }
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(updateLoanStatusThunk.rejected, (state, action) => {
        state.error = action.payload
      })

      // Update payment status
      .addCase(updatePaymentStatusThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updatePaymentStatusThunk.fulfilled, (state, action) => {
        state.loading = false
        const index = state.loanApplications.findIndex(
          loan => loan.id === action.payload.id
        )
        if (index !== -1) {
          // Payment status update doesn't affect loan status stats, so no stats recalculation needed
          state.loanApplications[index] = action.payload
        }
        if (state.currentLoanApplication?.id === action.payload.id) {
          state.currentLoanApplication = action.payload
        }
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(updatePaymentStatusThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Create loan application with documents
      .addCase(createLoanApplicationWithDocumentsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createLoanApplicationWithDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false
        // The response contains the complete application data with documents
        const newApplication = action.payload.applicantDetails ? {
          ...action.payload.applicantDetails,
          id: action.payload.applicationId,
          status: action.payload.status,
          documents: action.payload.documents || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : action.payload
        
        state.loanApplications.push(newApplication)
        
        // Update stats
        state.stats.total += 1
        const status = newApplication.applicationStatus || 'pending'
        const statusKey = status.toLowerCase()
        if (state.stats[statusKey] !== undefined) {
          state.stats[statusKey] += 1
        }
        
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(createLoanApplicationWithDocumentsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update loan application with documents
      .addCase(updateLoanApplicationWithDocumentsThunk.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateLoanApplicationWithDocumentsThunk.fulfilled, (state, action) => {
        state.loading = false
        
        // Find and update the application
        const index = state.loanApplications.findIndex(
          loan => loan.id === action.payload.applicationId
        )
        
        if (index !== -1) {
          // Update the application with new data
          const updatedApplication = {
            ...state.loanApplications[index],
            ...action.payload.applicantDetails,
            id: action.payload.applicationId,
            status: action.payload.status,
            paymentStatus: action.payload.paymentStatus,
            documents: action.payload.documents || [],
            payments: action.payload.payments || [],
            updatedAt: new Date().toISOString()
          }
          
          state.loanApplications[index] = updatedApplication
          
          // Update current application if it's the same one
          if (state.currentLoanApplication?.id === action.payload.applicationId) {
            state.currentLoanApplication = updatedApplication
          }
        }
        
        // Invalidate cache since data changed
        state.cache.lastFetched = null
      })
      .addCase(updateLoanApplicationWithDocumentsThunk.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearCurrentLoanApplication, setCurrentLoanApplication, updateStats, invalidateCache } = loanSlice.actions

export default loanSlice.reducer
