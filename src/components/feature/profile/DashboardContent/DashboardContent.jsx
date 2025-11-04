import React from "react";
import "./DashboardContent.css";
import colorPattern from "../../../../styles/colorPattern";
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
    <div
      className="dashboard-main"
      style={{ background: colorPattern.backgroundGray, minHeight: "100vh", padding: "32px" }}
    >
      <div className="dashboard-top" style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
        <div
          className="profile-card"
          style={{
            background: colorPattern.background,
            border: `1px solid ${colorPattern.border}`,
            borderRadius: "16px",
            boxShadow: `0 2px 8px ${colorPattern.shadow}`,
            padding: "32px",
            flex: 1,
            color: colorPattern.text,
          }}
        >
          <div className="profile-avatar" style={{ marginBottom: "16px" }}>
            {/* <img src="avatar_url" alt="avatar" /> */}
          </div>
          <div className="profile-name" style={{ fontWeight: "bold", fontSize: "1.5rem", color: colorPattern.primary }}>{user.name}</div>
          <div className="profile-role" style={{ color: colorPattern.secondary, marginBottom: "8px" }}>{user.role}</div>
          <a href="#" className="profile-edit" style={{ color: colorPattern.primary, textDecoration: "underline", fontWeight: "500" }}>Edit Profile</a>
        </div>
        <div
          className="billing-card"
          style={{
            background: colorPattern.background,
            border: `1px solid ${colorPattern.border}`,
            borderRadius: "16px",
            boxShadow: `0 2px 8px ${colorPattern.shadow}`,
            padding: "32px",
            flex: 1,
            color: colorPattern.text,
          }}
        >
          <div className="billing-title" style={{ fontWeight: "bold", color: colorPattern.primaryDark, marginBottom: "8px" }}>BILLING ADDRESS</div>
          <div className="billing-name" style={{ fontWeight: "500", color: colorPattern.primary }}>{user.name}</div>
          <div className="billing-address" style={{ color: colorPattern.textLight }}>{user.address}</div>
          <div className="billing-email" style={{ color: colorPattern.textLight }}>{user.email}</div>
          <div className="billing-phone" style={{ color: colorPattern.textLight }}>{user.phone}</div>
          <a href="#" className="billing-edit" style={{ color: colorPattern.secondary, textDecoration: "underline", fontWeight: "500" }}>Edit Address</a>
        </div>
      </div>
      <div
        className="order-history-card"
        style={{
          background: colorPattern.background,
          border: `1px solid ${colorPattern.border}`,
          borderRadius: "16px",
          boxShadow: `0 2px 8px ${colorPattern.shadow}`,
          padding: "32px",
          color: colorPattern.text,
        }}
      >
        <div className="order-history-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontWeight: "bold", color: colorPattern.primary }}>Recent Order History</span>
          <a href="#" className="view-all" style={{ color: colorPattern.secondary, textDecoration: "underline", fontWeight: "500" }}>View All</a>
        </div>
        <OrderHistoryTable orders={orders} onViewDetails={onViewDetails} />
      </div>
    </div>
  );
}
