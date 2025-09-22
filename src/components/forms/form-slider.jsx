'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';


function FormSlider({
  control,
  name,
  label,
  description,
  required,
  config,
  showValue = true,
  disabled,
  className
}) {
  const { min, max, step = 1, formatValue } = config;

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
            <div className='px-3'>
              <Slider
                min={min}
                max={max}
                step={step}
                value={[field.value || min]}
                onValueChange={(value) => field.onChange(value[0])}
                disabled={disabled}
              />
              {showValue && (
                <div className='text-muted-foreground mt-1 flex justify-between text-sm'>
                  <span>{formatValue ? formatValue(min) : min}</span>
                  <span>
                    {formatValue
                      ? formatValue(field.value || min)
                      : field.value || min}
                  </span>
                  <span>{formatValue ? formatValue(max) : max}</span>
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

export { FormSlider };
