import React from "react";

export default function OrderHistoryTable({ orders, onViewDetails }) {
  return (
    <table className="order-history-table">
      <thead>
        <tr>
          <th>ORDER ID</th>
          <th>DATE</th>
          <th>TOTAL</th>
          <th>STATUS</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id}>
            <td>{o.id}</td>
            <td>{o.date}</td>
            <td><b>{o.total}</b></td>
            <td>{o.status}</td>
            <td>
              {onViewDetails ? (
                <button
                  type="button"
                  className="view-details"
                  style={{ background: "none", border: "none", color: "#1db954", textDecoration: "underline", cursor: "pointer", padding: 0 }}
                  onClick={() => onViewDetails(o.id)}
                >
                  View Details
                </button>
              ) : (
                <span className="view-details" style={{ color: "#1db954", textDecoration: "underline" }}>View Details</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
