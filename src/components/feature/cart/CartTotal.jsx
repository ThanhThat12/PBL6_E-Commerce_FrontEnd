import React from "react";
import colorPattern from "../../../styles/colorPattern";

const CartTotal = ({ subtotal = 0, shipping = "Free", total = 0, onCheckout }) => {
  return (
    <div 
      className="rounded-lg p-6 max-w-xs w-full mx-auto"
      style={{ 
        border: `1px solid ${colorPattern.border}`,
        backgroundColor: colorPattern.background,
      }}
    >
      <h3 
        className="font-semibold text-lg mb-4"
        style={{ color: colorPattern.text }}
      >
        Cart Total
      </h3>
      <div className="flex justify-between mb-2 text-base">
        <span style={{ color: colorPattern.textLight }}>Subtotal:</span>
        <span 
          className="font-medium"
          style={{ color: colorPattern.text }}
        >
          ${subtotal}
        </span>
      </div>
      <div className="flex justify-between mb-2 text-base">
        <span style={{ color: colorPattern.textLight }}>Shipping:</span>
        <span 
          className="font-medium"
          style={{ color: colorPattern.text }}
        >
          {shipping}
        </span>
      </div>
      <hr 
        className="my-3" 
        style={{ borderColor: colorPattern.border }}
      />
      <div className="flex justify-between mb-6 text-base">
        <span 
          className="font-semibold"
          style={{ color: colorPattern.textLight }}
        >
          Total:
        </span>
        <span 
          className="font-semibold"
          style={{ color: colorPattern.text }}
        >
          ${total}
        </span>
      </div>
      <button
        className="w-full py-3 rounded font-semibold transition-all duration-200"
        style={{
          backgroundColor: colorPattern.accent,
          color: colorPattern.textWhite,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorPattern.accentDark;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colorPattern.accent;
        }}
        onClick={onCheckout}
      >
        Proceed to checkout
      </button>
    </div>
  );
};

export default CartTotal;