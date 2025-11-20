import React, { useState } from "react";
import orderService from "../../services/orderService";

export default function RefundRequestForm({ orderId, onSuccess }) {
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRefund = async () => {
    setLoading(true);
    setError("");
    try {
      await orderService.requestRefund(orderId, { amount, description: reason });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Gửi yêu cầu hoàn tiền thất bại");
    }
    setLoading(false);
  };

  if (success) return <div>Yêu cầu hoàn tiền đã được gửi!</div>;

  return (
    <div>
      <textarea
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Lý do hoàn tiền"
        rows={3}
        style={{ width: "100%" }}
      />
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="Số tiền hoàn"
        style={{ width: "100%", marginTop: 8 }}
      />
      <button onClick={handleRefund} disabled={loading || !reason || !amount} style={{ marginTop: 8 }}>
        {loading ? "Đang gửi..." : "Gửi yêu cầu hoàn tiền"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
