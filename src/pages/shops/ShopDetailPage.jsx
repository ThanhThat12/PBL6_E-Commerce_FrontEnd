import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiStar, FiMapPin, FiArrowLeft, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import useCart from '../../hooks/useCart';

// Default images from environment
const DEFAULT_LOGO = process.env.REACT_APP_DEFAULT_LOGO || 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764911991/xwz5cpybxo1g1_sppbqi.png';
const DEFAULT_BANNER = process.env.REACT_APP_DEFAULT_BANNER || 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764912579/images_qs3s47.jpg';

/**
 * ShopDetailPage - Display shop profile and products for buyers
 * Uses enhanced ShopDTO with rating, contact info, and full address
 */
const ShopDetailPage = () => {
  const { shopId } = useParams();
  const { addToCart: addItemToCart } = useCart();
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const pageSize = 12;

  // Load shop details
  useEffect(() => {
    const loadShop = async () => {
      setLoading(true);
      try {
        // Get shop by ID (we'll need to add this endpoint)
        const response = await api.get(`shops/${shopId}`);
        if (response && response.data) {
          setShop(response.data);
        }
      } catch (error) {
        console.error('Failed to load shop:', error);
        toast.error('Không thể tải thông tin shop');
      } finally {
        setLoading(false);
      }
    };
    
    if (shopId) {
      loadShop();
    }
  }, [shopId]);

  // Load shop products
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await api.get('products/search', {
          params: {
            shopId: shopId,
            page: currentPage,
            size: pageSize,
            isActive: true
          }
        });
        
        if (response && response.data) {
          const pageData = response.data;
          setProducts(pageData.content || []);
          
          if (pageData.page) {
            setTotalPages(pageData.page.totalPages || 1);
            setTotalProducts(pageData.page.totalElements || 0);
          } else if (pageData.totalPages) {
            setTotalPages(pageData.totalPages);
            setTotalProducts(pageData.totalElements || 0);
          }
        }
      } catch (error) {
        console.error('Failed to load shop products:', error);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    
    if (shopId) {
      loadProducts();
    }
  }, [shopId, currentPage]);

  const handleAddToCart = async (product, variant) => {
    try {
      if (!product.isActive) {
        toast.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      const selectedVariant = variant || product.variants?.[0];
      if (!selectedVariant) {
        toast.error('Sản phẩm không có phiên bản khả dụng');
        return;
      }

      if (selectedVariant.stock === 0) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }

      await addItemToCart(selectedVariant.id, 1);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    }
  };

  const handleWishlist = (_product) => {
    toast.info('Tính năng yêu thích đang phát triển!');
  };

  // Build full address string from shop data
  const getFullAddress = () => {
    const parts = [];
    if (shop?.address) parts.push(shop.address);
    if (shop?.wardName) parts.push(shop.wardName);
    if (shop?.districtName) parts.push(shop.districtName);
    if (shop?.provinceName) parts.push(shop.provinceName);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Format rating display
  const formatRating = (rating) => {
    if (!rating || rating === 0) return 'Chưa có đánh giá';
    return rating.toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="Đang tải thông tin shop..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Shop không tồn tại</h2>
          <p className="text-gray-500 mb-6">Shop bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FiArrowLeft />
            Quay lại trang sản phẩm
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Shop Banner */}
      <div 
        className="h-48 md:h-64 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${shop.bannerUrl || DEFAULT_BANNER})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      {/* Shop Info Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Shop Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <img
                src={shop.logoUrl || DEFAULT_LOGO}
                alt={shop.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = DEFAULT_LOGO; }}
              />
            </div>

            {/* Shop Details */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{shop.name}</h1>
                {shop.status === 'ACTIVE' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    ✓ Đang hoạt động
                  </span>
                )}
              </div>
              
              {shop.description && (
                <p className="text-gray-600 mt-2 line-clamp-2">{shop.description}</p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 mt-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{formatRating(shop.rating)}</span>
                  {shop.reviewCount > 0 && (
                    <span className="text-gray-500 text-sm">({shop.reviewCount} đánh giá)</span>
                  )}
                </div>

                {/* Products Count */}
                <div className="flex items-center gap-2 text-gray-600">
                  <FiPackage className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{totalProducts || products.length}+ sản phẩm</span>
                </div>
              </div>

              {/* Contact & Location */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                {getFullAddress() && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{getFullAddress()}</span>
                  </div>
                )}
                
                {shop.shopPhone && (
                  <a href={`tel:${shop.shopPhone}`} className="flex items-center gap-1 hover:text-primary-600">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span>{shop.shopPhone}</span>
                  </a>
                )}
                
                {shop.shopEmail && (
                  <a href={`mailto:${shop.shopEmail}`} className="flex items-center gap-1 hover:text-primary-600">
                    <FiMail className="w-4 h-4 text-gray-400" />
                    <span>{shop.shopEmail}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Chat Button */}
            <div className="flex-shrink-0">
              <button 
                onClick={() => toast.info('Tính năng chat đang phát triển!')}
                className="flex items-center gap-2 px-5 py-2.5 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <FiMessageCircle className="w-5 h-5" />
                Chat ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
            Sản phẩm của shop
          </h2>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loading size="lg" text="Đang tải sản phẩm..." />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm</h3>
            <p className="text-gray-500">Shop này chưa có sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onWishlist={handleWishlist}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ShopDetailPage;
