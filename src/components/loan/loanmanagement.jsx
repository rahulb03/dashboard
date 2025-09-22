"use client"

import { useState, useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { 
  buttonVariants, 
  iconButtonVariants, 
  badgeVariants,
  searchInputVariants 
} from "@/components/ui/button-variants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  FileText,
  Calendar,
  BarChart3,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  DollarSign,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileCheck,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  fetchLoanApplicationsThunk,
  fetchLoanApplicationByIdThunk,
  createLoanApplicationThunk,
  updateLoanApplicationThunk,
  deleteLoanApplicationThunk,
  downloadDocumentThunk,
  updateLoanStatusThunk,
  updatePaymentStatusThunk,
} from "@/redux/Loan_Application/loanThunks"
import {
  clearError,
  clearCurrentLoanApplication,
  setCurrentLoanApplication,
} from "@/redux/Loan_Application/loanSlice"

const employmentTypes = ["salaried", "self_employed", "business", "freelancer"]
const loanStatuses = [
  "document_pending",
  "cibil_verification_pending",
  "processing",
  "approved",
  "rejected",
]
const applicationStatuses = ["PENDING", "PROCESSING", "APPROVED", "REJECTED"]
// Payment statuses removed - handled by payment process

// Skeleton Components
const HeaderSkeleton = () => (
  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
    <div className="space-y-3">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
    </div>
    <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
  </div>
)

const SearchSkeleton = () => (
  <Card className="border-0 shadow-sm bg-white">
    <CardContent className="p-6">
      <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
    </CardContent>
  </Card>
)

