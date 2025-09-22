import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPermissionHistory } from '../../redux/permissions/permissionThunks';
import { X, User, Clock, Shield, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const PermissionHistory = ({ isOpen, onClose, user }) => {
  const dispatch = useDispatch();
  const { permissionHistory, loading, error } = useSelector(state => state.permissions);

  useEffect(() => {
    if (isOpen && user) {
      dispatch(fetchUserPermissionHistory(user._id));
    }
  }, [isOpen, user, dispatch]);

  if (!isOpen || !user) return null;

  const getActionIcon = (action) => {
    switch (action) {
      case 'granted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'revoked':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'granted':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-white" />
                <h3 className="text-lg font-semibold text-white">Permission History</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Events</p>
                <p className="text-lg font-semibold text-gray-900">
                  {permissionHistory?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {loading.history ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-500">Loading history...</p>
              </div>
            ) : error.history ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Error loading history</p>
                  <p className="text-sm text-red-700 mt-1">{error.history}</p>
                </div>
              </div>
            ) : permissionHistory && permissionHistory.length > 0 ? (
              <div className="space-y-4">
                {/* Timeline */}
                <div className="relative">
                  {permissionHistory.map((event, index) => (
                    <div key={event._id} className="relative flex items-start mb-6">
                      {/* Timeline line */}
                      {index < permissionHistory.length - 1 && (
                        <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200"></div>
                      )}
                      
                      {/* Icon */}
                      <div className="flex-shrink-0 z-10 bg-white">
                        {getActionIcon(event.action)}
                      </div>
                      
                      {/* Content */}
                      <div className="ml-4 flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionBadgeClass(event.action)}`}>
                                {event.action.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(event.timestamp)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDateTime(event.timestamp)}
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <Shield className="h-4 w-4 text-indigo-600" />
                              <span className="text-sm font-medium text-gray-900">
                                {event.permission?.name || 'Unknown Permission'}
                              </span>
                            </div>
                            {event.permission?.description && (
                              <p className="text-xs text-gray-500 ml-6">
                                {event.permission.description}
                              </p>
                            )}
                          </div>
                          
                          {event.reason && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <span className="font-medium">Reason:</span> {event.reason}
                            </div>
                          )}
                          
                          {event.performedBy && (
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                              <span>
                                Performed by: <span className="font-medium">{event.performedBy.name || event.performedBy.email}</span>
                              </span>
                              {event.expiresAt && (
                                <span className="text-orange-600">
                                  Expires: {formatDateTime(event.expiresAt)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No permission history found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Permission changes will appear here
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Showing all permission events for this user
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionHistory;