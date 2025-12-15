import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Star, MapPin } from 'lucide-react';

/**
 * FeaturedShops - Hiển thị shop nổi bật
 */
const FeaturedShops = ({ shops = [], title = "🏪 Shop Nổi Bật" }) => {
  const navigate = useNavigate();

  if (!shops || shops.length === 0) {
    return null;
  }

  const handleShopClick = (shopId) => {
    navigate(`/shop/${shopId}`);
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">Các shop uy tín, chất lượng được khách hàng tin tưởng</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => handleShopClick(shop.id)}
            className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden group"
          >
            {/* Shop Banner */}
            <div className="relative h-32 bg-gradient-to-r from-primary-100 to-primary-200 overflow-hidden">
              {shop.bannerUrl ? (
                <img
                  src={shop.bannerUrl}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Store className="w-16 h-16 text-primary-300" />
                </div>
              )}
              {/* Logo Overlay */}
              <div className="absolute -bottom-8 left-4">
                <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
                  {shop.logoUrl ? (
                    <img
                      src={shop.logoUrl}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100">
                      <Store className="w-8 h-8 text-primary-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="p-4 pt-10">
              <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
                {shop.name}
              </h3>

              {shop.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {shop.description}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">
                    {shop.rating ? Number(shop.rating).toFixed(1) : '5.0'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  ({shop.reviewCount || 0} đánh giá)
                </span>
              </div>

              {/* Location */}
              {(shop.districtName || shop.provinceName) && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="line-clamp-1">
                    {shop.districtName && shop.provinceName
                      ? `${shop.districtName}, ${shop.provinceName}`
                      : shop.provinceName || shop.districtName}
                  </span>
                </div>
              )}

              {/* Shop Stats */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary-600">
                    {shop.productCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Sản phẩm</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {shop.orderCount || 0}
                  </div>
                  <div className="text-xs text-gray-500">Đơn hàng</div>
                </div>
              </div>

              {/* Visit Shop Button */}
              <button className="w-full mt-4 py-2 bg-primary-50 text-primary-600 font-semibold rounded-lg hover:bg-primary-100 transition-colors">
                Xem cửa hàng
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {shops.length >= 6 && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/shops')}
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 mx-auto"
          >
            Khám phá thêm shop
            <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default FeaturedShops;
