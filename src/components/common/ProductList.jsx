import React from "react";
import "./ProductList.css";

// Star SVG
const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-400 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/>
  </svg>
);

// Heart SVG
const HeartIcon = ({ filled }) => (
  <svg className={`w-5 h-5 ${filled ? "text-red-500" : "text-gray-300"} transition`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
  </svg>
);

// Eye SVG
const EyeIcon = () => (
  <svg className="w-5 h-5 text-gray-400 hover:text-black transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" stroke="currentColor"/>
    <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0z" stroke="currentColor"/>
  </svg>
);

const ProductList = ({ products }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {products.map((product) => (
      <div key={product.id} className="relative bg-gray-50 rounded-lg shadow p-4 flex flex-col items-center">

        {/* Image + overlay */}
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />

          {/* Discount badge */}
          {product.discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-20">
              -{product.discount}%
            </span>
          )}

          {/* Heart & Eye icons */}
          <div className="absolute top-2 right-2 flex gap-2 z-20">
            <button type="button" className="focus:outline-none">
              <HeartIcon filled={product.isFavorite} />
            </button>
            <button type="button" className="focus:outline-none">
              <EyeIcon />
            </button>
          </div>

          {/* Add To Cart button - luôn hiển thị */}
          <button className="add-to-cart-btn">Add To Cart</button>
        </div>

        {/* Name */}
        <div className="font-semibold text-center mb-2">{product.name}</div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600 font-bold text-lg">${product.price}</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm">${product.originalPrice}</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <StarIcon />
          <span className="text-black font-semibold text-sm">{product.rating}</span>
          <span className="text-gray-500 text-xs ml-1">({product.reviews})</span>
        </div>

      </div>
    ))}
  </div>
);

export default ProductList;