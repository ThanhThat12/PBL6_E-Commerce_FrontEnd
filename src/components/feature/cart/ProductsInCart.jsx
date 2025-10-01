import React from "react";
import colorPattern from "../../../styles/colorPattern";
import CartProductItem from './CartProductItem';

const ProductsInCart = ({ products = [], onQuantityChange }) => {
  return (
    <div className="cart-products-table w-full bg-transparent">
      <div className="hidden md:grid grid-cols-4 gap-2 px-2 pb-2">
        <div 
          className="font-semibold py-3 min-w-[180px] text-left"
          style={{ color: colorPattern.textLight }}
        >
          Product
        </div>
        <div 
          className="font-semibold py-3 min-w-[100px] text-center"
          style={{ color: colorPattern.textLight }}
        >
          Price
        </div>
        <div 
          className="font-semibold py-3 min-w-[100px] text-center"
          style={{ color: colorPattern.textLight }}
        >
          Quantity
        </div>
        <div 
          className="font-semibold py-3 min-w-[100px] text-center"
          style={{ color: colorPattern.textLight }}
        >
          Subtotal
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((item) => (
          <CartProductItem key={item.id} item={item} onQuantityChange={onQuantityChange} />
        ))}
      </div>
    </div>
  );
};

export default ProductsInCart;