import React, { useState } from "react";
import ApplyCoupon from "../../common/ApplyCoupon";

const paymentIcons = [
  // You can replace these with actual <img> tags or SVGs for real icons
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Bkash_Logo.png", alt: "Bkash" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png", alt: "Visa" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png", alt: "Mastercard" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Nagad-Logo.png", alt: "Nagad" },
];

const mockCart = [
  { id: 1, name: "LCD Monitor", price: 650, image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
  { id: 2, name: "H1 Gamepad", price: 1100, image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" },
];

const CheckoutSummary = ({ cart = mockCart, subtotal = 1750, shipping = 0, total = 1750, className = "" }) => {
  const [payment, setPayment] = useState("cod");

  return (
    <div className={`max-w-lg mx-auto p-0 flex flex-col gap-6 ${className}`}>
      <div className="flex flex-col gap-10 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded" />
              <span className="text-base text-black">{item.name}</span>
            </div>
            <span className="text-base text-black font-medium">${item.price}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-6 border-t border-gray-200 pt-3">
        <div className="flex justify-between text-base">
          <span>Subtotal:</span>
          <span>${subtotal}</span>
        </div>
        <div className="flex justify-between text-base">
          <span>Shipping:</span>
          <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-6">
          <span>Total:</span>
          <span>${total}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center gap-2">
         <div className="flex items-center gap-2">
            <input
              type="radio"
              id="bank"
              name="payment"
              value="bank"
              checked={payment === "bank"}
              onChange={() => setPayment("bank")}
              className="accent-red-500 w-5 h-5"
            />
            <label htmlFor="bank" className="text-base">Bank</label>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {paymentIcons.map((icon) => (
              <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-6 w-auto" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="radio"
            id="cod"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
            className="accent-red-500 w-5 h-5"
          />
          <label htmlFor="cod" className="text-base">Cash on delivery</label>
        </div>
      </div>
      <ApplyCoupon />
      <button
        type="button"
        className="w-40 ml-0 bg-red-500 text-white rounded-md py-2 px-4 text-base font-semibold mt-2 hover:bg-red-600 transition"
      >
        Place Order
      </button>
    </div>
  );
};

export default CheckoutSummary;
