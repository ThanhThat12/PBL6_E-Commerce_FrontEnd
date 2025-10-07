import React from "react";
import "./DashboardContent.css";
import OrderHistoryTable from "../OrderHistoryTable/OrderHistoryTable";

export default function DashboardContent({ onViewDetails }) {
  // Dữ liệu mẫu
  const user = {
    name: "Dianne Russell",
    role: "Customer",
    email: "dianne.ressell@gmail.com",
    phone: "(671) 555-0110",
    address: "4140 Parker Rd. Allentown, New Mexico 31134",
  };
  const orders = [
    { id: "#738", date: "8 Sep, 2020", total: "$135.00 (5 Products)", status: "Processing" },
    { id: "#703", date: "24 May, 2020", total: "$25.00 (1 Product)", status: "on the way" },
    { id: "#130", date: "22 Oct, 2020", total: "$250.00 (4 Products)", status: "Completed" },
    { id: "#561", date: "1 Feb, 2020", total: "$35.00 (1 Product)", status: "Completed" },
    { id: "#536", date: "21 Sep, 2020", total: "$578.00 (13 Products)", status: "Completed" },
    { id: "#492", date: "22 Oct, 2020", total: "$345.00 (7 Products)", status: "Completed" },
  ];

  return (
    <div className="dashboard-main">
      <div className="dashboard-top">
        <div className="profile-card">
          <div className="profile-avatar">
            {/* <img src="avatar_url" alt="avatar" /> */}
          </div>
          <div className="profile-name">{user.name}</div>
          <div className="profile-role">{user.role}</div>
          <a href="#" className="profile-edit">Edit Profile</a>
        </div>
        <div className="billing-card">
          <div className="billing-title">BILLING ADDRESS</div>
          <div className="billing-name">{user.name}</div>
          <div className="billing-address">{user.address}</div>
          <div className="billing-email">{user.email}</div>
          <div className="billing-phone">{user.phone}</div>
          <a href="#" className="billing-edit">Edit Address</a>
        </div>
      </div>
      <div className="order-history-card">
        <div className="order-history-header">
          <span>Recet Order History</span>
          <a href="#" className="view-all">View All</a>
        </div>
  <OrderHistoryTable orders={orders} onViewDetails={onViewDetails} />
      </div>
    </div>
  );
}
