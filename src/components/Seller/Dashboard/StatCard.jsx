import React from "react";
import { Card } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";


export const StatCard = ({
  title,
  value,
  percent,
  prevValue,
  isIncrease,
  period,
  pending,
  canceled,
  pendingPrev,
  canceledChange,
}) => {
  return (
    <Card className="stat-card">
      <div className="stat-header">
        <h3>{title}</h3>
        <span>{period}</span>
      </div>

      {pending ? (
        <div className="pending-stats">
          <div className="pending">
            <span>Pending</span>
            <h2>{pending}</h2>
            <p>user {pendingPrev}</p>
          </div>
          <div className="canceled">
            <span>Canceled</span>
            <h2>{canceled}</h2>
            <p className="percent-change negative">
              <ArrowDownOutlined /> {canceledChange}%
            </p>
          </div>
        </div>
      ) : (
        <>
          <h2>{value}</h2>
          <div className="stat-footer">
            <span
              className={`percent ${isIncrease ? "positive" : "negative"}`}
            >
              {isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {percent}%
            </span>
            <span className="prev-value">
              Previous 7days ({prevValue})
            </span>
          </div>
        </>
      )}
    </Card>
  );
};

/*

import React from "react";
import "./StatCard.css";

export default function StatCard({ title, value, subValue, color }) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2 style={{ color: color || "green" }}>{value}</h2>
      <p>{subValue}</p>
    </div>
  );
}

*/