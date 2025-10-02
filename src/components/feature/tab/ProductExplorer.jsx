import React from "react";
import colorPattern from "../../../styles/colorPattern";
import useProducts from "../../../hooks/useProducts";
import ProductList from "../../common/ProductList";

const ProductExplorer = ({ onViewAll }) => {
  const { products, loading, error } = useProducts();
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
          <button 
            className="border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            style={{
              backgroundColor: colorPattern.backgroundGray,
              color: colorPattern.text,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colorPattern.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colorPattern.backgroundGray;
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            style={{
              backgroundColor: colorPattern.backgroundGray,
              color: colorPattern.text,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colorPattern.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colorPattern.backgroundGray;
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Product cards grid (reuse ProductList) */}
      {loading ? (
        <div>Loading products...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>Failed to load products.</div>
      ) : (
        <ProductList products={products} />
      )}
      {/* View All Products button */}
      <div className="flex justify-center">
        <button
          className="px-8 py-3 rounded font-bold shadow transition-all duration-200 text-lg"
          style={{
            backgroundColor: colorPattern.secondary,
            color: colorPattern.textWhite,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colorPattern.secondaryDark;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colorPattern.secondary;
          }}
          onClick={onViewAll}
        >
          View All Products
        </button>
      </div>
    </section>
  );
};

export default ProductExplorer;