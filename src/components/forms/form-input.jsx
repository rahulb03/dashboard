'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';



function FormInput({
  control,
  name,
  label,
  description,
  required,
  type = 'text',
  placeholder,
  step,
  min,
  max,
  disabled,
  className,
  rules = {},
  maxLength,
  config = {}
}) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className='ml-1 text-red-500'>*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              step={step}
              min={min}
              max={max}
              maxLength={maxLength}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                let value = e.target.value;
                
                // Apply transform if provided
                if (config.transform) {
                  value = config.transform(value);
                }
                
                if (type === 'number') {
                  field.onChange(value === '' ? undefined : parseFloat(value));
                } else {
                  field.onChange(value);
                }
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormInput };
