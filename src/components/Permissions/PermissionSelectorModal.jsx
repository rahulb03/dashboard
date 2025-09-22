import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, Shield, AlertTriangle, Info, Check, ChevronRight, Filter, Grid, List } from 'lucide-react';
import { 
  getPermissionLabel, 
  getPermissionDescription,
  getCategoryLabel,
  getCategoryIcon,
  isDangerousPermission,
  isBasicPermission
} from '../../Utils/permissionFormatter';
import './permissions.css';

const PermissionSelectorModal = ({ 
  isOpen, 
  onClose, 
  permissions = [], 
  selectedPermissions = [], 
  onSelect,
  mode = 'single', // 'single' or 'multiple'
  title = 'Select Permissions',
  description = 'Choose the permissions you want to manage'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [localSelection, setLocalSelection] = useState(selectedPermissions);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('');
      setLocalSelection(selectedPermissions);
    }
  }, [isOpen, selectedPermissions]);

  // Group and format permissions
  const { groupedPermissions, categories } = useMemo(() => {
    if (!permissions || permissions.length === 0) return { groupedPermissions: {}, categories: [] };

    const grouped = {};
    const cats = new Set();
    
    permissions.forEach(perm => {
      const formattedPerm = {
        ...perm,
        category: perm.category || getCategoryLabel(perm.resource),
        displayName: perm.displayName || getPermissionLabel(perm.resource, perm.action),
        displayDescription: perm.displayDescription || getPermissionDescription(perm.resource, perm.action),
        isDangerous: isDangerousPermission(perm.action),
        isBasic: isBasicPermission(perm.action),
        icon: getCategoryIcon(perm.resource)
      };

      if (!grouped[formattedPerm.category]) {
        grouped[formattedPerm.category] = [];
      }
      grouped[formattedPerm.category].push(formattedPerm);
      cats.add(formattedPerm.category);
    });

    // Sort permissions within categories
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        if (a.isBasic && !b.isBasic) return -1;
        if (!a.isBasic && b.isBasic) return 1;
        if (a.isDangerous && !b.isDangerous) return 1;
        if (!a.isDangerous && b.isDangerous) return -1;
        return a.displayName.localeCompare(b.displayName);
      });
    });

    return { 
      groupedPermissions: grouped, 
      categories: Array.from(cats).sort() 
    };
  }, [permissions]);

  // Filter permissions
  const filteredPermissions = useMemo(() => {
    let filtered = { ...groupedPermissions };

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = {};
      Object.entries(groupedPermissions).forEach(([category, perms]) => {
        const matchingPerms = perms.filter(perm =>
          perm.displayName.toLowerCase().includes(searchLower) ||
          perm.displayDescription.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower)
        );
        if (matchingPerms.length > 0) {
          filtered[category] = matchingPerms;
        }
      });
    }

    // Filter by category
    if (selectedCategory) {
      filtered = { [selectedCategory]: filtered[selectedCategory] || [] };
    }

    return filtered;
  }, [groupedPermissions, searchTerm, selectedCategory]);

  const handlePermissionToggle = (permissionId) => {
    if (mode === 'single') {
      setLocalSelection([permissionId]);
    } else {
      setLocalSelection(prev => 
        prev.includes(permissionId)
          ? prev.filter(id => id !== permissionId)
          : [...prev, permissionId]
      );
    }
  };

  const handleConfirm = () => {
    onSelect(mode === 'single' ? localSelection[0] : localSelection);
    onClose();
  };

  const isPermissionSelected = (permissionId) => {
    return localSelection.includes(permissionId);
  };

  if (!isOpen) return null;

  const hasFilteredPermissions = Object.keys(filteredPermissions).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div className="absolute inset-0 modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white appearance-none min-w-[200px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-indigo-100 text-indigo-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto permission-scroll" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {hasFilteredPermissions ? (
            <div className="p-6">
              {Object.entries(filteredPermissions).map(([category, categoryPerms]) => (
                <div key={category} className="mb-8 last:mb-0">
                  {/* Category Header */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(categoryPerms[0]?.resource)}</span>
                      <h4 className="text-lg font-semibold text-gray-900">{category}</h4>
                      <span className="text-sm text-gray-500">({categoryPerms.length})</span>
                    </div>
                  </div>

                  {/* Permissions Grid/List */}
                  <div className={viewMode === 'grid' 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                    : "space-y-2"
                  }>
                    {categoryPerms.map((perm) => {
                      const permId = perm.id || perm._id;
                      const isSelected = isPermissionSelected(permId);
                      
                      return (
                        <div
                          key={permId}
                          onClick={() => handlePermissionToggle(permId)}
                          className={`
                            relative cursor-pointer rounded-lg border-2 transition-all duration-200 p-4
                            ${isSelected 
                              ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }
                            ${perm.isDangerous ? 'hover:border-red-300' : ''}
                          `}
                        >
                          {/* Selection Indicator */}
                          <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${isSelected 
                              ? 'border-indigo-500 bg-indigo-500' 
                              : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>

                          {/* Permission Content */}
                          <div className="pr-8">
                            <div className="flex items-start space-x-3 mb-2">
                              <span className="text-lg flex-shrink-0">{perm.icon}</span>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 truncate">
                                  {perm.displayName}
                                </h5>
                                <div className="flex items-center space-x-2 mt-1">
                                  {perm.isBasic && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Info className="h-3 w-3 mr-1" />
                                      Safe
                                    </span>
                                  )}
                                  {perm.isDangerous && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Sensitive
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {viewMode === 'grid' && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                                {perm.displayDescription}
                              </p>
                            )}
                            
                            {viewMode === 'list' && (
                              <p className="text-sm text-gray-600 mt-1">
                                {perm.displayDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Shield className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No permissions found</h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filter criteria to find permissions.'
                  : 'No permissions are available to display.'}
              </p>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                  className="mt-3 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {mode === 'multiple' && (
                <span>{localSelection.length} permission{localSelection.length !== 1 ? 's' : ''} selected</span>
              )}
              {mode === 'single' && localSelection.length > 0 && (
                <span>1 permission selected</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={localSelection.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mode === 'single' ? 'Select Permission' : `Select ${localSelection.length} Permissions`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionSelectorModal;