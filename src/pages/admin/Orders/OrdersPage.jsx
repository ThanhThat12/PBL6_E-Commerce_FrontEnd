import React from 'react';
import Layout from '../../../components/admin/layout/Layout';
import { OrdersTable } from '../../../components/admin/orders';

const OrdersPage = () => {
  return (
    <Layout>
      <OrdersTable />
    </Layout>
  );
};

export default OrdersPage;
