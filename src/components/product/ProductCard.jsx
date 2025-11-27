import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiPackage, FiStar } from 'react-icons/fi';
import { getProductImage } from '../../utils/placeholderImage';

/**
 * ProductCard Component
 * Modern product card with improved design
 * 
 * @param {Object} product - Product data
 * @param {Function} onAddToCart - Add to cart handler
 * @param {Function} onWishlist - Add to wishlist handler
 */
const ProductCard = ({ product, onAddToCart, onWishlist }) => {
  // Calculate price range from variants
  const prices = product.variants?.map(v => v.price) || [product.basePrice];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const hasVariants = product.variants && product.variants.length > 1;
  const hasPriceRange = minPrice !== maxPrice;

  // Calculate total stock
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || product.stock || 0;

  // Find cheapest variant for "Add to Cart"
  const cheapestVariant = product.variants?.reduce((min, v) =>
    v.price < min.price ? v : min
    , product.variants[0]) || {};

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
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 no-underline flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.target.onerror = null;
          }}
        />

        {/* Overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {!product.isActive && (
            <span className="bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Inactive
            </span>
          )}
          {totalStock === 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Sold Out
            </span>
          )}
          {hasVariants && (
            <span className="bg-blue-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <FiPackage className="w-3 h-3" />
              {product.variants.length} Options
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={handleWishlist}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Add to wishlist"
          >
            <FiHeart className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Add to Cart - Only show if in stock */}
        {totalStock > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-xl"
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category & Shop */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            {product.category?.name || product.categoryName || 'Uncategorized'}
          </span>
          {product.shopName && (
            <span className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
              {product.shopName}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Rating */}
        {(product.averageRating || product.totalReviews) && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(product.averageRating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                    }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {product.averageRating ? product.averageRating.toFixed(1) : '0.0'}
            </span>
            {product.totalReviews > 0 && (
              <span className="text-xs text-gray-400">
                ({product.totalReviews})
              </span>
            )}
          </div>
        )}

        {/* Spacer to push price and stock to bottom */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mb-3">
          {hasPriceRange ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-primary-600">
                {minPrice.toLocaleString('vi-VN')}₫
              </span>
              <span className="text-sm text-gray-400 font-medium">-</span>
              <span className="text-xl font-bold text-primary-600">
                {maxPrice.toLocaleString('vi-VN')}₫
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-primary-600">
              {minPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Stock & Variants Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span className={`text-xs font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {totalStock > 0 ? `${totalStock} in stock` : 'Out of stock'}
            </span>
          </div>

          {hasVariants && (
            <span className="text-xs text-gray-500 font-medium">
              {product.variants.length} variants
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
