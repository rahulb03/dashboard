'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';



function FormTextarea({
  control,
  name,
  label,
  description,
  required,
  placeholder,
  config = {},
  disabled,
  className
}) {
  const {
    maxLength,
    showCharCount = true,
    rows = 4,
    resize = 'vertical'
  } = config;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className='space-y-2'>
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                style={{ resize }}
                maxLength={maxLength}
                {...field}
              />
              {showCharCount && maxLength && (
                <div className='text-muted-foreground text-right text-sm'>
                  {field.value?.length || 0} / {maxLength}
                </div>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormTextarea };
