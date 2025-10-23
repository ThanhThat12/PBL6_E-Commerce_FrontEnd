import React from 'react';
import { Layout } from 'antd';
import { Sidebar, Header } from '../../components/Seller';
import AddProductForm from '../../components/Seller/Products/AddProductForm';
import './AddProductPage.css';

const { Content } = Layout;

const AddProductPage = () => {
  return (
    <Layout className="add-product-page-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>

      <Layout>
        <Header />
        <Content className="add-product-page-content">
          <AddProductForm />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AddProductPage;