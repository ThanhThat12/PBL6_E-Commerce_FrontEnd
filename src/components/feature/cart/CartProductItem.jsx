import React from "react";

const CartProductItem = ({ item, onQuantityChange }) => (
  <div className="bg-white rounded-xl shadow flex flex-col md:grid md:grid-cols-4 items-center gap-2 px-2 py-4 hover:shadow-lg transition">
    <div className="flex items-center gap-4 min-w-[180px] w-full md:w-auto">
      <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded" />
      <span className="font-medium text-black">{item.name}</span>
    </div>
    <div className="font-semibold text-black w-full md:w-auto text-left md:text-center">${item.price}</div>
    <div className="w-full md:w-auto flex justify-start md:justify-center">
      <select
        className="border rounded px-2 py-1 text-center focus:outline-none"
        value={item.quantity}
        onChange={e => onQuantityChange && onQuantityChange(item.id, Number(e.target.value))}
      >
        {[...Array(10)].map((_, i) => (
          <option key={i+1} value={i+1}>{String(i+1).padStart(2, '0')}</option>
        ))}
      </select>
    </div>
    <div className="font-semibold text-black w-full md:w-auto text-left md:text-center">${item.price * item.quantity}</div>
  </div>
);

export default CartProductItem;
