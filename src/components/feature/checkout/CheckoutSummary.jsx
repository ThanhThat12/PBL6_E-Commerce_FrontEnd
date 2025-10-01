import React, { useState } from "react";
import colorPattern from "../../../styles/colorPattern";
import ApplyCoupon from "../../common/ApplyCoupon";

const paymentIcons = [
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
    <div className={`w-full p-0 flex flex-col gap-6 ${className}`} style={{color: colorPattern.text}}>
      <div className="flex flex-col gap-6 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded" />
              <span className="text-base" style={{color: colorPattern.text}}>{item.name}</span>
            </div>
            <span className="text-base font-medium" style={{color: colorPattern.price}}>${item.price}</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col gap-4 pt-4" style={{ borderTop: `1px solid ${colorPattern.border}` }}>
        <div className="flex justify-between text-base">
          <span style={{color: colorPattern.textLight}}>Subtotal:</span>
          <span style={{color: colorPattern.text}}>${subtotal}</span>
        </div>
        <div className="flex justify-between text-base">
          <span style={{color: colorPattern.textLight}}>Shipping:</span>
          <span style={{color: colorPattern.text}}>{shipping === 0 ? "Free" : `$${shipping}`}</span>
        </div>
        <div className="flex justify-between text-base font-semibold pt-4" style={{borderTop: `1px solid ${colorPattern.border}`}}>
          <span style={{color: colorPattern.textLight}}>Total:</span>
          <span style={{color: colorPattern.text}}>${total}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <input
              type="radio"
              id="bank"
              name="payment"
              value="bank"
              checked={payment === "bank"}
              onChange={() => setPayment("bank")}
              className="w-5 h-5"
              style={{ accentColor: colorPattern.primary }}
            />
            <label htmlFor="bank" className="text-base" style={{color: colorPattern.text}}>Bank</label>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {paymentIcons.map((icon) => (
              <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-6 w-auto" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <input
            type="radio"
            id="cod"
            name="payment"
            value="cod"
            checked={payment === "cod"}
            onChange={() => setPayment("cod")}
            className="w-5 h-5"
            style={{ accentColor: colorPattern.primary }}
          />
          <label htmlFor="cod" className="text-base" style={{color: colorPattern.text}}>Cash on delivery</label>
        </div>
      </div>
      
      <div className="mt-4">
        <ApplyCoupon />
      </div>
      
      <button
        type="button"
        className="transition-all duration-200 hover:brightness-90"
        style={{
          width: 200,
          background: colorPattern.primary,
          color: colorPattern.textWhite,
          borderRadius: 6,
          padding: '12px 24px',
          fontSize: 16,
          fontWeight: 600,
          marginTop: 16,
          border: 'none',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colorPattern.primaryDark;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = colorPattern.primary;
        }}
      >
        Place Order
      </button>
    </div>
  );
};

export default CheckoutSummary;