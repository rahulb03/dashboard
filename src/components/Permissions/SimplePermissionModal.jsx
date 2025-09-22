import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { grantPermission, revokePermission } from '../../redux/permissions/permissionThunks';
import { X, Shield, User, AlertCircle, Info, Settings, AlertTriangle } from 'lucide-react';
import { 
  getPermissionLabel, 
  getPermissionDescription,
  getCategoryLabel,
  getRoleLabel,
  getPermissionBadgeColor,
  isDangerousPermission
} from '../../Utils/permissionFormatter';
import PermissionSelectorModal from './PermissionSelectorModal';
import { OptimisticUpdates } from '../../Utils/OptimisticUpdates';
import './permissions.css';

const SimplePermissionModal = ({ isOpen, onClose, mode, user, availablePermissions }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.permissions);
  
  const [selectedPermission, setSelectedPermission] = useState('');
  const [selectedPermissionData, setSelectedPermissionData] = useState(null);
  const [reason, setReason] = useState('');
  const [showPermissionSelector, setShowPermissionSelector] = useState(false);

  const isGrantMode = mode === 'grant';
  
  // Get available permissions using useMemo to avoid temporal dead zone
  const permissions = useMemo(() => {
    const getPermissionsList = () => {
      if (!availablePermissions?.categories) return [];
      
      const allPerms = [];
      availablePermissions.categories.forEach(cat => {
        cat.permissions.forEach(perm => {
          // Format the permission with human-readable labels
          const formattedPerm = {
            ...perm,
            category: cat.label || getCategoryLabel(perm.resource),
            displayName: perm.name || getPermissionLabel(perm.resource, perm.action),
            displayDescription: perm.description || getPermissionDescription(perm.resource, perm.action),
            isDangerous: isDangerousPermission(perm.action)
          };
          allPerms.push(formattedPerm);
        });
      });
      return allPerms;
    };
    
    return getPermissionsList();
  }, [availablePermissions, isGrantMode]);

  useEffect(() => {
    if (isOpen) {
      setSelectedPermission('');
      setSelectedPermissionData(null);
      setReason('');
      setShowPermissionSelector(false);
    }
  }, [isOpen, mode]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPermission) {
      alert('Please select a permission');
      return;
    }

    const permissionId = parseInt(selectedPermission);
    const userId = user.id || user._id;
    const permission = permissions.find(p => (p.id || p._id) === permissionId);
    
    try {
      if (mode === 'grant') {
        // Optimistically update the UI first
        OptimisticUpdates.grantPermission(userId, permission, {
          search: '', // Update all user cache entries
          role: ''
        });
        
        // Then make the API call
        await dispatch(grantPermission({
          userId,
          permissionId,
          reason: reason || 'Permission granted by admin'
        })).unwrap();
      } else {
        // Optimistically update the UI first
        OptimisticUpdates.revokePermission(userId, permissionId, {
          search: '',
          role: ''
        });
        
        // Then make the API call
        await dispatch(revokePermission({
          userId,
          permissionId,
          reason: reason || 'Permission revoked by admin'
        })).unwrap();
      }
      
      onClose(false); // Close without refresh - optimistic updates handle UI
    } catch (err) {
      console.error('Permission operation failed:', err);
      // The optimistic update will be reverted by the error handling in the thunk
    }
  };

  const handlePermissionSelect = (permissionId) => {
    setSelectedPermission(permissionId);
    const permission = permissions.find(p => (p.id || p._id) === permissionId);
    setSelectedPermissionData(permission);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 modal-backdrop"
        onClick={() => onClose(false)}
      />

      {/* Modal - larger size for better UX */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isGrantMode ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isGrantMode ? 'bg-green-100' : 'bg-red-100'}`}>
                <Shield className={`h-6 w-6 ${isGrantMode ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${isGrantMode ? 'text-green-800' : 'text-red-800'}`}>
                  {isGrantMode ? 'Grant Permission' : 'Revoke Permission'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isGrantMode 
                    ? 'Give a user access to specific features and functions'
                    : 'Remove a user\'s access to specific features and functions'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900">
                {user.name || 'Unnamed User'}
              </h4>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-sm text-gray-600">{user.email}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {getRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error display */}
          {(error.grant || error.revoke) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-700 mt-1">{error.grant || error.revoke}</p>
              </div>
            </div>
          )}

          {/* Permission Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              Choose Permission
            </label>
            
            {/* Permission Selection */}
            {selectedPermissionData ? (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{selectedPermissionData.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedPermissionData.displayName}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedPermissionData.displayDescription}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">{selectedPermissionData.category}</span>
                        {selectedPermissionData.isDangerous && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Sensitive Permission
                          </span>
                        )}
                        {selectedPermissionData.isBasic && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Info className="h-3 w-3 mr-1" />
                            Safe Permission
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPermission('');
                      setSelectedPermissionData(null);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowPermissionSelector(true)}
                  disabled={permissions.length === 0}
                  className={`w-full p-4 border-2 border-dashed rounded-lg transition-colors ${
                    permissions.length === 0
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <Settings className="h-8 w-8 mb-3" />
                    <p className="font-medium mb-1">
                      {permissions.length === 0 
                        ? 'No permissions available' 
                        : `Choose a permission to ${isGrantMode ? 'grant' : 'revoke'}`
                      }
                    </p>
                    <p className="text-sm">
                      {permissions.length === 0 
                        ? 'No permissions are currently available for this action'
                        : `Browse through ${permissions.length} available permissions`
                      }
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Reason (Optional but Recommended)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder={`Provide a brief explanation for ${isGrantMode ? 'granting' : 'revoking'} this permission. This helps with audit trails and future reference.`}
            />
            <p className="text-xs text-gray-500 mt-1">
              This information will be logged for audit purposes
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading.grant || loading.revoke || !selectedPermission || permissions.length === 0}
              className={`px-6 py-2 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 btn-enhanced ${
                isGrantMode 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {loading.grant || loading.revoke ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>{isGrantMode ? 'Grant Permission' : 'Revoke Permission'}</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Permission Selector Modal */}
      <PermissionSelectorModal
        isOpen={showPermissionSelector}
        onClose={() => setShowPermissionSelector(false)}
        permissions={permissions}
        selectedPermissions={selectedPermission ? [selectedPermission] : []}
        onSelect={handlePermissionSelect}
        mode="single"
        title={`${isGrantMode ? 'Grant' : 'Revoke'} Permission`}
        description={`Choose a permission to ${isGrantMode ? 'give to' : 'remove from'} ${user?.name || user?.email}`}
      />
    </div>
  );
};

export default SimplePermissionModal;