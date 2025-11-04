import React from 'react';
import Layout from '../../../components/admin/layout/Layout';
import { ProductsTable } from '../../../components/admin/products';

const ProductsPage = () => {
  return (
    <Layout>
      <ProductsTable />
    </Layout>
  );
};

export default ProductsPage;
