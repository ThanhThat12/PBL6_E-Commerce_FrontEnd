import React from "react";
import { User } from "lucide-react";

const RecentOrdersTable = ({ orders }) => {
  return (
    <div className="table-card">
      <div className="table-header">
        <h3 className="table-title">Đơn Hàng Gần Đây</h3>
        <button className="view-all-btn">Xem Tất Cả</button>
      </div>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Mã Đơn</th>
              <th>Khách Hàng</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              {/* <th>Thao Tác</th> */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td className="order-id">#{order.id}</td>
                <td>
                  <div className="customer-info">
                    {order.customer.avatar ? (
                      <img src={order.customer.avatar} alt={order.customer.name} className="customer-avatar" />
                    ) : (
                      <div className="customer-avatar customer-avatar-placeholder">
                        <User size={20} />
                      </div>
                    )}
                    <div>
                      <div className="customer-name">{order.customer.name}</div>
                      <div className="customer-email">{order.customer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="order-date">{order.date}</td>
                <td className="order-amount">{order.amount}đ</td>
                <td>
                  <span className={`status-badge ${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                </td>
                {/* <td>
                  <button className="action-btn">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrdersTable;