"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createMembershipThunk,
  fetchMembershipByIdThunk,
  updateMembershipThunk,
} from "@/redux/membership/membershipThunks";
import { fetchMembersThunk as fetchAllMembers } from "@/redux/member/memberThunks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IconCertificate, IconUser, IconCalendar, IconCheck, IconX } from "@tabler/icons-react";

export default function MembershipForm({ membershipId, mode = "create" }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentMembership, loading, error, validationErrors } = useSelector(
    (state) => state.membership
  );
  const { members } = useSelector((state) => state.member);

  const isCreateMode = mode === "create" || membershipId === "new";
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [form, setForm] = useState({
    userId: "",
    startDate: "",
    endDate: "",
    isActive: true,
    status: "ACTIVE",
  });

  // Fetch members for dropdown in create mode
  useEffect(() => {
    if (isCreateMode) {
      dispatch(fetchAllMembers({}));
    }
  }, [isCreateMode, dispatch]);

  useEffect(() => {
    if (!isCreateMode && membershipId) {
      dispatch(fetchMembershipByIdThunk({ membershipId }));
    }
  }, [isCreateMode, membershipId, dispatch]);

  useEffect(() => {
    if (!isCreateMode && currentMembership) {
      setForm({
        userId: currentMembership.userId || "",
        startDate: currentMembership.startDate
          ? format(new Date(currentMembership.startDate), "yyyy-MM-dd")
          : "",
        endDate: currentMembership.endDate
          ? format(new Date(currentMembership.endDate), "yyyy-MM-dd")
          : "",
        isActive: Boolean(currentMembership.isActive),
        status: currentMembership.status || "ACTIVE",
      });
    }
  }, [isCreateMode, currentMembership]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isCreateMode) {
        await dispatch(createMembershipThunk(form)).unwrap();
        toast.success("Membership created successfully");
      } else {
        await dispatch(updateMembershipThunk({ membershipId, membershipData: form })).unwrap();
        toast.success("Membership updated successfully");
      }
      router.push("/dashboard/memberships");
    } catch (err) {
      toast.error(err?.message || "Operation failed");
    }
  };

  const selectedUser = useMemo(() => {
    if (isCreateMode) {
      return members?.find(member => member.id === parseInt(form.userId));
    }
    return currentMembership?.user;
  }, [isCreateMode, members, form.userId, currentMembership]);

  const getStatusBadgeVariant = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'default';
      case 'EXPIRED':
        return 'destructive';
      case 'CANCELLED':
        return 'secondary';
      case 'SUSPENDED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading && !isCreateMode) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted animate-pulse rounded w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getHeaderTitle = () => {
    if (isCreateMode) return "Create Membership";
    if (isViewMode) return "View Membership";
    return "Edit Membership";
  };

  const getHeaderDescription = () => {
    if (isCreateMode) return "Create a new membership for a user";
    if (isViewMode) return "View membership details";
    return "Edit membership information";
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={getHeaderTitle()}
        description={getHeaderDescription()}
        backUrl="/dashboard/memberships"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Selection/Display */}
            {isCreateMode ? (
              <div className="space-y-2">
                <Label htmlFor="userId">Select User</Label>
                <Select value={form.userId} onValueChange={(value) => handleSelectChange('userId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {members?.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{member.name}</span>
                            <span className="text-xs text-muted-foreground">{member.email}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors?.userId && (
                  <p className="text-sm text-destructive">{validationErrors.userId}</p>
                )}
              </div>
            ) : (
              selectedUser && (
                <div className="space-y-2">
                  <Label>Member</Label>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                      <AvatarFallback>
                        {selectedUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{selectedUser.name}</span>
                      <span className="text-sm text-muted-foreground">{selectedUser.email}</span>
                      {selectedUser.mobile && (
                        <span className="text-sm text-muted-foreground">{selectedUser.mobile}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
                {validationErrors?.startDate && (
                  <p className="text-sm text-destructive">{validationErrors.startDate}</p>
                )}
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  disabled={isViewMode}
                  required
                />
                {validationErrors?.endDate && (
                  <p className="text-sm text-destructive">{validationErrors.endDate}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {isViewMode ? (
                  <div className="p-2">
                    <Badge variant={getStatusBadgeVariant(form.status)}>
                      {form.status}
                    </Badge>
                  </div>
                ) : (
                  <Select value={form.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {validationErrors?.status && (
                  <p className="text-sm text-destructive">{validationErrors.status}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="space-y-2">
                <Label>Active Status</Label>
                {isViewMode ? (
                  <div className="p-2 flex items-center space-x-2">
                    {form.isActive ? (
                      <>
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Active</span>
                      </>
                    ) : (
                      <>
                        <IconX className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Inactive</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 p-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Is Active</Label>
                  </div>
                )}
              </div>
            </div>

            {/* Membership ID Display (View/Edit mode) */}
            {!isCreateMode && currentMembership && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Membership ID</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <span className="font-mono">#{currentMembership.id}</span>
                  </div>
                </div>
                {currentMembership.createdAt && (
                  <div className="space-y-2">
                    <Label>Created At</Label>
                    <div className="p-3 border rounded-lg bg-muted/50">
                      <span>{format(new Date(currentMembership.createdAt), 'PPP')}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
                <p className="text-sm text-destructive">{String(error)}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/memberships')}
              >
                {isViewMode ? 'Back' : 'Cancel'}
              </Button>
              
              {!isViewMode && (
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : isCreateMode ? 'Create Membership' : 'Update Membership'}
                </Button>
              )}

             
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
