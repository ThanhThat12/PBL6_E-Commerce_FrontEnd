// src/pages/Seller/SellerDashboardPage.js
import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Card, Select } from 'antd';
import { 
  Sidebar, 
  Header, 
  StatCard, 
  SalesLineChart, 
  TopProductsList, 
  TransactionTable, 
  BestSellingProducts, 
  AddNewProduct 
} from '../../components/Seller';
import dashboardService from '../../services/dashboardService';
import './SellerDashboardPage.css';

const { Content } = Layout;
const { Option } = Select;

const SellerDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await dashboardService.getDashboard();
      setDashboardData(data);
    };
    fetchData();
  }, []);

  return (
    <Layout className="dashboard-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="dashboard-content">
          <Row gutter={[24, 24]}>
            {/* Row 1: Total Stats */}
            <Col span={8}>
              <StatCard 
                title="Total Sales"
                value="$350K"
                percent={10.4}
                prevValue="$235"
                isIncrease={true}
                period="Last 7 days"
              />
            </Col>
            <Col span={8}>
              <StatCard 
                title="Total Orders"
                value="10.7K"
                percent={14.4}
                prevValue="7.6k"
                isIncrease={true}
                period="Last 7 days"
              />
            </Col>
            <Col span={8}>
              <StatCard 
                title="Pending & Canceled"
                pending="509"
                canceled="94"
                pendingPrev="204"
                canceledChange={14.4}
                period="Last 7 days"
              />
            </Col>

            {/* Row 2: Report Chart */}
            <Col span={24}>
              <Card className="report-card">
                <div className="report-header">
                  <div className="report-title">
                    <h2>Report for this week</h2>
                    <div className="report-stats">
                      <div className="stat-item">
                        <span>52k</span>
                        <p>Customers</p>
                      </div>
                      <div className="stat-item">
                        <span>3.5k</span>
                        <p>Total Products</p>
                      </div>
                      <div className="stat-item">
                        <span>2.5k</span>
                        <p>Stock Products</p>
                      </div>
                      <div className="stat-item">
                        <span>0.5k</span>
                        <p>Out of Stock</p>
                      </div>
                      <div className="stat-item">
                        <span>250k</span>
                        <p>Revenue</p>
                      </div>
                    </div>
                  </div>
                  <Select defaultValue="this-week" style={{ width: 120 }}>
                    <Option value="this-week">This week</Option>
                    <Option value="last-week">Last week</Option>
                  </Select>
                </div>
                <SalesLineChart data={dashboardData?.chart} />
              </Card>
            </Col>

            {/* Row 3: Transaction + Top Products + Add New Product */}
            <Col span={9}>
              <TransactionTable transactions={dashboardData?.transactions} />
            </Col>

            <Col span={9}>
              <TopProductsList products={dashboardData?.topProducts} />
            </Col>

            <Col span={6}>
              <AddNewProduct 
                categories={dashboardData?.addProductCategories}
                products={dashboardData?.addProductItems}
              />
            </Col>

            {/* Row 4: Best Selling Products */}
            <Col span={18}>
              <BestSellingProducts products={dashboardData?.bestSellingProducts} />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SellerDashboardPage;