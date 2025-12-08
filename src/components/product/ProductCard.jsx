import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiStar, FiMapPin } from 'react-icons/fi';
import { getProductImage } from '../../utils/placeholderImage';

/**
 * ProductCard Component
 * Modern product card with improved design
 * Shows: base price, shop province, sold count, average rating
 * 
 * @param {Object} product - Product data
 * @param {Function} onWishlist - Add to wishlist handler
 */
const ProductCard = ({ product, onWishlist }) => {
  // Get base price
  const basePrice = product.basePrice || product.price || 0;
  
  // Get rating info
  const averageRating = product.rating || product.averageRating || 0;
  const reviewCount = product.reviewCount || product.totalReviews || 0;
  const soldCount = product.soldCount || 0;
  
  // Shop info
  const shopProvince = product.shopProvince || '';

  // Calculate total stock from variants
  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || product.stock || 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlist) {
      onWishlist(product);
    }
  };

  // Format sold count for display (e.g., 1.2k)
  const formatSoldCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
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
              Ngừng bán
            </span>
          )}
          {totalStock === 0 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              Hết hàng
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
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">
            {product.category?.name || product.categoryName || 'Uncategorized'}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-primary-600 transition-colors leading-tight">
          {product.name}
        </h3>

        {/* Rating & Sold */}
        <div className="flex items-center gap-3 mb-2">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <FiStar className={`w-4 h-4 ${averageRating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            <span className="text-sm font-semibold text-gray-700">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
          
          {/* Separator */}
          <span className="text-gray-300">|</span>
          
          {/* Sold Count */}
          <span className="text-sm text-gray-500">
            Đã bán {formatSoldCount(soldCount)}
          </span>
        </div>

        {/* Shop Location */}
        {shopProvince && (
          <div className="flex items-center gap-1 mb-3 text-gray-500">
            <FiMapPin className="w-3.5 h-3.5" />
            <span className="text-xs truncate">{shopProvince}</span>
          </div>
        )}

        {/* Spacer to push price to bottom */}
        <div className="flex-1" />

        {/* Price - Base Price only */}
        <div className="mb-3">
          <span className="text-xl font-bold text-red-500">
            ₫{basePrice.toLocaleString('vi-VN')}
          </span>
        </div>

        {/* Stock Info */}
        <div className="flex items-center pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${totalStock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-xs font-medium ${totalStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalStock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
