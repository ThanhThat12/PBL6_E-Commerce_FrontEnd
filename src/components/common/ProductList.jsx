import React from "react";
import colorPattern from "../../styles/colorPattern";
import "./ProductList.css";

// Star SVG
const StarIcon = () => (
  <svg 
    className="w-4 h-4 inline-block mr-1" 
    fill={colorPattern.gold} 
    viewBox="0 0 20 20"
  >
    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/>
  </svg>
);

// Heart SVG
const HeartIcon = ({ filled }) => (
  <svg 
    className="w-5 h-5 transition" 
    fill={filled ? colorPattern.error : colorPattern.textMuted} 
    viewBox="0 0 20 20"
  >
    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
  </svg>
);

// Eye SVG
const EyeIcon = () => (
  <svg 
    className="w-5 h-5 transition" 
    fill="none" 
    stroke={colorPattern.textLight} 
    strokeWidth="2" 
    viewBox="0 0 24 24"
    style={{
      color: colorPattern.textLight,
    }}
    onMouseEnter={(e) => {
      e.target.style.color = colorPattern.text;
    }}
    onMouseLeave={(e) => {
      e.target.style.color = colorPattern.textLight;
    }}
  >
    <circle cx="12" cy="12" r="3" stroke="currentColor"/>
    <path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0z" stroke="currentColor"/>
  </svg>
);

const ProductList = ({
  products = [],
  onAddToCart,
  onRemove,
  showRemove = false,
  showAddToCart = false,
  wishlistMode = false,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
    {products.map((product) => (
      <div 
        key={product.id} 
        className="relative rounded-lg shadow p-4 flex flex-col items-center transition-shadow hover:shadow-lg"
        style={{
          backgroundColor: colorPattern.background,
          boxShadow: `0 2px 8px ${colorPattern.shadow}`,
        }}
      >
        {/* Image + overlay */}
        <div className="relative w-full h-48 mb-3 overflow-hidden rounded">
          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />

          {/* Discount badge */}
          {product.discount && (
            <span 
              className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded z-20"
              style={{
                backgroundColor: colorPattern.discount,
                color: colorPattern.textWhite,
              }}
            >
              -{product.discount}%
            </span>
          )}

          {/* Wishlist mode: Remove icon */}
          {wishlistMode && showRemove && (
            <button
              type="button"
              className="absolute top-2 right-2 rounded-full p-1 shadow hover:shadow-md z-20 transition-all"
              style={{
                backgroundColor: colorPattern.background,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colorPattern.hover;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colorPattern.background;
              }}
              onClick={() => onRemove && onRemove(product)}
              title="Remove from wishlist"
            >
              <svg 
                width="20" 
                height="20" 
                fill="none" 
                stroke={colorPattern.error} 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {/* Heart & Eye icons (not in wishlist mode) */}
          {!wishlistMode && (
            <div className="absolute top-2 right-2 flex gap-2 z-20">
              <button type="button" className="focus:outline-none">
                <HeartIcon filled={product.isFavorite} />
              </button>
              <button type="button" className="focus:outline-none">
                <EyeIcon />
              </button>
            </div>
          )}

          {/* Add To Cart button */}
          <button
            className="add-to-cart-btn font-semibold transition-all"
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
            onClick={() => onAddToCart && onAddToCart(product)}
          >
            Add To Cart
          </button>
        </div>

        {/* Name */}
        <div 
          className="font-semibold text-center mb-2"
          style={{ color: colorPattern.text }}
        >
          {product.name}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="font-bold text-lg"
            style={{ color: colorPattern.price }}
          >
            ${product.price}
          </span>
          {product.originalPrice && (
            <span 
              className="line-through text-sm"
              style={{ color: colorPattern.originalPrice }}
            >
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <StarIcon />
          <span 
            className="font-semibold text-sm"
            style={{ color: colorPattern.text }}
          >
            {product.rating}
          </span>
          <span 
            className="text-xs ml-1"
            style={{ color: colorPattern.textLight }}
          >
            ({product.reviews})
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default ProductList;