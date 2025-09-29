import { getProductById } from '@/constants/products-data';
import { notFound } from 'next/navigation';
import ProductForm from './product-form';


export default function ProductViewPage({
  productId
}) {
  let product = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    product = getProductById(productId);
    if (!product) {
      notFound();
    }
    pageTitle = `Edit Product`;
  }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
