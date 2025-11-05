
import React from "react";
import colorPattern from "../../../styles/colorPattern";

const CartProductItem = ({ item, onQuantityChange }) => (
  <div
    className="rounded-2xl flex flex-col md:grid md:grid-cols-4 items-center gap-2 px-4 py-5 transition-all duration-200 border hover:shadow-xl"
    style={{
      background: `linear-gradient(90deg, ${colorPattern.backgroundGray} 0%, ${colorPattern.background} 100%)`,
      border: `1.5px solid ${colorPattern.borderDark}`,
      boxShadow: `0 2px 12px ${colorPattern.shadow}`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = `0 6px 24px ${colorPattern.shadowDark}`;
      e.currentTarget.style.borderColor = colorPattern.primary;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = `0 2px 12px ${colorPattern.shadow}`;
      e.currentTarget.style.borderColor = colorPattern.borderDark;
    }}
  >
    {/* Product Info */}
    <div className="flex items-center gap-4 min-w-[180px] w-full md:w-auto">
      <img
        src={item.productImage}
        alt={item.productName}
        className="w-16 h-16 object-contain rounded-lg border"
        style={{ borderColor: colorPattern.border }}
      />
      <span
        className="font-semibold text-base md:text-lg"
        style={{ color: colorPattern.text }}
      >
        {item.productName}
      </span>
    </div>
    {/* Price */}
    <div
      className="font-bold w-full md:w-auto text-left md:text-center text-lg"
      style={{ color: colorPattern.price }}
    >
      ${item.productPrice.toLocaleString()}
    </div>
    {/* Quantity */}
    <div className="w-full md:w-auto flex justify-start md:justify-center">
      <select
        className="rounded-lg px-3 py-1 text-center font-medium focus:outline-none transition-colors border"
        style={{
          border: `1.5px solid ${colorPattern.inputBorder}`,
          backgroundColor: colorPattern.inputBg,
          color: colorPattern.text,
        }}
        onFocus={e => {
          e.target.style.borderColor = colorPattern.inputFocus;
        }}
        onBlur={e => {
          e.target.style.borderColor = colorPattern.inputBorder;
        }}
        value={item.quantity}
        onChange={e => onQuantityChange && onQuantityChange(item.id, Number(e.target.value))}
      >
        {[...Array(10)].map((_, i) => (
          <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
    {/* Subtotal */}
    <div
      className="font-bold w-full md:w-auto text-left md:text-center text-lg"
      style={{ color: colorPattern.accent }}
    >
      ${ (item.productPrice * item.quantity).toLocaleString() }
    </div>
  </div>
);

export default CartProductItem;