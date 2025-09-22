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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  X,
  Users,
  Calendar,
  BarChart3,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  UserPlus,
  Filter,
  MoreVertical,
  Trash,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  createMemberThunk,
  fetchMembersThunk,
  fetchMemberByIdThunk,
  updateMemberThunk,
  deleteMemberThunk,
  assignRoleThunk,
  fetchMembersByRoleThunk,
  bulkDeleteMembersThunk,
  searchMembersThunk
} from "@/redux/member/memberThunks"
import {
  clearError,
  clearCurrentMember,
  setCurrentMember,
  setFilters,
  resetFilters
} from "@/redux/member/memberSlice"

const memberRoles = ["USER", "ADMIN", "MANAGER", "EMPLOYEE"]
const roleColors = {
  USER: "bg-blue-100 text-blue-800",
  ADMIN: "bg-red-100 text-red-800", 
  MANAGER: "bg-green-100 text-green-800",
  EMPLOYEE: "bg-yellow-100 text-yellow-800"
}

// Skeleton Components
const SearchSkeleton = () => (
  <Card className="border-0 shadow-sm bg-white">
    <CardContent className="p-6">
      <div className="h-10 w-full bg-slate-200 rounded animate-pulse" />
    </CardContent>
  </Card>
)

const TableRowSkeleton = () => (
  <TableRow>
    {Array.from({ length: 7 }).map((_, i) => (
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

export default function MemberManagement() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const {
    members,
    currentMember,
    loading,
    error,
    pagination,
    stats,
    filters
  } = useSelector((state) => state.member)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [deleteMemberState, setDeleteMemberState] = useState(null)
  const [searchTerm, setSearchTerm] = useState(filters.search || "")
  const [roleFilter, setRoleFilter] = useState(filters.role || "all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updatingRoleId, setUpdatingRoleId] = useState(null)
  const [deletingIds, setDeletingIds] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(filters.page || 1)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    role: "USER"
  })

  // Fetch members on component mount
  useEffect(() => {
    dispatch(fetchMembersThunk())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
      dispatch(clearError())
    }
  }, [error, toast, dispatch])

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
      role: "USER"
    })
    setEditingMember(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (editingMember) {
        await dispatch(
          updateMemberThunk({ 
            userId: editingMember.id, 
            userData: formData 
          })
        ).unwrap()
        toast({
          title: "Success",
          description: "Member updated successfully",
        })
      } else {
        await dispatch(createMemberThunk(formData)).unwrap()
        toast({
          title: "Success",
          description: "Member created successfully",
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving member:", error)
      toast({
        title: "Error",
        description: "Failed to save member. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      firstName: member.firstName || "",
      lastName: member.lastName || "",
      email: member.email || "",
      phoneNumber: member.phoneNumber || "",
      address: member.address || "",
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.split("T")[0] : "",
      role: member.role || "USER"
    })
    setIsDialogOpen(true)
  }

  const handleView = (member) => {
    dispatch(setCurrentMember(member))
    setIsViewDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteMemberState) return

    try {
      await dispatch(deleteMemberThunk(deleteMemberState.id)).unwrap()
      setDeleteMemberState(null)
      toast({
        title: "Success",
        description: "Member deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting member:", error)
    }
  }

  const handleRoleUpdate = async (id, role) => {
    setUpdatingRoleId(id)
    try {
      await dispatch(assignRoleThunk({ userId: id, role })).unwrap()
      toast({
        title: "Success",
        description: "Member role updated successfully",
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role",
        variant: "destructive",
      })
    } finally {
      setUpdatingRoleId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedMembers.length === 0) return

    setIsBulkDeleting(true)
    try {
      await dispatch(bulkDeleteMembersThunk(selectedMembers)).unwrap()
      setSelectedMembers([])
      toast({
        title: "Success",
        description: `${selectedMembers.length} members deleted successfully`,
      })
    } catch (error) {
      console.error("Error bulk deleting members:", error)
      toast({
        title: "Error",
        description: "Failed to delete selected members",
        variant: "destructive",
      })
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const handleSelectMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedMembers(members.map(member => member.id))
    } else {
      setSelectedMembers([])
    }
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date') return 'Not provided'
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const getRoleBadge = (role) => {
    const variantMap = {
      'ADMIN': 'admin',
      'MANAGER': 'manager', 
      'EMPLOYEE': 'employee',
      'USER': 'user'
    }
    
    const variant = variantMap[role] || 'user'
    
    return (
      <Badge className={cn(badgeVariants({ variant }), "border-0")}>
        <UserCheck className="w-3 h-3 mr-1" />
        {role}
      </Badge>
    )
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const filteredMembers = useMemo(() => {
    let filtered = members

    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phoneNumber?.includes(searchTerm) ||
          member.role?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((member) => member.role === roleFilter)
    }

    return filtered
  }, [members, searchTerm, roleFilter])

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Member Management
            </h1>
            <p className="text-slate-600">
              Manage and track team members and their roles
            </p>
          </div>
          <div className="flex gap-2">
            {selectedMembers.length > 0 && (
              <Button
                className={cn(buttonVariants({ variant: "danger", size: "default" }))}
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                <Trash className="w-4 h-4 mr-2" />
                Delete ({selectedMembers.length})
              </Button>
            )}
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}
            >
              <DialogTrigger asChild>
                <Button className={cn(buttonVariants({ variant: "action", size: "default" }))}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? "Edit Member" : "Add New Member"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMember
                      ? "Update the member details"
                      : "Create a new team member"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          setFormData({ ...formData, dateOfBirth: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          placeholder="+91XXXXXXXXXX"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        placeholder="Enter complete address"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Role Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                      Role Information
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {memberRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      type="submit"
                      className={cn(buttonVariants({ variant: "success", size: "default" }), "flex-1")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {editingMember ? "Update Member" : "Create Member"}
                    </Button>
                    <Button
                      type="button"
                      className={cn(buttonVariants({ variant: "outline", size: "default" }), "border-slate-200 text-slate-700 hover:bg-slate-50")}
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

        {/* Statistics Cards */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </div>
                <div className="text-sm text-slate-600">Total Members</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.admin}
                </div>
                <div className="text-sm text-slate-600">Admins</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.manager}
                </div>
                <div className="text-sm text-slate-600">Managers</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.employee}
                </div>
                <div className="text-sm text-slate-600">Employees</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.user}
                </div>
                <div className="text-sm text-slate-600">Users</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(searchInputVariants({ variant: "default" }), "pl-10")}
            />
            {searchTerm && (
              <Button
                className={cn(iconButtonVariants({ variant: "ghost", size: "xs" }), "absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0")}
                onClick={clearSearch}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[200px] border-slate-200 focus:border-slate-400">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {memberRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Members Table */}
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-slate-900">Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox disabled />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
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
          ) : filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {searchTerm || roleFilter !== "all"
                      ? "No members found"
                      : "No members yet"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {searchTerm || roleFilter !== "all"
                      ? "No members match your current filters."
                      : "Create your first team member to get started."}
                  </p>
                </div>
                {searchTerm || roleFilter !== "all" ? (
                  <div className="flex gap-2 justify-center">
                    <Button 
                      className={cn(buttonVariants({ variant: "outline", size: "default" }), "mt-4")}
                      onClick={clearSearch}
                    >
                      Clear search
                    </Button>
                    <Button
                      className={cn(buttonVariants({ variant: "outline", size: "default" }), "mt-4")}
                      onClick={() => setRoleFilter("all")}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className={cn(buttonVariants({ variant: "action", size: "default" }), "mt-4")}
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Checkbox
                      checked={selectedMembers.length === filteredMembers.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={() => handleSelectMember(member.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {`${member.firstName || ""} ${member.lastName || ""}`.trim() || member.email}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          ID: {member.id}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {member.email}
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {member.phoneNumber || "No phone"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={member.role || 'USER'}
                        onValueChange={(value) =>
                          handleRoleUpdate(member.id, value)
                        }
                        disabled={updatingRoleId === member.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            {updatingRoleId === member.id ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Updating...</span>
                              </div>
                            ) : (
                              getRoleBadge(member.role || 'USER')
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {memberRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">
                        {member.createdAt ? formatDate(member.createdAt) : 'Not available'}
                      </p>
                    </TableCell>
                    <TableCell>
                    <Badge className={cn(badgeVariants({ variant: "active" }), "border-0")}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          className={cn(iconButtonVariants({ variant: "view", size: "sm" }))}
                          onClick={() => handleView(member)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          className={cn(iconButtonVariants({ variant: "edit", size: "sm" }))}
                          onClick={() => handleEdit(member)}
                          title="Edit Member"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          className={cn(iconButtonVariants({ variant: "delete", size: "sm" }))}
                          onClick={() => setDeleteMemberState(member)}
                          title="Delete Member"
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


      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
            <DialogDescription>
              Complete information about the team member
            </DialogDescription>
          </DialogHeader>
          {currentMember && (
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Member Details</TabsTrigger>
                <TabsTrigger value="activity">Activity Log</TabsTrigger>
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
                        <Label className="text-sm text-gray-600">Full Name</Label>
                        <p className="font-medium">
                          {`${currentMember.firstName || ""} ${currentMember.lastName || ""}`.trim() || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Date of Birth</Label>
                        <p className="font-medium">
                          {currentMember.dateOfBirth ? formatDate(currentMember.dateOfBirth) : "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Member ID</Label>
                        <p className="font-medium">{currentMember.id}</p>
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
                        <Label className="text-sm text-gray-600">Email</Label>
                        <p className="font-medium">{currentMember.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Phone Number</Label>
                        <p className="font-medium">
                          {currentMember.phoneNumber || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Address</Label>
                        <p className="font-medium">
                          {currentMember.address || "Not provided"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCheck className="h-5 w-5" />
                        Role & Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600">Role</Label>
                        <div className="mt-1">
                          {getRoleBadge(currentMember.role || 'USER')}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Status</Label>
                        <div className="mt-1">
                        <Badge className={cn(badgeVariants({ variant: "active" }), "border-0")}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Joined Date</Label>
                        <p className="font-medium">
                          {currentMember.createdAt ? formatDate(currentMember.createdAt) : 'Not available'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Last Updated</Label>
                        <p className="font-medium">
                          {currentMember.updatedAt ? formatDate(currentMember.updatedAt) : 'Not available'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="activity" className="space-y-4">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Activity Log Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Member activity tracking will be available in future updates.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteMemberState}
        onOpenChange={() => setDeleteMemberState(null)}
      >z
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              member account for{" "}
              <span className="font-medium">
                {deleteMemberState?.email}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              disabled={loading}
              className={cn(buttonVariants({ variant: "danger", size: "default" }))}
              onClick={handleDelete}
            >
              Delete Member
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  )
}
