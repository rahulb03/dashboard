'use client';

import { FormFileUpload } from '@/components/forms/form-file-upload';
import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Edit } from 'lucide-react';
import * as z from 'zod';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const formSchema = z.object({
  image: z
    .any()
    .refine((files) => files?.length === 1, 'Image is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
    .refine((files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), '.jpg, .jpeg, .png and .webp files are accepted.'),
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  category: z.string(),
  price: z.number(),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' })
});

export default function ProductForm({ initialData, pageTitle }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isViewMode = searchParams.get('mode') === 'view';
  
  const defaultValues = {
    name: initialData?.name || '',
    category: initialData?.category || '',
    price: initialData?.price || undefined,
    description: initialData?.description || ''
  };

  // Remove <z.infer<typeof formSchema>> since this is JSX
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  function onSubmit(values) {
    // console.log(values);
    router.push('/dashboard/product');
  }

  return (
    <div className="space-y-4">
      {/* Back button and edit toggle for view mode */}
      {isViewMode && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/product')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Products</span>
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/product/${initialData.id}`)}
            className="flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Product</span>
          </Button>
        </div>
      )}
      
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {isViewMode ? `Product Details - ${initialData?.name || 'Product'}` : pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormFileUpload
              control={form.control}
              name="image"
              label="Product Image"
              description={isViewMode ? "Product image" : "Upload a product image"}
              config={{ maxSize: 5 * 1024 * 1024, maxFiles: 4 }}
              disabled={isViewMode}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormInput
                control={form.control}
                name="name"
                label="Product Name"
                placeholder="Enter product name"
                required={!isViewMode}
                disabled={isViewMode}
              />

              <FormSelect
                control={form.control}
                name="category"
                label="Category"
                placeholder="Select category"
                required={!isViewMode}
                disabled={isViewMode}
                options={[
                  { label: 'Beauty Products', value: 'beauty' },
                  { label: 'Electronics', value: 'electronics' },
                  { label: 'Home & Garden', value: 'home' },
                  { label: 'Sports & Outdoors', value: 'sports' }
                ]}
              />

              <FormInput
                control={form.control}
                name="price"
                label="Price"
                placeholder="Enter price"
                required={!isViewMode}
                disabled={isViewMode}
                type="number"
                min={0}
                step="0.01"
              />
            </div>

            <FormTextarea
              control={form.control}
              name="description"
              label="Description"
              placeholder="Enter product description"
              required={!isViewMode}
              disabled={isViewMode}
              config={{ maxLength: 500, showCharCount: !isViewMode, rows: 4 }}
            />

            {!isViewMode && <Button type="submit">Add Product</Button>}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
