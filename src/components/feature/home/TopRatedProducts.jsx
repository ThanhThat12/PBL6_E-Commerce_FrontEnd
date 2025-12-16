import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';

/**
 * TopRatedProducts - Hiển thị sản phẩm đánh giá cao
 */
const TopRatedProducts = ({ products = [], title = "⭐ Sản Phẩm Đánh Giá Cao" }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const formatPrice = (price) => {
    return Number(price).toLocaleString('vi-VN') + '₫';
  };

  const calculateDiscount = (originalPrice, salePrice) => {
    if (!originalPrice || !salePrice || originalPrice <= salePrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">Được khách hàng đánh giá cao và yêu thích nhất</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => {
          const discount = calculateDiscount(product.originalPrice, product.price || product.basePrice);
          
          return (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image || product.mainImage || '/placeholder-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
                
                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{discount}%
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-900">
                    {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Add to wishlist
                  }}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3">
                {/* Product Name */}
                <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>

                {/* Brand/Shop */}
                {product.brand && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {product.brand}
                  </p>
                )}

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    ({product.reviewCount || 0})
                  </span>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <div className="text-primary-600 font-bold text-lg">
                    {formatPrice(product.price || product.basePrice)}
                  </div>
                  {discount > 0 && product.originalPrice && (
                    <div className="text-gray-400 text-xs line-through">
                      {formatPrice(product.originalPrice)}
                    </div>
                  )}
                </div>

                {/* Stock Status */}
                {product.inStock === false && (
                  <div className="mt-2 text-xs text-red-600 font-semibold">
                    Hết hàng
                  </div>
                )}

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Add to cart
                  }}
                  disabled={product.inStock === false}
                  className={`w-full mt-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                    product.inStock === false
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{product.inStock === false ? 'Hết hàng' : 'Thêm vào giỏ'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Link */}
      {products.length >= 5 && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/products?sort=rating')}
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 mx-auto"
          >
            Xem tất cả sản phẩm đánh giá cao
            <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default TopRatedProducts;
