import React from 'react';
import Layout from "../../../components/admin/layout/Layout";
import CustomersTable from '../../../components/admin/users/CustomersTable';

const Customers = () => {
  return (
    <Layout>
      <CustomersTable />
    </Layout>
  );
};

export default Customers;