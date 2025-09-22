'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';



function FormCheckbox({
  control,
  name,
  label,
  description,
  required,
  checkboxLabel,
  disabled,
  className
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={`flex flex-row items-start space-y-0 space-x-3 ${className}`}
        >
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className='space-y-1 leading-none'>
            <FormLabel>
              {checkboxLabel || label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormCheckbox };
