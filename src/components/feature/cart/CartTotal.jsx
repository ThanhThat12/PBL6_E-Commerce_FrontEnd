import React from "react";

const CartTotal = ({ subtotal = 0, shipping = "Free", total = 0, onCheckout }) => {
  return (
    <div className="border rounded-lg p-6 bg-white max-w-xs w-full mx-auto">
      <h3 className="font-semibold text-lg mb-4">Cart Total</h3>
      <div className="flex justify-between mb-2 text-base">
        <span>Subtotal:</span>
        <span className="font-medium">${subtotal}</span>
      </div>
      <div className="flex justify-between mb-2 text-base">
        <span>Shipping:</span>
        <span className="font-medium">{shipping}</span>
      </div>
      <hr className="my-3" />
      <div className="flex justify-between mb-6 text-base">
        <span className="font-semibold">Total:</span>
        <span className="font-semibold">${total}</span>
      </div>
      <button
        className="w-full bg-red-500 text-white py-3 rounded font-semibold hover:brightness-110 transition-all duration-200"
        onClick={onCheckout}
      >
        Proceed to checkout
      </button>
    </div>
  );
};

export default CartTotal;
