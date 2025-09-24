'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconEdit, IconDotsVertical, IconTrash, IconEye, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { deletePaymentConfigThunk, togglePaymentConfigThunk } from '@/redux/payments/paymentConfigThunks';

export const CellAction = ({ data }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const onConfirm = async () => {
    setLoading(true);
    try {
      await dispatch(deletePaymentConfigThunk(data.id)).unwrap();
      toast.success('Payment configuration deleted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete payment configuration');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onToggleStatus = async () => {
    try {
      await dispatch(togglePaymentConfigThunk(data.id)).unwrap();
      toast.success(`Payment configuration ${data.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      toast.error(error.message || 'Failed to toggle payment configuration status');
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/payment/${data.id}/view`)}
          >
            <IconEye className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/payment/${data.id}/edit`)}
          >
            <IconEdit className='mr-2 h-4 w-4' /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleStatus}>
            {data.isActive ? (
              <IconToggleLeft className='mr-2 h-4 w-4' />
            ) : (
              <IconToggleRight className='mr-2 h-4 w-4' />
            )}
            {data.isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};