import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';

/**
 * ProductCard Component
 * Reusable product card for grid display
 * 
 * @param {Object} product - Product data
 * @param {Function} onAddToCart - Add to cart handler
 * @param {Function} onWishlist - Add to wishlist handler
 */
const ProductCard = ({ product, onAddToCart, onWishlist }) => {
  // Find cheapest variant for display
  const cheapestVariant = product.variants?.reduce((min, v) => 
    v.price < min.price ? v : min
  , product.variants[0]) || {};

  const displayPrice = cheapestVariant.price || product.basePrice || 0;
  const hasVariants = product.variants && product.variants.length > 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, cheapestVariant);
    }
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlist) {
      onWishlist(product);
    }
  };

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden no-underline"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.mainImage || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {!product.isActive && (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
              Inactive
            </span>
          )}
          {hasVariants && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
              {product.variants.length} Options
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleWishlist}
            className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
            aria-label="Add to wishlist"
          >
            <FiHeart className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add to Cart */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleAddToCart}
            className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="w-5 h-5" />
            <span className="font-medium">Add to Cart</span>
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {product.category?.name || 'Uncategorized'}
        </p>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-primary-600">
            {displayPrice.toLocaleString('vi-VN')}₫
          </span>
          {hasVariants && (
            <span className="text-sm text-gray-500">+</span>
          )}
        </div>

        {/* Stock Info */}
        {cheapestVariant.stock !== undefined && (
          <p className={`text-xs mt-2 ${
            cheapestVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {cheapestVariant.stock > 0 
              ? `In stock (${cheapestVariant.stock})` 
              : 'Out of stock'
            }
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
