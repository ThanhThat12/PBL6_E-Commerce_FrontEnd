import React from "react";
import { Link } from "react-router-dom";
import ProductList from "../../common/ProductList";
import { addToCart } from '../../../services/cartService';
import colorPattern from "../../../styles/colorPattern";
import { bestSellerProducts } from '../../../mockDataBestSeller';

const BestSellerSection = ({ products = bestSellerProducts }) => {
  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };
  return (
    <section 
      className="rounded-xl shadow p-6 md:p-10 mb-8"
      style={{ 
        backgroundColor: colorPattern.background,
        boxShadow: `0 4px 16px ${colorPattern.shadow}`,
      }}
    >
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-col items-start min-w-[120px]">
          <div className="flex items-center mb-2">
            <span 
              className="rounded h-6 w-4 mr-2"
              style={{ backgroundColor: colorPattern.secondary }}
            ></span>
            <span 
              className="font-bold text-lg"
              style={{ color: colorPattern.secondary }}
            >
              This Month
            </span>
          </div>
          <h2 
            className="font-bold text-3xl mt-2"
            style={{ color: colorPattern.text }}
          >
            Best Selling Products
          </h2>
        </div>
        <Link
          to="/products"
          className="px-8 py-3 rounded font-bold shadow transition-all duration-200 text-lg"
          style={{
            backgroundColor: colorPattern.accent,
            color: colorPattern.textWhite,
            display: 'inline-block',
            textAlign: 'center',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.target.style.backgroundColor = colorPattern.accentDark}
          onMouseLeave={e => e.target.style.backgroundColor = colorPattern.accent}
        >
          View All
        </Link>
      </div>
  <ProductList products={products} onAddToCart={handleAddToCart} showAddToCart />
    </section>
  );
};

export default BestSellerSection;