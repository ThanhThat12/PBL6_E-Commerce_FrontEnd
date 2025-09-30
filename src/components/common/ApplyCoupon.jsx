import React, { useState } from "react";

const ApplyCoupon = ({ onApply }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onApply) onApply(code);
  };

  return (
    <form className="flex gap-3" onSubmit={handleSubmit}>
      <input
        type="text"
        className="border rounded px-4 py-2 min-w-[180px] focus:outline-none"
        placeholder="Coupon Code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button
        type="submit"
        className="bg-red-500 text-white px-6 py-2 rounded font-semibold hover:brightness-110 transition-all duration-200"
      >
        Apply Coupon
      </button>
    </form>
  );
};

export default ApplyCoupon;
