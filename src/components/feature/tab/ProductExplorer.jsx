import React from "react";
import { Link } from "react-router-dom";
import colorPattern from "../../../styles/colorPattern";
import useProducts from "../../../hooks/useProducts";
import ProductList from "../../common/ProductList";
import { addToCart } from "../../../services/cartService";

const ProductExplorer = () => {
  const { products, loading, error } = useProducts();
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
      {/* Label + Title + Navigation arrows */}
      <div className="flex flex-row justify-between items-center gap-6 mb-6">
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <span 
              className="rounded h-6 w-4 mr-2"
              style={{ backgroundColor: colorPattern.secondary }}
            ></span>
            <span 
              className="font-bold text-lg"
              style={{ color: colorPattern.secondary }}
            >
              Our Products
            </span>
          </div>
          <h2 
            className="font-bold text-3xl mt-2"
            style={{ color: colorPattern.text }}
          >
            Explore Our Products
          </h2>
        </div>
        <div className="flex justify-end gap-3 mb-8">
          {/* ...navigation arrows... */}
        </div>
      </div>
      {/* Product cards grid (reuse ProductList) */}
      {loading ? (
        <div>Loading products...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Failed to load products.</div>
      ) : (
        <ProductList products={products} onAddToCart={handleAddToCart} showAddToCart />
      )}
      {/* View All Products button */}
      <div className="flex justify-center">
        <Link
          to="/products"
          className="px-8 py-3 rounded font-bold shadow transition-all duration-200 text-lg"
          style={{
            backgroundColor: colorPattern.secondary,
            color: colorPattern.textWhite,
            display: 'inline-block',
            textAlign: 'center',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.target.style.backgroundColor = colorPattern.secondaryDark}
          onMouseLeave={e => e.target.style.backgroundColor = colorPattern.secondary}
        >
          View All Products
        </Link>
      </div>
    </section>
  );
};

export default ProductExplorer;