// src/pages/Seller/CustomersPage.js
import React from 'react';
import { Layout } from 'antd';
import { Sidebar } from '../../components/Seller/Sidebar';
import { Header } from '../../components/Seller/Header';
import './CustomersPage.css';

const { Content } = Layout;

const CustomersPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          <h1>Customers Management</h1>
          {/* Add customer management content here */}
        </Content>
      </Layout>
    </Layout>
  );
};

export { CustomersPage };