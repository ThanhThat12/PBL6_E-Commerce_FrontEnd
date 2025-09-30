import React, { useState } from "react";
import colorPattern from "../../styles/colorPattern";

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
        className="min-w-[180px] px-4 py-2 rounded focus:outline-none transition-colors"
        style={{
          backgroundColor: colorPattern.inputBg,
          border: `1px solid ${colorPattern.inputBorder}`,
          color: colorPattern.text,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colorPattern.inputFocus;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colorPattern.inputBorder;
        }}
        placeholder="Coupon Code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <button
        type="submit"
        className="px-6 py-2 rounded font-semibold transition-all duration-200 hover:brightness-110"
        style={{
          backgroundColor: colorPattern.secondary,
          color: colorPattern.textWhite,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorPattern.secondaryDark;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colorPattern.secondary;
        }}
      >
        Apply Coupon
      </button>
    </form>
  );
};

export default ApplyCoupon;