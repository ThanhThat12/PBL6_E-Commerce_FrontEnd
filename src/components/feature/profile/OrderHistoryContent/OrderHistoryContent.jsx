import React, { useState } from "react";
import "./OrderHistoryContent.css";
import OrderHistoryTable from "../OrderHistoryTable/OrderHistoryTable";

const ORDERS_PER_PAGE = 10;
const orders = [
  { id: "#3933", date: "4 April, 2021", total: "$135.00 (5 Products)", status: "Processing" },
  { id: "#5045", date: "27 Mar, 2021", total: "$25.00 (1 Product)", status: "on the way" },
  { id: "#5028", date: "20 Mar, 2021", total: "$250.00 (4 Products)", status: "Completed" },
  { id: "#4600", date: "19 Mar, 2021", total: "$35.00 (1 Product)", status: "Completed" },
  { id: "#4152", date: "18 Mar, 2021", total: "$578.00 (13 Products)", status: "Completed" },
  { id: "#8811", date: "10 Mar, 2021", total: "$345.00 (7 Products)", status: "Completed" },
  { id: "#3536", date: "5 Mar, 2021", total: "$560.00 (2 Products)", status: "Completed" },
  { id: "#1374", date: "27 Feb, 2021", total: "$560.00 (2 Products)", status: "Completed" },
  { id: "#7791", date: "25 Feb, 2021", total: "$560.00 (2 Products)", status: "Completed" },
  { id: "#4846", date: "24 Feb, 2021", total: "$23.00 (1 Product)", status: "Completed" },
  { id: "#5948", date: "20 Feb, 2021", total: "$23.00 (1 Product)", status: "Completed" },
  { id: "#1577", date: "12 Oct, 2020", total: "$23.00 (1 Product)", status: "Completed" },
];

export default function OrderHistoryContent({ onViewDetails }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const pagedOrders = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE);

  return (
    <div className="order-history-card">
      <div className="order-history-header">Order History</div>
      <OrderHistoryTable orders={pagedOrders} onViewDetails={onViewDetails} />
      <div className="order-pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>&lt;</button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            className={page === idx + 1 ? "active" : ""}
            onClick={() => setPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>&gt;</button>
      </div>
    </div>
  );
}
