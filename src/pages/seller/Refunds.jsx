import React from "react";
import { RefundApprovalList } from "../../components/seller";

export default function SellerRefundPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu trả hàng/hoàn tiền</h1>
        <p className="text-gray-600 mt-1">Xem và xử lý các yêu cầu trả hàng, hoàn tiền từ khách hàng</p>
      </div>
      <RefundApprovalList />
    </div>
  );
}
