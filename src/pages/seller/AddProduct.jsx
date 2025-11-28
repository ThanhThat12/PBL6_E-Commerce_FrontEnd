import React from 'react';
import { AddProductForm } from '../../components/seller/Products';

/**
 * Add Product Page
 * Form to create new product with variants
 */
const AddProduct = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Thêm sản phẩm mới</h1>
      <AddProductForm />
    </div>
  );
};

export default AddProduct;
