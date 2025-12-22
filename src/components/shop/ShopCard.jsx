import React from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { DEFAULT_SHOP_LOGO, handleImageError } from '../../utils/placeholderImage';

/**
 * ShopCard Component - Display shop info in search results
 * 
 * @param {Object} shop - Shop data
 * @param {string} shop.id - Shop ID
 * @param {string} shop.name - Shop name
 * @param {string} shop.highlightedName - Name with highlighted match
 * @param {string} shop.logoUrl - Shop logo URL
 * @param {number} shop.productCount - Number of products in shop
 * @param {string} shop.status - Shop status (ACTIVE, PENDING, etc.)
 */
const ShopCard = ({ shop }) => {
  const {
    id,
    name,
    highlightedName,
    logoUrl,
    productCount = 0,
    status
  } = shop;

  return (
    <Link
      to={`/shops/${id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
    >
      <div className="p-4 flex items-center gap-4">
        {/* Shop Logo */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100 group-hover:border-primary-300 transition-colors">
          <img
            src={logoUrl || DEFAULT_SHOP_LOGO}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, DEFAULT_SHOP_LOGO)}
          />
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          {/* Shop Name */}
          <h3 
            className="font-semibold text-gray-900 text-lg truncate group-hover:text-primary-600 transition-colors"
            dangerouslySetInnerHTML={{ __html: highlightedName || name }}
          />

          {/* Shop Stats */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <FiPackage className="w-4 h-4 text-primary-500" />
              <span>{productCount} sản phẩm</span>
            </div>
            
            {status === 'ACTIVE' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                Đang hoạt động
              </span>
            )}
          </div>
        </div>

        {/* Arrow Icon */}
        <div className="flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;