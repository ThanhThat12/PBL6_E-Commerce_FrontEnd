import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiPackage, FiMapPin, FiShield, FiEye, FiMessageCircle } from 'react-icons/fi';
import Button from '../common/Button';
import { handleImageError, DEFAULT_SHOP_LOGO } from '../../utils/placeholderImage';

/**
 * ShopInfo Component - Display shop information with owner-specific actions
 * Handles shop logo, ratings, stats, and conditional chat button
 */
const ShopInfo = ({ shopInfo, isShopOwner, canChat, onChatWithShop, isAuthenticated }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between flex-wrap gap-6">
        {/* Shop Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg flex-shrink-0">
            {shopInfo.logo ? (
              <img 
                src={shopInfo.logo || DEFAULT_SHOP_LOGO} 
                alt={shopInfo.name} 
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, DEFAULT_SHOP_LOGO)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {shopInfo.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{shopInfo.name}</h2>
              {shopInfo.isVerified && (
                <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full">
                  <FiShield className="w-3 h-3" />
                  <span className="text-xs font-medium">Official</span>
                </div>
              )}
              {shopInfo.isOnline && (
                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Online</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {shopInfo.rating > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium text-gray-900">{shopInfo.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                </>
              )}
              {shopInfo.productCount > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <FiPackage className="w-4 h-4" />
                    <span>{shopInfo.productCount} Sản phẩm</span>
                  </div>
                  <span className="text-gray-300">|</span>
                </>
              )}
              {shopInfo.location && (
                <div className="flex items-center gap-1">
                  <FiMapPin className="w-4 h-4" />
                  <span>{shopInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Shop Actions */}
        <div className="flex items-center gap-3">
          {/* Conditional render: Hide Chat button completely for shop owner */}
          {!isShopOwner && (
            <Button 
              variant="outline" 
              className="border-primary-500 text-primary-600 hover:bg-primary-50"
              onClick={onChatWithShop}
              disabled={!canChat}
              title={!isAuthenticated ? 'Vui lòng đăng nhập để chat' : 'Chat với shop'}
            >
              <FiMessageCircle className="w-4 h-4 mr-2" />
              {!isAuthenticated ? 'Đăng nhập để chat' : 'Chat Ngay'}
            </Button>
          )}
          {/* Optional: Show indicator for own product */}
          {isShopOwner && (
            <div className="text-sm text-gray-500 italic">
              Đây là shop của bạn
            </div>
          )}
          {shopInfo.id && (
            <Link to={`/shops/${shopInfo.id}`}>
              <Button variant="primary">
                <FiEye className="w-4 h-4 mr-2" />
                Xem Shop
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopInfo;