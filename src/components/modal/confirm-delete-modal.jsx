'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2 } from 'lucide-react';
/**
 * Enhanced reusable delete confirmation modal
 * Consolidates all redundant delete modal implementations across management modules
 */
export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title,
  description,
  itemName,
  itemType,
  confirmButtonText = 'Delete',
  cancelButtonText = 'Cancel',
  variant = 'default' // 'default' or 'contextual'
}) => {
  // Generate contextual messaging based on props
  const getTitle = () => {
    if (title) return title;
    return itemName ? `Delete ${itemType || 'Item'}?` : 'Confirm Delete';
  };

  const getDescription = () => {
    if (description) return description;
    
    if (variant === 'contextual' && itemName && itemType) {
      return `This will permanently delete "${itemName}". This action cannot be undone and all associated data will be lost.`;
    }
    
    if (itemType) {
      return `This will permanently delete this ${itemType.toLowerCase()}. This action cannot be undone.`;
    }
    
    return 'This action cannot be undone. Are you sure you want to continue?';
  };

  const getConfirmButtonText = () => {
    if (confirmButtonText !== 'Delete') return confirmButtonText;
    return itemType ? `Delete ${itemType}` : 'Delete';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {getTitle()}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>
        
        <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
          {getDescription()}
        </AlertDialogDescription>

        {/* Show item details if provided */}
        {variant === 'contextual' && itemName && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-medium text-foreground">
                {itemType || 'Item'}: 
              </span>
              <span className="ml-1 text-muted-foreground">
                {itemName}
              </span>
            </div>
          </div>
        )}

        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel 
            disabled={loading}
            className="hover:bg-muted"
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await onConfirm();
            }}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {getConfirmButtonText()}
              </>
            )}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <ConfirmDeleteModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   loading={loading}
 *   itemType="Payment Configuration"
 * />
 * 
 * // Contextual usage with item details
 * <ConfirmDeleteModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   loading={loading}
 *   itemType="Loan Application"
 *   itemName={application.fullName}
 *   variant="contextual"
 * />
 * 
 * // Custom messaging
 * <ConfirmDeleteModal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   onConfirm={handleDelete}
 *   loading={loading}
 *   title="Remove Member"
 *   description="This member will be removed from the organization. They will lose access to all resources."
 *   confirmButtonText="Remove Member"
 * />
 */