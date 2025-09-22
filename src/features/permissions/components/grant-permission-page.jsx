'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { 
  UserPlus, 
  Users, 
  Shield, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Search,
  X
} from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FormProvider } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { grantPermission, fetchUsersWithPermissions } from '@/redux/permissions/permissionThunks';

const grantPermissionSchema = z.object({
  userId: z.string().min(1, { message: 'Please select a user' }),
  permissionIds: z.array(z.string()).min(1, { message: 'Please select at least one permission' }),
  reason: z.string().min(5, { message: 'Please provide a reason (minimum 5 characters)' })
});

export default function GrantPermissionPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { users, availablePermissions } = useSelector((state) => state.permissions);
  
  const form = useForm({
    resolver: zodResolver(grantPermissionSchema),
    defaultValues: {
      userId: '',
      permissionIds: [],
      reason: ''
    }
  });

  // Check for pre-selected user from URL parameters
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const userId = searchParams.get('userId');
    if (userId && users.length > 0) {
      const user = users.find(u => u.id.toString() === userId);
      if (user) {
        form.setValue('userId', userId);
        setCurrentStep(2); // Skip to permission selection
      }
    }
  }, [users, form]);

  const selectedUserId = form.watch('userId');
  const selectedPermissionIds = form.watch('permissionIds');
  
  const selectedUser = users.find(u => u.id.toString() === selectedUserId);
  
  // Only show permissions that the selected user doesn't already have
  const availablePermissionsForUser = React.useMemo(() => {
    if (!selectedUser || !availablePermissions.categories) return [];
    
    const userPermissionIds = selectedUser.permissions?.map(p => p.id) || [];
    
    return availablePermissions.categories.flatMap(category => 
      (category.permissions || []).filter(permission => 
        !userPermissionIds.includes(permission.id)
      ).map(permission => ({
        ...permission,
        categoryName: category.name
      }))
    );
  }, [selectedUser, availablePermissions.categories]);
  
  // Get unique categories for filtering
  const categories = React.useMemo(() => {
    if (!availablePermissions.categories) return [];
    return availablePermissions.categories.map(cat => cat.name);
  }, [availablePermissions.categories]);
  
  // Filter and search permissions
  const filteredPermissions = React.useMemo(() => {
    let filtered = availablePermissionsForUser;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(permission => 
        permission.categoryName === selectedCategory
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(permission => 
        permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [availablePermissionsForUser, selectedCategory, searchTerm]);
  
  const selectedPermissions = availablePermissionsForUser.filter(p => 
    selectedPermissionIds.includes(p.id.toString())
  );

  const handleSubmit = async (data) => {
    startTransition(async () => {
      try {
        // Grant multiple permissions sequentially
        for (const permissionId of data.permissionIds) {
          const formattedData = {
            userId: parseInt(data.userId),
            permissionId: parseInt(permissionId),
            reason: data.reason
          };
          
          await dispatch(grantPermission(formattedData)).unwrap();
        }
        
        await dispatch(fetchUsersWithPermissions({ forceRefresh: true }));
        
        const permissionCount = data.permissionIds.length;
        toast.success(
          `${permissionCount} permission${permissionCount > 1 ? 's' : ''} granted successfully!`
        );
        router.push('/dashboard/permissions');
      } catch (error) {
        toast.error(error.message || 'Failed to grant permissions');
      }
    });
  };

  const canProceedToStep2 = selectedUserId;
  const canProceedToStep3 = selectedUserId && selectedPermissionIds.length > 0;
  const canSubmit = selectedUserId && selectedPermissionIds.length > 0 && form.watch('reason').length >= 5;

  // Users table configuration
  const userColumns = React.useMemo(() => [
    {
      id: 'select',
      header: 'Select',
      cell: ({ row }) => {
        const user = row.original;
        const isSelected = selectedUserId === user.id.toString();
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 border-2 rounded transition-all ${
              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
            }`}>
              {isSelected && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        const isSelected = selectedUserId === user.id.toString();
        return (
          <div 
            className={`flex items-center space-x-4 p-2 rounded cursor-pointer ${
              isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              form.setValue('userId', user.id.toString());
              if (currentStep === 1) setCurrentStep(2);
            }}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
              <div className="text-xs text-muted-foreground">
                {user.permissions?.length || 0} current permissions
              </div>
            </div>
          </div>
        );
      }
    }
  ], [selectedUserId, form, currentStep]);

  // Users table
  const usersTable = useReactTable({
    data: users,
    columns: userColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  const steps = [
    { number: 1, title: 'Select User', description: 'Choose who will receive the permission' },
    { number: 2, title: 'Choose Permission', description: 'Select the permission to grant' },
    { number: 3, title: 'Configure & Submit', description: 'Set expiry and provide reason' }
  ];

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/dashboard/permissions')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Permissions</span>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Grant Permission</h1>
        <p className="text-muted-foreground text-sm">Grant a permission to a user with optional expiration</p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center space-x-3">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold
                    ${currentStep === step.number 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : currentStep > step.number
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                    }
                  `}>
                    {currentStep > step.number ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{step.title}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Current Step Content */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Select User</span>
                </CardTitle>
                <CardDescription>Choose the user who will receive the permission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-4">
                        <DataTable table={usersTable}>
                          <DataTableToolbar 
                            table={usersTable}
                            placeholder="Search users..."
                          />
                        </DataTable>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {canProceedToStep2 && (
                  <div className="flex justify-center pt-4">
                    <Button 
                      type="button" 
                      onClick={() => setCurrentStep(2)}
                      size="lg"
                      className="px-8"
                    >
                      Continue to Permissions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Permission Selection */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Choose Permissions</span>
                </CardTitle>
                <CardDescription>
                  Select one or more permissions to grant to <strong>{selectedUser?.name}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {availablePermissionsForUser.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-16 w-16 text-orange-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Available Permissions</h3>
                    <p className="text-muted-foreground">{selectedUser?.name} already has all available permissions</p>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      className="mt-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to User Selection
                    </Button>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="permissionIds"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-6">
                          {/* Search and Filter Controls */}
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="relative flex-1 min-w-64">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => {
                                  setSearchTerm(e.target.value);
                                }}
                                className="pl-9"
                              />
                              {searchTerm && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSearchTerm('');
                                  }}
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Selected count badge */}
                            {selectedPermissionIds.length > 0 && (
                              <Badge variant="secondary" className="text-sm">
                                {selectedPermissionIds.length} selected
                              </Badge>
                            )}
                          </div>
                          
                          {/* Category Tabs */}
                          <Tabs 
                            value={selectedCategory} 
                            onValueChange={(value) => {
                              setSelectedCategory(value);
                            }}
                          >
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:grid-cols-auto lg:flex">
                              <TabsTrigger value="all" className="px-4">All</TabsTrigger>
                              {categories.map((category) => (
                                <TabsTrigger key={category} value={category} className="px-4">
                                  {category}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            
                            <TabsContent value={selectedCategory} className="mt-6">
                              {filteredPermissions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                                  <h4 className="font-medium mb-1">No permissions found</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {searchTerm ? 'Try adjusting your search terms' : 'No permissions in this category'}
                                  </p>
                                </div>
                              ) : (
                                <>
                                  <div className="text-sm text-muted-foreground mb-4">
                                    {filteredPermissions.length} permission{filteredPermissions.length !== 1 ? 's' : ''} available
                                    {searchTerm && ` (filtered by "${searchTerm}")`}
                                    {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                                  </div>
                                  
                                  <div className="space-y-2">
                                    {filteredPermissions.map((permission) => {
                                      const isSelected = field.value.includes(permission.id.toString());
                                      return (
                                        <div
                                          key={permission.id}
                                          onClick={() => {
                                            const newValue = isSelected
                                              ? field.value.filter(id => id !== permission.id.toString())
                                              : [...field.value, permission.id.toString()];
                                            field.onChange(newValue);
                                          }}
                                          className={`
                                            p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm
                                            ${isSelected 
                                              ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                                              : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                            }
                                          `}
                                        >
                                          <div className="flex items-start space-x-3">
                                            <div className={`
                                              mt-1 flex-shrink-0 w-4 h-4 border-2 rounded transition-all
                                              ${isSelected 
                                                ? 'bg-primary border-primary' 
                                                : 'border-muted-foreground/30 hover:border-primary/50'
                                              }
                                            `}>
                                              {isSelected && (
                                                <CheckCircle className="h-3 w-3 text-primary-foreground" />
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center space-x-2 mb-1">
                                                <h4 className="font-medium">{permission.name}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                  {permission.categoryName}
                                                </Badge>
                                              </div>
                                              <p className="text-sm text-muted-foreground">
                                                {permission.description}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="flex justify-between pt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  {canProceedToStep3 && (
                    <Button 
                      type="button" 
                      onClick={() => setCurrentStep(3)}
                      size="lg"
                      className="px-8"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm & Submit */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirm & Submit</span>
                </CardTitle>
                <CardDescription>
                  Review your selection and provide a reason
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="bg-muted/50 p-6 rounded-lg space-y-4">
                  <h4 className="font-semibold text-lg">Summary</h4>
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <span className="text-sm text-muted-foreground">User:</span>
                        <div className="font-semibold">{selectedUser?.name}</div>
                        <div className="text-sm text-muted-foreground">{selectedUser?.email}</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-start space-x-3">
                      <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <span className="text-sm text-muted-foreground">
                          Permission{selectedPermissions.length > 1 ? 's' : ''}:
                        </span>
                        <div className="space-y-2 mt-1">
                          {selectedPermissions.map((permission) => (
                            <div key={permission.id} className="bg-background border rounded-md p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium">{permission.name}</h5>
                                <Badge variant="outline" className="text-xs">
                                  {permission.categoryName}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Reason *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain why this permission is being granted..."
                          disabled={loading}
                          rows={4}
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push('/dashboard/permissions')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading || !canSubmit}
                      size="lg"
                      className="px-8"
                    >
                      {loading 
                        ? 'Granting...' 
                        : `Grant ${selectedPermissions.length} Permission${selectedPermissions.length > 1 ? 's' : ''}`
                      }
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>
      </FormProvider>
    </div>
  );
}