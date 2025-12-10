import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiMinus, FiPlus, FiChevronRight, FiStar, FiPackage, FiMapPin, FiMessageCircle, FiShield, FiUsers, FiEye, FiShare2, FiHeart, FiTruck, FiRotateCcw, FiAward, FiGrid, FiThumbsUp, FiThumbsDown, FiClock } from 'react-icons/fi';

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
  const [activeTab, setActiveTab] = useState('details'); // details, reviews, shipping
  const [currentImagePage, setCurrentImagePage] = useState(0);
  const { user, isAuthenticated, hasRole } = useAuth();

  // Check if current user is product owner - cached with useMemo
  const isProductOwner = useMemo(() => {
    // Early return if data not ready
    if (!user || !product) return false;
    
    // Check SELLER role
    if (!hasRole || !hasRole('SELLER')) return false;

    // Get shop IDs
    const userShopId = user.shopId || user.shop?.id;
    const productShopId = product.shopId || product.shop?.id;
    
    // Both must exist to compare
    if (!userShopId || !productShopId) return false;

    // Compare shop IDs
    return String(userShopId) === String(productShopId);
  }, [user, product, hasRole]);

  // Computed permission flags based on markdown spec
  const canChat = useMemo(() => {
    return !isProductOwner && isAuthenticated;
  }, [isProductOwner, isAuthenticated]);

  const canAddToCart = useMemo(() => {
    if (isProductOwner) return false;
    if (!product) return false;
    if (!selectedVariant) return false;
    return selectedVariant.stock > 0 && product.isActive;
  }, [isProductOwner, product, selectedVariant]);

  // Handle chat with shop
  const handleChatWithShop = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    // Verify authentication
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với shop');
      navigate('/login');
      return;
    }

    // Check ownership - only block if user is owner of THIS shop
    if (isProductOwner) {
      toast.error('Bạn không thể chat với shop của chính mình');
      return;
    }

    const shopId = product.shop?.id || product.shopId;
    
    if (!shopId) {
      toast.error('Không tìm thấy thông tin shop');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.loading('Đang mở chat với shop...');
      
      // Create or get conversation with shop
      const apiResponse = await chatService.createConversation({
        type: 'SHOP',
        shopId: shopId,
      });

      toast.dismiss(loadingToast);

      // apiResponse is ResponseDTO: { status, message, data: conversationObject }
      const conversationData = apiResponse.data;
      
      if (conversationData && conversationData.id) {
        console.log('[ProductDetailPage] ✅ Conversation created:', conversationData);
        
        // Dispatch event to open chat window
        const event = new CustomEvent('openChat', { 
          detail: { conversationId: conversationData.id } 
        });
        console.log('[ProductDetailPage] 📤 Dispatching openChat event');
        window.dispatchEvent(event);
        
        toast.success('Chat đã mở!');
      } else {
        console.error('Invalid conversation response:', apiResponse);
        toast.error('Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      // Check for specific backend error about self-chat
      const errorMessage = error.response?.data?.message || '';
      if (error.response?.status === 403 || errorMessage.includes('shop của chính mình') || errorMessage.includes('own shop')) {
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
    // Frontend validation before API call
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    if (isProductOwner) {
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
      const result = await addItemToCart(selectedVariant.id, quantity);
      // Check if result indicates success
      if (result && result.success === false) {
        toast.error(result.error || 'Không thể thêm vào giỏ hàng');
      } else {
        toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      // Handle backend rejection (403 Forbidden = own product)
      if (error.response?.status === 403) {
        toast.error('Bạn không thể mua sản phẩm của chính shop bạn');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy sản phẩm');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Số lượng không hợp lệ');
      } else {
        toast.error(error.message || 'Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    // Validation for authentication only
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Block own product purchase
    if (isProductOwner) {
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

    // Add to cart first, then navigate to cart page for user to select and checkout
    setAdding(true);
    try {
      const result = await addItemToCart(selectedVariant.id, quantity);
      if (result && result.success === false) {
        toast.error(result.error || 'Không thể thêm vào giỏ hàng');
      } else {
        // Navigate to cart page for user to select items and checkout
        navigate('/cart');
      }
    } catch (error) {
      console.error('Buy now error:', error);
      if (error.response?.status === 403) {
        toast.error('Bạn không thể mua sản phẩm của chính shop bạn');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy sản phẩm');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Số lượng không hợp lệ');
      } else {
        toast.error(error.message || 'Không thể mua ngay');
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

  const displayPrice = selectedVariant?.price || product.basePrice || 0;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 100) : 100;

  // Helper functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getDiscountPercentage = () => {
    if (!product.originalPrice || !displayPrice || displayPrice >= product.originalPrice) return 0;
    return Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100);
  };

  const renderStars = (rating, size = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} className={`${sizeClass} text-yellow-400 fill-current`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <FiStar className={`${sizeClass} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <FiStar className={`${sizeClass} text-yellow-400 fill-current`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FiStar key={i} className={`${sizeClass} text-gray-300`} />
        );
      }
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Shop info from product data
  const shopInfo = {
    id: product.shop?.id || product.shopId,
    name: product.shop?.name || product.shopName || 'Shop',
    logo: product.shop?.logoUrl || product.shopLogo || '',
    rating: product.shop?.rating || product.shopRating || 0,
    productCount: product.shop?.productCount || product.shopProductCount || 0,
    location: product.shop?.location || product.shopLocation || '',
    isVerified: product.shop?.isVerified ?? false,
    isOnline: product.shop?.isOnline ?? false,
  };

  const discount = getDiscountPercentage();
  const rating = product.averageRating || 0;
  const soldCount = product.soldCount || 0;

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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              <img
                src={selectedImage || product.mainImage || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
              
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-lg font-bold">
                  -{discount}%
                </div>
              )}
              
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all">
                  <FiShare2 className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full transition-all">
                  <FiHeart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                </button>
              </div>
            </div>
            
            {/* Thumbnail Images - Show variant-aware gallery with pagination */}
            {imageGallery && imageGallery.length > 1 && (
              <div className="relative">
                <div className="grid grid-cols-5 gap-2">
                  {imageGallery.slice(currentImagePage * 5, (currentImagePage * 5) + 5).map((imgUrl, index) => (
                    <button
                      key={`gallery-${currentImagePage}-${index}-${imgUrl}`}
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === imgUrl
                          ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} ${currentImagePage * 5 + index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-product.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {imageGallery.length > 5 && (
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setCurrentImagePage(prev => Math.max(0, prev - 1))}
                      disabled={currentImagePage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    
                    <span className="text-sm text-gray-600">
                      {currentImagePage * 5 + 1} - {Math.min((currentImagePage + 1) * 5, imageGallery.length)} / {imageGallery.length}
                    </span>
                    
                    <button
                      onClick={() => setCurrentImagePage(prev => Math.min(Math.ceil(imageGallery.length / 5) - 1, prev + 1))}
                      disabled={currentImagePage >= Math.ceil(imageGallery.length / 5) - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Name and Rating */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {rating > 0 && (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                  </>
                )}
                {soldCount > 0 && (
                  <>
                    <span>Đã bán {soldCount.toLocaleString()}</span>
                    <span>•</span>
                  </>
                )}
                <div className="flex items-center gap-1 text-green-600">
                  <FiEye className="w-3 h-3" />
                  <span>Đang xem</span>
                </div>
              </div>
            </div>

            {/* Price and Promotions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-primary-600">
                  ₫{formatPrice(displayPrice)}
                </span>
                {product.originalPrice && product.originalPrice > displayPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₫{formatPrice(product.originalPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-md text-sm font-bold">
                    -{discount}% GIẢM
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FiTruck className="w-4 h-4 text-green-500" />
                  <span className="text-green-600">Miễn phí vận chuyển</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <FiRotateCcw className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">Đổi trả 15 ngày</span>
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="pb-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chọn phiên bản</h3>
                <VariantSelector
                  variants={product.variants}
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                  >
                    <FiMinus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newQty = parseInt(e.target.value) || 1;
                      const maxStock = selectedVariant?.stock || 100;
                      const maxAllowed = Math.min(maxStock, 100);
                      setQuantity(Math.max(1, Math.min(newQty, maxAllowed)));
                    }}
                    className="w-16 text-center py-2 border-0 focus:ring-0"
                    min="1"
                    max={selectedVariant?.stock || 999}
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={!selectedVariant || quantity >= maxQuantity}
                    className="p-2 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>
                </div>
                
                {selectedVariant && (
                  <span className="text-sm text-gray-500">
                    {selectedVariant.stock} sản phẩm có sẵn
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart || adding}
                  variant="outline"
                  className={`flex-1 ${
                    isProductOwner 
                      ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50' 
                      : 'border-primary-500 text-primary-600 hover:bg-primary-50'
                  }`}
                  title={
                    !isAuthenticated ? 'Vui lòng đăng nhập để mua hàng' :
                    isProductOwner ? 'Bạn không thể mua sản phẩm của chính mình' :
                    !selectedVariant ? 'Vui lòng chọn phiên bản sản phẩm' :
                    selectedVariant?.stock === 0 ? 'Sản phẩm đã hết hàng' :
                    !product.isActive ? 'Sản phẩm không khả dụng' : ''
                  }
                >
                  <FiShoppingCart className="w-5 h-5 mr-2" />
                  {isProductOwner ? 'Sản phẩm của bạn' : adding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={!canAddToCart || adding}
                  variant="primary"
                  className={`flex-1 ${
                    isProductOwner ? 'bg-gray-400 cursor-not-allowed' : ''
                  }`}
                  title={
                    !isAuthenticated ? 'Vui lòng đăng nhập để mua hàng' :
                    isProductOwner ? 'Bạn không thể mua sản phẩm của chính mình' :
                    !selectedVariant ? 'Vui lòng chọn phiên bản sản phẩm' :
                    selectedVariant?.stock === 0 ? 'Sản phẩm đã hết hàng' :
                    !product.isActive ? 'Sản phẩm không khả dụng' : ''
                  }
                >
                  {isProductOwner ? 'Không thể mua' : 'Mua Ngay'}
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiShield className="w-4 h-4 text-green-500" />
                <span>Đảm bảo chính hãng</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTruck className="w-4 h-4 text-blue-500" />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiRotateCcw className="w-4 h-4 text-purple-500" />
                <span>Đổi trả dễ dàng</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiAward className="w-4 h-4 text-yellow-500" />
                <span>Chất lượng đảm bảo</span>
              </div>
            </div>

          </div>
        </div>
        </div>

        {/* Shop Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            {/* Shop Info */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg flex-shrink-0">
                {shopInfo.logo ? (
                  <img src={shopInfo.logo} alt={shopInfo.name} className="w-full h-full object-cover" />
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
              {/* Conditional render: Hide Chat button completely for shop owner (per markdown spec) */}
              {!isProductOwner && (
                <Button 
                  variant="outline" 
                  className="border-primary-500 text-primary-600 hover:bg-primary-50"
                  onClick={handleChatWithShop}
                  disabled={!canChat}
                  title={!isAuthenticated ? 'Vui lòng đăng nhập để chat' : 'Chat với shop'}
                >
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  {!isAuthenticated ? 'Đăng nhập để chat' : 'Chat Ngay'}
                </Button>
              )}
              {/* Optional: Show indicator for own product */}
              {isProductOwner && (
                <div className="text-sm text-gray-500 italic">
                  Đây là sản phẩm của bạn
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

        {/* Product Description Section - Full Width */}
        {product.description && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h2>
            <div className="prose max-w-none">
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </div>
            </div>
          </div>
        )}
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