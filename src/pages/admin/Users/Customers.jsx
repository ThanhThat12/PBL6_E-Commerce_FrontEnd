import React, { useEffect } from 'react';
import Layout from "../../../components/admin/layout/Layout";
import CustomersTable from '../../../components/admin/users/CustomersTable';

const Customers = () => {
  useEffect(() => {
    console.log('✅ [Customers] Component mounted');
    console.log('📍 [Customers] Current URL:', window.location.href);
    console.log('🔑 [Customers] AdminToken:', localStorage.getItem('adminToken'));
    console.log('👤 [Customers] AdminUser:', localStorage.getItem('adminUser'));
    
    return () => {
      console.log('❌ [Customers] Component unmounting');
    };
  }, []);

  return (
    <Layout>
      <CustomersTable />
    </Layout>
  );
};

export default Customers;