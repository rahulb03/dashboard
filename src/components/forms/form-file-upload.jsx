'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { FileUploader } from '@/components/file-uploader';



function FormFileUpload({
  control,
  name,
  label,
  description,
  required,
  config,
  disabled,
  className
}) {
  const {
    maxSize,
    acceptedTypes,
    multiple,
    maxFiles,
    onUpload,
    progresses,
    ...restConfig
  } = config || {};

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
            <FileUploader
              value={field.value}
              onValueChange={field.onChange}
              onUpload={onUpload}
              progresses={progresses}
              accept={acceptedTypes?.reduce(
                (acc, type) => ({ ...acc, [type]: [] }),
                {}
              )}
              maxSize={maxSize}
              maxFiles={maxFiles}
              multiple={multiple}
              disabled={disabled}
              {...restConfig}
            />
          </FormControl>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { FormFileUpload };
