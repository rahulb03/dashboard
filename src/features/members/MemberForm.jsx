'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Edit, Save, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMemberByIdThunk, updateMemberThunk, createMemberThunk, fetchMembersThunk } from '@/redux/member/memberThunks';
import { clearCurrentMember } from '@/redux/member/memberSlice';
import FormCardSkeleton from '@/components/form-card-skeleton';

export default function MemberForm({ memberId, mode = 'edit' }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create' || memberId === 'new';
  
  // Redux state
  const { currentMember, loading } = useSelector((state) => state.member || { currentMember: null, loading: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'USER',
    password: ''
  });

  // Fetch member data on mount OR clear for new creation
  useEffect(() => {
    if (memberId && memberId !== 'new') {
      dispatch(fetchMemberByIdThunk({ userId: memberId })).catch(err => {
        console.error('Failed to fetch member:', err);
        toast.error('Failed to load member data');
      });
    } else if (isCreateMode) {
      // Clear any existing member data when creating new
      dispatch(clearCurrentMember());
    }
  }, [dispatch, memberId, isCreateMode]);

  // Update form when member data is loaded - ONLY for non-create modes
  useEffect(() => {
    if (currentMember && !isCreateMode) {
      setFormData({
        name: currentMember.name || '',
        email: currentMember.email || '',
        mobile: currentMember.mobile || '',
        role: currentMember.role || 'USER',
        password: ''
      });
    }
  }, [currentMember, isCreateMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = { ...formData };
      
      if (isCreateMode) {
        // For create, password is required
        if (!submitData.password || submitData.password.trim() === '') {
          toast.error('Password is required for new members');
          setIsSubmitting(false);
          return;
        }
        await dispatch(createMemberThunk(submitData)).unwrap();
        toast.success('Member created successfully');
        // Refresh the members list to show the new member immediately
        dispatch(fetchMembersThunk());
      } else {
        // For update, remove password if empty
        if (!submitData.password || submitData.password.trim() === '') {
          delete submitData.password;
        }
        await dispatch(updateMemberThunk({
          userId: memberId,
          userData: submitData
        })).unwrap();
        toast.success('Member updated successfully');
        // Refresh the members list to show the updated member immediately
        dispatch(fetchMembersThunk());
      }
      
      router.push('/dashboard/members');
    } catch (error) {
      console.error('Operation failed:', error);
      toast.error(error.message || `Failed to ${isCreateMode ? 'create' : 'update'} member`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading skeleton while fetching
  if (loading && memberId !== 'new') {
    return <FormCardSkeleton />;
  }
  
  return (
    <div className="space-y-4">
      
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {isCreateMode ? 'Create New Member' : isViewMode ? 'Member Details' : 'Edit Member'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  disabled={isViewMode}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isViewMode && (
              <div className="space-y-2">
                <Label htmlFor="password">{isCreateMode ? 'Password *' : 'New Password (optional)'}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder={isCreateMode ? 'Enter password' : 'Leave empty to keep current password'}
                />
              </div>
            )}
            
            <div className="flex gap-2 pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => router.push('/dashboard/members')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {isViewMode ? 'Back' : 'Cancel'}
              </Button>
              
              
              {isEditMode && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </>
                  )}
                </Button>
              )}
              
              {isCreateMode && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
