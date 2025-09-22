'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';



function FormSwitch({
  control,
  name,
  label,
  description,
  required,
  showDescription = true,
  disabled,
  className
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-center justify-between rounded-lg border p-4 ${className}`}
        >
          <div className='space-y-0.5'>
            <FormLabel className='text-base'>
              {label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
            {showDescription && description && (
              <FormDescription>{description}</FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export { FormSwitch };
