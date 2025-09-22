'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Shield, 
  ChevronDown, 
  ChevronRight, 
  Search,
  Users as UsersIcon,
  Settings,
  FileText,
  Database
} from 'lucide-react';

const categoryIcons = {
  user: UsersIcon,
  admin: Settings,
  content: FileText,
  system: Database
};

const categoryColors = {
  user: 'bg-blue-100 text-blue-800',
  admin: 'bg-purple-100 text-purple-800', 
  content: 'bg-green-100 text-green-800',
  system: 'bg-orange-100 text-orange-800'
};

export default function AvailablePermissionsTable({ 
  availablePermissions = { categories: [], totalPermissions: 0 }, 
  loading = false 
}) {
  // Normalize the data structure
  const normalizedPermissions = availablePermissions?.categories ? availablePermissions : 
                               availablePermissions?.data ? availablePermissions.data : 
                               { categories: [], totalPermissions: 0 };
  
  console.log('🔍 AvailablePermissionsTable Data Structure:', {
    originalData: availablePermissions,
    normalizedData: normalizedPermissions,
    categoriesLength: normalizedPermissions?.categories?.length,
    totalPermissions: normalizedPermissions?.totalPermissions
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState({});

  const toggleCategory = (categoryName) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Filter permissions based on search term
  const filteredCategories = normalizedPermissions.categories?.map(category => ({
    ...category,
    permissions: category.permissions?.filter(permission =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  })).filter(category => 
    category.permissions.length > 0 || !searchTerm
  ) || [];

  const totalFilteredPermissions = filteredCategories.reduce(
    (sum, category) => sum + (category.permissions?.length || 0), 
    0
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          <div className="h-9 w-72 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Available Permissions</h3>
          <p className="text-sm text-muted-foreground">
            {totalFilteredPermissions} permissions across {filteredCategories.length} categories
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
      </div>

      {/* Permission Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            const Icon = categoryIcons[category.name?.toLowerCase()] || Shield;
            const isOpen = openCategories[category.name];
            
            return (
              <Card key={category.name} className="transition-all hover:shadow-md">
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleCategory(category.name)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base capitalize">
                              {category.name}
                            </CardTitle>
                            <CardDescription>
                              {category.permissions?.length || 0} permissions
                            </CardDescription>
                          </div>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {category.permissions?.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <Shield className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                <h4 className="text-sm font-medium truncate">
                                  {permission.name}
                                </h4>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {permission.description}
                              </p>
                              {permission.source && (
                                <Badge 
                                  variant="outline" 
                                  className={`mt-2 text-xs ${
                                    categoryColors[category.name?.toLowerCase()] || 
                                    'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {permission.source}
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-col items-end ml-2">
                              <Badge 
                                variant={permission.isActive ? 'default' : 'secondary'}
                                className="mb-1"
                              >
                                {permission.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {permission.userCount !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  {permission.userCount} users
                                </span>
                              )}
                            </div>
                          </div>
                        )) || (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No permissions in this category
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No permissions found' : 'No permissions available'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Permissions will appear here when they are configured'
              }
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredCategories.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
          <div>
            Showing {totalFilteredPermissions} permissions
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <div>
            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
          </div>
        </div>
      )}
    </div>
  );
}