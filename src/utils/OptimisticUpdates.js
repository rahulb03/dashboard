import dataCache from './DataCacheManager';

/**
 * Optimistic update helpers for common CRUD operations
 * These update the cache immediately without waiting for API responses
 */

export class OptimisticUpdates {
  /**
   * Add a new item to cached arrays
   */
  static addItem(type, newItem, params = {}) {
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return [newItem, ...currentData];
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: [newItem, ...currentData.data],
          total: (currentData.total || 0) + 1
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Update an existing item in cached arrays
   */
  static updateItem(type, updatedItem, params = {}) {
    const itemId = updatedItem.id || updatedItem._id;
    
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return currentData.map(item => 
          (item.id || item._id) === itemId ? { ...item, ...updatedItem } : item
        );
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: currentData.data.map(item => 
            (item.id || item._id) === itemId ? { ...item, ...updatedItem } : item
          )
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Remove an item from cached arrays
   */
  static removeItem(type, itemId, params = {}) {
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return currentData.filter(item => (item.id || item._id) !== itemId);
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: currentData.data.filter(item => (item.id || item._id) !== itemId),
          total: Math.max((currentData.total || 0) - 1, 0)
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Grant permission to a user optimistically
   */
  static grantPermission(userId, permission, userParams = {}) {
    // Update users list
    this.updateItem('users', {
      id: userId,
      permissions: (currentUser) => {
        const currentPermissions = currentUser.permissions || [];
        const permissionExists = currentPermissions.some(p => 
          (p.id || p._id) === (permission.id || permission._id)
        );
        
        if (!permissionExists) {
          return [...currentPermissions, permission];
        }
        return currentPermissions;
      }
    }, userParams);
  }

  /**
   * Revoke permission from a user optimistically
   */
  static revokePermission(userId, permissionId, userParams = {}) {
    // Update users list
    this.updateItem('users', {
      id: userId,
      permissions: (currentUser) => {
        const currentPermissions = currentUser.permissions || [];
        return currentPermissions.filter(p => (p.id || p._id) !== permissionId);
      }
    }, userParams);
  }

  /**
   * Update user role optimistically
   */
  static updateUserRole(userId, newRole, userParams = {}) {
    this.updateItem('users', {
      id: userId,
      role: newRole,
      updatedAt: new Date().toISOString()
    }, userParams);
  }

  /**
   * Batch update multiple items
   */
  static batchUpdate(type, updates, params = {}) {
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return currentData.map(item => {
          const itemId = item.id || item._id;
          const update = updates.find(u => (u.id || u._id) === itemId);
          return update ? { ...item, ...update } : item;
        });
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: currentData.data.map(item => {
            const itemId = item.id || item._id;
            const update = updates.find(u => (u.id || u._id) === itemId);
            return update ? { ...item, ...update } : item;
          })
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Sort cached data optimistically
   */
  static sortData(type, sortFunction, params = {}) {
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return [...currentData].sort(sortFunction);
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        return {
          ...currentData,
          data: [...currentData.data].sort(sortFunction)
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Filter cached data optimistically (for client-side filtering)
   */
  static filterData(type, filterFunction, params = {}) {
    dataCache.optimisticUpdate(type, (currentData) => {
      if (Array.isArray(currentData)) {
        return currentData.filter(filterFunction);
      } else if (currentData && currentData.data && Array.isArray(currentData.data)) {
        const filteredData = currentData.data.filter(filterFunction);
        return {
          ...currentData,
          data: filteredData,
          total: filteredData.length
        };
      }
      return currentData;
    }, params);
  }

  /**
   * Revert optimistic update if API call fails
   */
  static revert(type, originalData, params = {}) {
    dataCache.set(type, originalData, params);
  }

  /**
   * Handle API response and sync with cache
   */
  static handleApiResponse(type, apiResponse, params = {}) {
    // Update cache with actual API response
    dataCache.set(type, apiResponse, params);
  }

  /**
   * Generic optimistic operation wrapper
   */
  static async performOptimisticOperation({
    type,
    params = {},
    optimisticUpdate,
    apiCall,
    onSuccess,
    onError,
    revertOnError = true
  }) {
    // Store original data for potential revert
    const originalData = dataCache.get(type, params).data;
    
    try {
      // Apply optimistic update
      if (optimisticUpdate) {
        dataCache.optimisticUpdate(type, optimisticUpdate, params);
      }
      
      // Make API call
      const result = await apiCall();
      
      // Sync with API response
      if (result) {
        this.handleApiResponse(type, result, params);
      }
      
      // Call success callback
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      // Revert optimistic update if requested
      if (revertOnError && originalData) {
        this.revert(type, originalData, params);
      }
      
      // Call error callback
      if (onError) {
        onError(error);
      }
      
      throw error;
    }
  }
}

/**
 * Specific optimistic update functions for common operations
 */

// User management
export const userOptimisticUpdates = {
  create: (newUser, params = {}) => 
    OptimisticUpdates.addItem('users', newUser, params),
    
  update: (updatedUser, params = {}) => 
    OptimisticUpdates.updateItem('users', updatedUser, params),
    
  delete: (userId, params = {}) => 
    OptimisticUpdates.removeItem('users', userId, params),
    
  grantPermission: (userId, permission, params = {}) =>
    OptimisticUpdates.grantPermission(userId, permission, params),
    
  revokePermission: (userId, permissionId, params = {}) =>
    OptimisticUpdates.revokePermission(userId, permissionId, params),
    
  updateRole: (userId, newRole, params = {}) =>
    OptimisticUpdates.updateUserRole(userId, newRole, params)
};

// Member management
export const memberOptimisticUpdates = {
  create: (newMember, params = {}) => 
    OptimisticUpdates.addItem('members', newMember, params),
    
  update: (updatedMember, params = {}) => 
    OptimisticUpdates.updateItem('members', updatedMember, params),
    
  delete: (memberId, params = {}) => 
    OptimisticUpdates.removeItem('members', memberId, params),
    
  approve: (memberId, params = {}) =>
    OptimisticUpdates.updateItem('members', { 
      id: memberId, 
      status: 'approved',
      approvedAt: new Date().toISOString() 
    }, params),
    
  reject: (memberId, params = {}) =>
    OptimisticUpdates.updateItem('members', { 
      id: memberId, 
      status: 'rejected',
      rejectedAt: new Date().toISOString() 
    }, params)
};

// Permission management
export const permissionOptimisticUpdates = {
  create: (newPermission, params = {}) => 
    OptimisticUpdates.addItem('permissions', newPermission, params),
    
  update: (updatedPermission, params = {}) => 
    OptimisticUpdates.updateItem('permissions', updatedPermission, params),
    
  delete: (permissionId, params = {}) => 
    OptimisticUpdates.removeItem('permissions', permissionId, params)
};

export default OptimisticUpdates;