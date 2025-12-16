import React, { useState, useEffect } from "react";
import ProductList from "../../common/ProductList";
import { addToCart } from '../../../services/cartService';
import { getBestSellingProducts } from '../../../services/homeService';
import colorPattern from "../../../styles/colorPattern";

const BestSellerSection = ({ onViewAll }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const data = await getBestSellingProducts(8);
        setProducts(data);
      } catch (error) {
        console.error('Error fetching best selling products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id, 1);
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };

  if (loading) {
    return (
      <section 
        className="rounded-xl shadow p-6 md:p-10 mb-8"
        style={{ 
          backgroundColor: colorPattern.background,
          boxShadow: `0 4px 16px ${colorPattern.shadow}`,
        }}
      >
        <div className="text-center py-8">Đang tải...</div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }
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
        <button
          className="px-8 py-3 rounded font-bold shadow transition-all duration-200 text-lg"
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
          onClick={onViewAll}
        >
          View All
        </button>
      </div>
  <ProductList products={products} onAddToCart={handleAddToCart} showAddToCart />
    </section>
  );
};

export default BestSellerSection;