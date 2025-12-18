import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiMinus, FiPlus, FiChevronRight, FiStar, FiPackage, FiMapPin, FiMessageCircle } from 'react-icons/fi';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import VariantSelector from '../../components/product/VariantSelector';
import { ReviewSection } from '../../components/review';
import { getProductById, getProductImages } from '../../services/productService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { getProductImage } from '../../utils/placeholderImage';
import chatService from '../../services/chatService';

/**
 * ProductDetailPage - Shopee Style
 * Enhanced product details with shop information and reviews
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addItemToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productImages, setProductImages] = useState(null);
  const [imageGallery, setImageGallery] = useState([]);
  const [adding, setAdding] = useState(false);
  const { user, isAuthenticated, hasRole } = useAuth();

  // Handle chat with shop
  const handleChatWithShop = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với shop');
      navigate('/login');
      return;
    }

    const shopId = product.shop?.id || product.shopId;
    
    if (!shopId) {
      toast.error('Không tìm thấy thông tin shop');
      return;
    }

    // Check if user is the shop owner (prevent self-chat)
    if (isProductOwner()) {
      toast.error('Bạn không thể chat với shop của chính mình');
      return;
    }

    try {
      // Create or get conversation with shop
      // chatService.createConversation already returns response.data
      // Structure: { status, message, data: { id, type, ... } }
      const apiResponse = await chatService.createConversation({
        type: 'SHOP',
        shopId: shopId,
      });

      // Extract conversation from apiResponse.data
      const conversationData = apiResponse.data;
      
      if (conversationData && conversationData.id) {
        console.log('[ProductDetailPage_New] Opening chat with conversation:', conversationData.id);
        toast.success('Đã mở chat với shop');
        
        // Dispatch event to open chat window
        const event = new CustomEvent('openChat', { 
          detail: { conversationId: conversationData.id } 
        });
        console.log('[ProductDetailPage_New] Dispatching openChat event:', event.detail);
        window.dispatchEvent(event);
        console.log('[ProductDetailPage_New] Event dispatched successfully');
      } else {
        console.error('Invalid conversation response:', apiResponse);
        toast.error('Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      // Check for specific backend error about self-chat
      const errorMessage = error.response?.data?.message || '';
      if (errorMessage.includes('shop của chính mình') || errorMessage.includes('own shop')) {
        toast.error('Bạn không thể chat với shop của chính mình');
      } else {
        toast.error(errorMessage || 'Không thể mở chat với shop');
      }
    }
  };

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        
        if (response && response.data) {
          const productData = response.data;
          setProduct(productData);
          
          // Setup initial image
          const mainImageUrl = getProductImage(productData);
          setSelectedImage(mainImageUrl);
          
          // Setup initial gallery with main image and additional images
          const initialGallery = [mainImageUrl];
          if (productData.images && productData.images.length > 0) {
            productData.images.forEach(img => {
              if (img.imageUrl && img.imageUrl !== mainImageUrl) {
                initialGallery.push(img.imageUrl);
              }
            });
          }
          setImageGallery(initialGallery);
          
          // Auto-select first available variant
          if (productData.variants && productData.variants.length > 0) {
            const firstAvailable = productData.variants.find(v => v.stock > 0) || productData.variants[0];
            setSelectedVariant(firstAvailable);
          }

          // Load product images
          try {
            const imagesResponse = await getProductImages(id);
            if (imagesResponse && imagesResponse.data) {
              setProductImages(imagesResponse.data);
            }
          } catch {
            // Non-critical error, continue with product data
          }
        }
      } catch (error) {
        if (error.message === 'PRODUCT_NOT_FOUND' || error.response?.status === 404) {
          toast.error('Sản phẩm không tồn tại hoặc đã bị xóa');
          navigate('/products', { 
            replace: true,
            state: { message: 'Sản phẩm không tồn tại' }
          });
        } else {
          toast.error('Không thể tải thông tin sản phẩm');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Update image and gallery when variant changes
  useEffect(() => {
    if (!selectedVariant || !product) {
      return;
    }

    let newSelectedImage = null;
    let newGallery = [];

    // Check if product has primary attribute for variant images
    if (productImages && productImages.primaryAttribute) {
      // Extract primary attribute value from selected variant
      const primaryAttrValue = selectedVariant.variantValues?.find(
        vv => vv.productAttribute?.id === productImages.primaryAttribute.id
      )?.value;

      // Look up variant image
      if (primaryAttrValue && productImages.variantImages && productImages.variantImages[primaryAttrValue]) {
        const variantImage = productImages.variantImages[primaryAttrValue];
        newSelectedImage = variantImage.imageUrl;
        
        // Build gallery with variant image first
        newGallery = [variantImage.imageUrl];
        
        // Add main image if different
        const mainImg = productImages.mainImage || product.mainImage;
        if (mainImg && mainImg !== variantImage.imageUrl) {
          newGallery.push(mainImg);
        }
        
        // Add other product images
        if (product.images && product.images.length > 0) {
          product.images.forEach(img => {
            if (img.imageUrl && img.imageUrl !== variantImage.imageUrl && img.imageUrl !== mainImg) {
              newGallery.push(img.imageUrl);
            }
          });
        }
        
        setSelectedImage(newSelectedImage);
        setImageGallery(newGallery);
        return;
      }
    }

    // Fallback to main image and rebuild gallery
    const fallbackImage = productImages?.mainImage || product.mainImage || '/placeholder-product.jpg';
    setSelectedImage(fallbackImage);
    
    const fallbackGallery = [fallbackImage];
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img.imageUrl && img.imageUrl !== fallbackImage) {
          fallbackGallery.push(img.imageUrl);
        }
      });
    }
    setImageGallery(fallbackGallery);
  }, [selectedVariant, productImages, product]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      const maxStock = selectedVariant?.stock || 100;
      const maxAllowed = Math.min(maxStock, 100); // Max 100 per order
      return Math.max(1, Math.min(newQty, maxAllowed));
    });
  };

  const handleAddToCart = async () => {
    if (isProductOwner()) {
      toast.error('Bạn không thể mua sản phẩm của chính shop bạn');
      return;
    }

    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm');
      return;
    }

    if (!product.isActive) {
      toast.error('Sản phẩm hiện không khả dụng');
      return;
    }

    if (selectedVariant.stock < quantity) {
      toast.error('Số lượng vượt quá hàng có sẵn');
      return;
    }

    setAdding(true);
    try {
      await addItemToCart(selectedVariant.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy sản phẩm');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Số lượng không hợp lệ');
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAdding(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
            <Button onClick={() => navigate('/products')} variant="primary">
              Quay lại danh sách sản phẩm
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isProductOwner = () => {
    if (!user || !product || !hasRole) return false;
    // Must be seller role
    if (!hasRole('SELLER')) return false;

    const uid = user.id || user.userId || user._id || user.userId || user.uid;
    const shop = product.shop || {};

    // Collect many possible owner/shop fields used by different backends
    const ownerIds = [
      shop.ownerId,
      shop.owner?.id,
      shop.userId,
      shop.user?.id,
      shop.sellerId,
      shop.seller?.id,
      shop.id,
      product.sellerId,
      product.seller?.id,
      product.shopId,
    ].filter(Boolean);

    // Also check if user has a shopId that matches
    const userShopId = user.shopId || user.shop?.id || null;

    const match = ownerIds.some(i => String(i) === String(uid)) || (userShopId && String(userShopId) === String(shop.id || product.shopId || product.shop?.id));

    // Debug logging to help identify why seller cannot reply
    if (process.env.NODE_ENV !== 'production') {
      console.log('[isProductOwner] uid:', uid, 'userShopId:', userShopId, 'shop:', shop, 'ownerIds:', ownerIds, 'match:', match);
    }

    return !!match;
  };

  const displayPrice = selectedVariant?.price || product.basePrice || 0;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 100) : 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-primary-600">Trang chủ</Link>
              <FiChevronRight className="w-4 h-4 text-gray-400" />
              <Link to="/products" className="text-gray-500 hover:text-primary-600">Sản phẩm</Link>
              <FiChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 truncate">{product.name}</span>
            </nav>
          </div>
        </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <img
                src={selectedImage || product.mainImage || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images - Show variant-aware gallery */}
            {imageGallery && imageGallery.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {imageGallery.map((imgUrl, index) => (
                  <button
                    key={`gallery-${index}-${imgUrl}`}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === imgUrl
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - Ảnh ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Shop Info Card */}
            {(product.shop || product.shopName) && (
              <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  {/* Shop Logo */}
                  <Link 
                    to={`/shops/${product.shop?.id || product.shopId}`}
                    className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 no-underline"
                  >
                    <img
                      src={product.shop?.logoUrl || product.shopLogo || '/default-shop.png'}
                      alt={product.shop?.name || product.shopName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-shop.png';
                      }}
                    />
                  </Link>
                  
                  {/* Shop Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/shops/${product.shop?.id || product.shopId}`}
                      className="no-underline"
                    >
                      <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors truncate">
                        {product.shop?.name || product.shopName}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                      {(product.shop?.rating || product.shopRating) && (
                        <span className="flex items-center gap-1">
                          <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                          {(product.shop?.rating || product.shopRating).toFixed(1)}
                        </span>
                      )}
                      {(product.shop?.productCount || product.shopProductCount) && (
                        <span className="flex items-center gap-1">
                          <FiPackage className="w-4 h-4" />
                          {product.shop?.productCount || product.shopProductCount} sản phẩm
                        </span>
                      )}
                      {(product.shop?.location || product.shopLocation) && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-4 h-4" />
                          {product.shop?.location || product.shopLocation}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {/* Chat Button - Hidden for shop owner */}
                    {!isProductOwner() && (
                      <button
                        onClick={handleChatWithShop}
                        disabled={!isAuthenticated}
                        title={!isAuthenticated ? 'Vui lòng đăng nhập' : 'Chat với shop'}
                        className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiMessageCircle className="w-4 h-4" />
                        Chat Ngay
                      </button>
                    )}
                    
                    {/* View Shop Link */}
                    <Link 
                      to={`/shops/${product.shop?.id || product.shopId}`}
                      className="inline-flex items-center justify-center gap-1 px-4 py-2 bg-white text-primary-600 rounded-lg text-sm font-medium border border-primary-200 hover:bg-primary-50 transition-colors no-underline"
                    >
                      <FiChevronRight className="w-4 h-4" />
                      Xem Shop
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Category */}
            {product.category && (
              <p className="text-sm text-primary-600 font-semibold uppercase tracking-wide mb-2">
                {product.category.name}
              </p>
            )}

            {/* Product Name */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary-600">
                  {displayPrice.toLocaleString('vi-VN')}₫
                </span>
                {product.basePrice && selectedVariant && selectedVariant.price !== product.basePrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.basePrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {!product.isActive ? (
                <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Sản phẩm không khả dụng
                </p>
              ) : (
                <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isInStock 
                    ? selectedVariant && selectedVariant.stock < 10
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isInStock 
                    ? selectedVariant.stock < 10
                      ? `Chỉ còn ${selectedVariant.stock} sản phẩm`
                      : `Còn hàng (${selectedVariant.stock} sản phẩm)`
                    : 'Hết hàng'
                  }
                </p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Mô tả sản phẩm
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8 pb-8 border-b">
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Số lượng
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={!selectedVariant || quantity >= maxQuantity}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
                {selectedVariant && selectedVariant.stock < 10 && (
                  <p className="text-sm text-orange-600">
                    Chỉ còn {selectedVariant.stock} sản phẩm
                  </p>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.isActive || !isInStock || adding || isProductOwner()}
                loading={adding}
                variant="primary"
                className="flex-1 py-4"
                title={isProductOwner() ? 'Không thể mua sản phẩm của chính shop bạn' : ''}
              >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
            </div>

            {/* Product Details */}
            {selectedVariant && (
              <div className="mt-8 pt-8 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin chi tiết
                </h4>
                <dl className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <dt className="text-gray-600">SKU:</dt>
                    <dd className="font-mono font-semibold text-gray-900">{selectedVariant.sku}</dd>
                  </div>
                  {product.category && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">Danh mục:</dt>
                      <dd className="font-semibold text-gray-900">{product.category.name}</dd>
                    </div>
                  )}
                  {(product.shop?.name || product.shopName) && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <dt className="text-gray-600">Shop:</dt>
                      <dd>
                        <Link 
                          to={`/shops/${product.shop?.id || product.shopId}`}
                          className="font-semibold text-primary-600 hover:text-primary-700 no-underline"
                        >
                          {product.shop?.name || product.shopName}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {selectedVariant.variantValues && selectedVariant.variantValues.length > 0 && (
                    selectedVariant.variantValues.map((vv, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="text-gray-600">{vv.productAttribute?.name || 'Thuộc tính'}:</dt>
                        <dd className="font-semibold text-gray-900">{vv.value}</dd>
                      </div>
                    ))
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Reviews Section - Using new ReviewSection component */}
      <ReviewSection 
        productId={id}
        product={product}
        isAuthenticated={isAuthenticated}
        user={user}
        hasRole={hasRole}
        isProductOwner={isProductOwner}
      />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetailPage;