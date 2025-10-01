// src/pages/Seller/SellerDashboardPage.js
import React from 'react';
import { Layout } from 'antd';
import { Sidebar } from '../../components/Seller/Sidebar';
import { Header } from '../../components/Seller/Header';
import { SalesLineChart } from '../../components/Seller/SalesLineChart';
import './SellerDashboardPage.css';



const SellerDashboardPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      <Layout>
        <Layout.Header style={{ padding: 0, background: '#fff' }}>
          <Header />
        </Layout.Header>
        <Layout.Content style={{ margin: '24px', background: '#fff', padding: '24px' }}>
          <div className="dashboard-content">
            <div className="chart-section" style={{ padding: '24px' }}>
              <div className="chart-header">
                <h5>Sales Overview</h5>
                <select className="form-select" style={{ width: 120 }}>
                  <option>This week</option>
                  <option>Last week</option>
                </select>
              </div>
              <div style={{ marginTop: '24px' }}>
                <SalesLineChart />
              </div>
            </div>
          </div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

export default SellerDashboardPage;