const TableRowSkeleton = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 bg-slate-200 rounded animate-pulse" />
      </TableCell>
    ))}
  </TableRow>
)

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="border-0 shadow-sm bg-white animate-pulse">
        <CardContent className="p-6 text-center">
          <div className="h-8 w-12 bg-slate-200 rounded mx-auto mb-2" />
          <div className="h-4 w-16 bg-slate-200 rounded mx-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function LoanApplicationManagement() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const {
    loanApplications,
    currentLoanApplication,
    loading,
    error,
    documentsLoading,
    stats,
  } = useSelector((state) => state.loan)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [deleteLoanState, setDeleteLoanState] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingStatusId, setUpdatingStatusId] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    mobileNumber: "",
    aadharNumber: "",
    panNumber: "",
    address: "",
    email: "",
    employmentType: "",
    monthlySalary: "",
    dateOfBirth: "",
    loanAmount: "",
  })

  useEffect(() => {
    dispatch(fetchLoanApplicationsThunk())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const resetForm = () => {
    setFormData({
      fullName: "",
      mobileNumber: "",
      aadharNumber: "",
      panNumber: "",
      address: "",
      email: "",
      employmentType: "",
      monthlySalary: "",
      dateOfBirth: "",
      loanAmount: "",
    })
    setEditingLoan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = {
        ...formData,
        monthlySalary: parseFloat(formData.monthlySalary),
        loanAmount: formData.loanAmount ? parseInt(formData.loanAmount) : null,
      }

      if (editingLoan) {
        await dispatch(
          updateLoanApplicationThunk({ id: editingLoan.id, loanData: submitData })
        ).unwrap()
      } else {
        await dispatch(createLoanApplicationThunk(submitData)).unwrap()
      }

      setIsDialogOpen(false)
      resetForm()
      toast({
        title: "Success",
        description: editingLoan
          ? "Loan application updated successfully"
          : "Loan application created successfully",
      })
    } catch (error) {
      console.error("Error saving loan application:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (loan) => {
    setEditingLoan(loan)
    setFormData({
      fullName: loan.fullName,
      mobileNumber: loan.mobileNumber,
      aadharNumber: loan.aadharNumber,
      panNumber: loan.panNumber,
      address: loan.address,
      email: loan.email,
      employmentType: loan.employmentType,
      monthlySalary: loan.monthlySalary?.toString() || "",
      dateOfBirth: loan.dateOfBirth ? loan.dateOfBirth.split("T")[0] : "",
      loanAmount: loan.loanAmount?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleView = (loan) => {
    // Use existing loan data instead of fetching from API
    dispatch(setCurrentLoanApplication(loan))
    setIsViewDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteLoanState) return

    try {
      await dispatch(deleteLoanApplicationThunk(deleteLoanState.id)).unwrap()
      setDeleteLoanState(null)
      toast({
        title: "Success",
        description: "Loan application deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting loan application:", error)
    }
  }

  const handleStatusUpdate = async (id, status) => {
    setUpdatingStatusId(id)
    try {
      await dispatch(updateLoanStatusThunk({ id, status })).unwrap()
      toast({
        title: "Success",
        description: "Application status updated successfully",
      })
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatusId(null)
    }
  }

  const handlePaymentStatusUpdate = async (id, paymentStatus) => {
    try {
      await dispatch(updatePaymentStatusThunk({ id, paymentStatus })).unwrap()
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
    }
  }

  const handleDownloadDocument = async (loanId) => {
    console.log(handleDownloadDocument)
    try {
      await dispatch(
        downloadDocumentThunk({ loanId })
      ).unwrap()
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading document:", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      // Document status values
      document_pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Document Pending",
        icon: FileCheck,
      },
      cibil_verification_pending: {
        color: "bg-blue-100 text-blue-800",
        label: "CIBIL Verification",
        icon: AlertCircle,
      },
      // Application status values
      PENDING: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Pending",
        icon: Clock,
      },
      PROCESSING: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
        icon: AlertCircle,
      },
      APPROVED: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
        icon: CheckCircle,
      },
      REJECTED: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
        icon: XCircle,
      },
      // Legacy values for backward compatibility
      approved: {
        color: "bg-green-100 text-green-800",
        label: "Approved",
        icon: CheckCircle,
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        label: "Rejected",
        icon: XCircle,
      },
      processing: {
        color: "bg-purple-100 text-purple-800",
        label: "Processing",
        icon: Clock,
      },
    }

    const config = statusConfig[status] || {
      color: "bg-gray-100 text-gray-800",
      label: status,
      icon: AlertCircle,
    }
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      processing: { color: "bg-blue-100 text-blue-800", label: "Processing" },
      completed: { color: "bg-green-100 text-green-800", label: "Completed" },
      failed: { color: "bg-red-100 text-red-800", label: "Failed" },
    }

    const config = statusConfig[paymentStatus] || {
      color: "bg-gray-100 text-gray-800",
      label: paymentStatus,
    }

    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const filteredLoans = useMemo(() => {
    let filtered = loanApplications

    if (searchTerm) {
      filtered = filtered.filter(
        (loan) =>
          loan.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.mobileNumber.includes(searchTerm) ||
          loan.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((loan) => loan.status === statusFilter)
    }

    return filtered
  }, [loanApplications, searchTerm, statusFilter])

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Loan Applications
          </h1>
          <p className="text-gray-600">
            Manage and track loan application status
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Application
            </Button>
          </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-xl">
                    {editingLoan
                      ? "Edit Loan Application"
                      : "Add New Loan Application"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {editingLoan
                      ? "Update the loan application details"
                      : "Create a new loan application"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="fullName"
                          className="text-sm font-medium text-slate-700"
                        >
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          placeholder="Enter full name"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="dateOfBirth"
                          className="text-sm font-medium text-slate-700"
                        >
                          Date of Birth *
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="mobileNumber"
                          className="text-sm font-medium text-slate-700"
                        >
                          Mobile Number *
                        </Label>
                        <Input
                          id="mobileNumber"
                          value={formData.mobileNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mobileNumber: e.target.value,
                            })
                          }
                          placeholder="+91XXXXXXXXXX"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-slate-700"
                        >
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-medium text-slate-700"
                      >
                        Address *
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Enter complete address"
                        rows={3}
                        className="border-slate-200 focus:border-slate-400 transition-colors resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Identity & Financial Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900 border-b pb-2">
                      Identity & Financial Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="aadharNumber"
                          className="text-sm font-medium text-slate-700"
                        >
                          Aadhar Number *
                        </Label>
                        <Input
                          id="aadharNumber"
                          value={formData.aadharNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              aadharNumber: e.target.value,
                            })
                          }
                          placeholder="XXXX XXXX XXXX"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="panNumber"
                          className="text-sm font-medium text-slate-700"
                        >
                          PAN Number *
                        </Label>
                        <Input
                          id="panNumber"
                          value={formData.panNumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              panNumber: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="ABCDE1234F"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="employmentType"
                          className="text-sm font-medium text-slate-700"
                        >
                          Employment Type *
                        </Label>
                        <Select
                          value={formData.employmentType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, employmentType: value })
                          }
                        >
                          <SelectTrigger className="border-slate-200 focus:border-slate-400">
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                          <SelectContent>
                            {employmentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace("_", " ").toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="monthlySalary"
                          className="text-sm font-medium text-slate-700"
                        >
                          Monthly Salary *
                        </Label>
                        <Input
                          id="monthlySalary"
                          type="number"
                          value={formData.monthlySalary}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              monthlySalary: e.target.value,
                            })
                          }
                          placeholder="Enter monthly salary"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="loanAmount"
                          className="text-sm font-medium text-slate-700"
                        >
                          Loan Amount
                        </Label>
                        <Input
                          id="loanAmount"
                          type="number"
                          value={formData.loanAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              loanAmount: e.target.value,
                            })
                          }
                          placeholder="Enter loan amount"
                          className="border-slate-200 focus:border-slate-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-br from-green-600 to-green-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingLoan ? "Update Application" : "Create Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">
                Total Applications
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.approved}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.processing}
              </div>
              <div className="text-sm text-gray-600">
                Processing
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, mobile, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {loanStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace("_", " ").toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loan Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredLoans.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))}
              </TableBody>
            </Table>
          ) : filteredLoans.length === 0 ? (
            <div className="text-center py-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchTerm || statusFilter !== "all"
                      ? "No applications found"
                      : "No loan applications yet"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {searchTerm || statusFilter !== "all"
                      ? "No applications match your current filters."
                      : "Create your first loan application to get started."}
                  </p>
                </div>
                {searchTerm || statusFilter !== "all" ? (
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={clearSearch} className="mt-4">
                      Clear search
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setStatusFilter("all")}
                      className="mt-4"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Application
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Employment</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {loan.fullName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          Applied {formatDate(loan.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {loan.mobileNumber}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {loan.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {loan.employmentType?.replace("_", " ")}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(loan.monthlySalary)}/month
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-gray-900">
                        {loan.loanAmount
                          ? formatCurrency(loan.loanAmount)
                          : "Not specified"}
                      </p>
                      <p className="text-sm text-gray-500">
                        CIBIL: {loan.cibilScore}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Select
                          value={loan.applicationStatus || 'PENDING'}
                          onValueChange={(value) =>
                            handleStatusUpdate(loan.id, value)
                          }
                          disabled={updatingStatusId === loan.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue>
                              {updatingStatusId === loan.id ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">Updating...</span>
                                </div>
                              ) : (
                                getStatusBadge(loan.applicationStatus || 'PENDING')
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {applicationStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace("_", " ").toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500">
                          Doc: {loan.status?.replace("_", " ").toUpperCase() || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleView(loan)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(loan)}
                          title="Edit Application"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteLoanState(loan)}
                          title="Delete Application"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

        {/* View Application Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl">Application Details</DialogTitle>
              <DialogDescription className="text-slate-600">
                Complete information about the loan application
              </DialogDescription>
            </DialogHeader>
            {currentLoanApplication && (
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Application Details</TabsTrigger>
                  <TabsTrigger value="documents">
                    Documents ({currentLoanApplication.documents?.length || 0})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-slate-600">
                            Full Name
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.fullName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Date of Birth
                          </Label>
                          <p className="font-medium">
                            {formatDate(currentLoanApplication.dateOfBirth)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Aadhar Number
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.aadharNumber}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            PAN Number
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.panNumber}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Phone className="h-5 w-5" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-slate-600">
                            Mobile Number
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.mobileNumber}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">Email</Label>
                          <p className="font-medium">
                            {currentLoanApplication.email}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Address
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.address}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          Financial Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-slate-600">
                            Employment Type
                          </Label>
                          <p className="font-medium capitalize">
                            {currentLoanApplication.employmentType?.replace(
                              "_",
                              " "
                            )}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Monthly Salary
                          </Label>
                          <p className="font-medium">
                            {formatCurrency(currentLoanApplication.monthlySalary)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Requested Loan Amount
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.loanAmount
                              ? formatCurrency(currentLoanApplication.loanAmount)
                              : "Not specified"}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            CIBIL Score
                          </Label>
                          <p className="font-medium">
                            {currentLoanApplication.cibilScore}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Application Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm text-slate-600">
                            Document Status
                          </Label>
                          <div className="mt-1">
                            {currentLoanApplication.status.replace("_", " ").toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Application Status
                          </Label>
                          <div className="mt-1">
                            {getStatusBadge(
                              currentLoanApplication.applicationStatus
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Payment Status
                          </Label>
                          <div className="mt-1">
                            {getPaymentStatusBadge(
                              currentLoanApplication.paymentStatus || "pending"
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Application Date
                          </Label>
                          <p className="font-medium">
                            {formatDate(currentLoanApplication.createdAt)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-slate-600">
                            Last Updated
                          </Label>
                          <p className="font-medium">
                            {formatDate(currentLoanApplication.updatedAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="documents" className="space-y-4">
                  {currentLoanApplication.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentLoanApplication.documents.map((document) => (
                        <Card key={document.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {document.name || `Document ${document.id}`}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {document.type || "Unknown type"}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDownloadDocument(
                                    currentLoanApplication.id,
                                    // document.id,
                                    // document.name
                                  )
                                }
                                disabled={documentsLoading}
                              >
                                {documentsLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-slate-900">
                        No documents uploaded
                      </h3>
                      <p className="text-slate-600">
                        No documents have been uploaded for this application yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteLoanState}
          onOpenChange={() => setDeleteLoanState(null)}
        >
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader className="space-y-3">
              <AlertDialogTitle className="text-xl text-slate-900">
                Delete Loan Application
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                This action cannot be undone. This will permanently delete the
                loan application for{" "}
                <span className="font-medium">
                  {deleteLoanState?.fullName}
                </span>
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-2">
              <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
                Cancel
              </AlertDialogCancel>
              <Button
                disabled={loading}
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Application
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
  )
}
