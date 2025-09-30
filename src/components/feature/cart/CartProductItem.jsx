import React from "react";
import colorPattern from "../../../styles/colorPattern";

const CartProductItem = ({ item, onQuantityChange }) => (
  <div 
    className="rounded-xl shadow flex flex-col md:grid md:grid-cols-4 items-center gap-2 px-2 py-4 hover:shadow-lg transition"
    style={{ 
      backgroundColor: colorPattern.background,
      boxShadow: `0 2px 8px ${colorPattern.shadow}`,
    }}
    onMouseEnter={(e) => {
      e.target.style.boxShadow = `0 4px 16px ${colorPattern.shadowDark}`;
    }}
    onMouseLeave={(e) => {
      e.target.style.boxShadow = `0 2px 8px ${colorPattern.shadow}`;
    }}
  >
    <div className="flex items-center gap-4 min-w-[180px] w-full md:w-auto">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded" />
      <span 
        className="font-medium"
        style={{ color: colorPattern.text }}
      >
        {item.name}
      </span>
    </div>
    <div 
      className="font-semibold w-full md:w-auto text-left md:text-center"
      style={{ color: colorPattern.price }}
    >
      ${item.price}
    </div>
    <div className="w-full md:w-auto flex justify-start md:justify-center">
      <select
        className="rounded px-2 py-1 text-center focus:outline-none transition-colors"
        style={{
          border: `1px solid ${colorPattern.border}`,
          backgroundColor: colorPattern.inputBg,
          color: colorPattern.text,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colorPattern.inputFocus;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colorPattern.border;
        }}
        value={item.quantity}
        onChange={e => onQuantityChange && onQuantityChange(item.id, Number(e.target.value))}
      >
        {[...Array(10)].map((_, i) => (
          <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
    <div 
      className="font-semibold w-full md:w-auto text-left md:text-center"
      style={{ color: colorPattern.text }}
    >
      ${item.price * item.quantity}
    </div>
  </div>
);

export default CartProductItem;