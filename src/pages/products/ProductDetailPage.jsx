import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiMinus, FiPlus, FiChevronRight, FiStar, FiPackage, FiMapPin, FiMessageCircle, FiHeart } from 'react-icons/fi';

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
 * ProductDetailPage - Enhanced UI
 * Improved visual design with better spacing and modern elements
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
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Chat button clicked!');
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với shop');
      navigate('/login');
      return;
    }

    const shopId = product.shop?.id || product.shopId;
    console.log('Shop ID:', shopId);
    
    if (!shopId) {
      toast.error('Không tìm thấy thông tin shop');
      return;
    }

    try {
      console.log('Creating conversation with shop:', shopId);
      
      const response = await chatService.createConversation({
        type: 'SHOP',
        shopId: shopId,
      });

      console.log('Conversation response:', response);

      const conversationData = response.data || response;
      
      if (conversationData && conversationData.id) {
        toast.success('Đã mở chat với shop');
        
        console.log('Dispatching openChat event with conversationId:', conversationData.id);
        
        const event = new CustomEvent('openChat', { 
          detail: { conversationId: conversationData.id } 
        });
        window.dispatchEvent(event);
        
        console.log('Event dispatched successfully');
      } else {
        console.error('Invalid conversation response:', conversationData);
        toast.error('Không nhận được thông tin conversation');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Không thể mở chat với shop. Vui lòng thử lại.');
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
          
          const mainImageUrl = getProductImage(productData);
          setSelectedImage(mainImageUrl);
          
          const initialGallery = [mainImageUrl];
          if (productData.images && productData.images.length > 0) {
            productData.images.forEach(img => {
              if (img.imageUrl && img.imageUrl !== mainImageUrl) {
                initialGallery.push(img.imageUrl);
              }
            });
          }
          setImageGallery(initialGallery);
          
          if (productData.variants && productData.variants.length > 0) {
            const firstAvailable = productData.variants.find(v => v.stock > 0) || productData.variants[0];
            setSelectedVariant(firstAvailable);
          }

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

    if (productImages && productImages.primaryAttribute) {
      const primaryAttrValue = selectedVariant.variantValues?.find(
        vv => vv.productAttribute?.id === productImages.primaryAttribute.id
      )?.value;

      if (primaryAttrValue && productImages.variantImages && productImages.variantImages[primaryAttrValue]) {
        const variantImage = productImages.variantImages[primaryAttrValue];
        newSelectedImage = variantImage.imageUrl;
        
        newGallery = [variantImage.imageUrl];
        
        const mainImg = productImages.mainImage || product.mainImage;
        if (mainImg && mainImg !== variantImage.imageUrl) {
          newGallery.push(mainImg);
        }
        
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
      const maxAllowed = Math.min(maxStock, 100);
      return Math.max(1, Math.min(newQty, maxAllowed));
    });
  };

  const handleAddToCart = async () => {
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
    if (!hasRole('SELLER')) return false;

    const uid = user.id || user.userId || user._id || user.userId || user.uid;
    const shop = product.shop || {};

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

    const userShopId = user.shopId || user.shop?.id || null;

    const match = ownerIds.some(i => String(i) === String(uid)) || (userShopId && String(userShopId) === String(shop.id || product.shopId || product.shop?.id));

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
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-primary-600 transition-colors">
                Trang chủ
              </Link>
              <FiChevronRight className="w-4 h-4 text-gray-300" />
              <Link to="/products" className="text-gray-500 hover:text-primary-600 transition-colors">
                Sản phẩm
              </Link>
              <FiChevronRight className="w-4 h-4 text-gray-300" />
              <span className="text-gray-900 font-medium truncate">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Images Section - 5 columns */}
            <div className="lg:col-span-5">
              <div className="sticky top-6">
                {/* Main Image */}
                <div className="aspect-square bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-4 group">
                  <img
                    src={selectedImage || product.mainImage || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Thumbnail Gallery */}
                {imageGallery && imageGallery.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {imageGallery.map((imgUrl, index) => (
                      <button
                        key={`gallery-${index}-${imgUrl}`}
                        onClick={() => setSelectedImage(imgUrl)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          selectedImage === imgUrl
                            ? 'border-primary-500 ring-2 ring-primary-100 shadow-sm'
                            : 'border-gray-200 hover:border-primary-300 hover:shadow-sm'
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
            </div>

            {/* Product Info Section - 7 columns */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {/* Category Badge */}
                {product.category && (
                  <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full mb-3">
                    {product.category.name}
                  </span>
                )}

                {/* Product Name */}
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating & Sales Stats */}
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">5.0</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">128</span> đánh giá
                  </span>
                  <div className="h-4 w-px bg-gray-200"></div>
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">1.2k</span> đã bán
                  </span>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 rounded-xl p-5 mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl lg:text-4xl font-bold text-primary-600">
                      {displayPrice.toLocaleString('vi-VN')}₫
                    </span>
                    {product.basePrice && selectedVariant && selectedVariant.price !== product.basePrice && (
                      <>
                        <span className="text-lg text-gray-400 line-through">
                          {product.basePrice.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded">
                          -{Math.round((1 - displayPrice/product.basePrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {!product.isActive ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      <span className="text-sm font-medium">Sản phẩm không khả dụng</span>
                    </div>
                  ) : (
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                      isInStock 
                        ? selectedVariant && selectedVariant.stock < 10
                          ? 'bg-orange-50 text-orange-700'
                          : 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isInStock 
                          ? selectedVariant && selectedVariant.stock < 10
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                          : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {isInStock 
                          ? selectedVariant.stock < 10
                            ? `Chỉ còn ${selectedVariant.stock} sản phẩm`
                            : `Còn hàng (${selectedVariant.stock} sản phẩm)`
                          : 'Hết hàng'
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Mô tả sản phẩm
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Variant Selector */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <VariantSelector
                      variants={product.variants}
                      selectedVariant={selectedVariant}
                      onVariantChange={setSelectedVariant}
                    />
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Số lượng
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-4 py-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-r border-gray-200"
                      >
                        <FiMinus className="w-4 h-4 text-gray-700" />
                      </button>
                      <input
                        type="text"
                        value={quantity}
                        readOnly
                        className="w-16 py-3 text-center font-semibold text-gray-900 bg-white border-0 focus:outline-none"
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={!selectedVariant || quantity >= maxQuantity}
                        className="px-4 py-3 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors border-l border-gray-200"
                      >
                        <FiPlus className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    {selectedVariant && selectedVariant.stock < 10 && (
                      <span className="text-sm text-orange-600 font-medium">
                        Chỉ còn {selectedVariant.stock} sản phẩm
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.isActive || !isInStock || adding}
                    loading={adding}
                    variant="primary"
                    className="flex-1 py-4 text-base font-semibold shadow-sm hover:shadow-md transition-shadow"
                  >
                    <FiShoppingCart className="w-5 h-5 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>
                  <button className="px-5 py-4 border-2 border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
                    <FiHeart className="w-5 h-5" />
                  </button>
                </div>

                {/* Shop Info Card */}
                {(product.shop || product.shopName) && (
                  <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="flex items-start gap-4">
                      {/* Shop Logo */}
                      <Link 
                        to={`/shops/${product.shop?.id || product.shopId}`}
                        className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 no-underline bg-white"
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
                          <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors truncate mb-1">
                            {product.shop?.name || product.shopName}
                          </h3>
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                          {(product.shop?.rating || product.shopRating) && (
                            <span className="flex items-center gap-1">
                              <FiStar className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                              <span className="font-medium text-gray-700">
                                {(product.shop?.rating || product.shopRating).toFixed(1)}
                              </span>
                            </span>
                          )}
                          {(product.shop?.productCount || product.shopProductCount) && (
                            <span className="flex items-center gap-1">
                              <FiPackage className="w-3.5 h-3.5" />
                              {product.shop?.productCount || product.shopProductCount} sản phẩm
                            </span>
                          )}
                          {(product.shop?.location || product.shopLocation) && (
                            <span className="flex items-center gap-1">
                              <FiMapPin className="w-3.5 h-3.5" />
                              {product.shop?.location || product.shopLocation}
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleChatWithShop}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                            Chat Ngay
                          </button>
                          
                          <Link 
                            to={`/shops/${product.shop?.id || product.shopId}`}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors no-underline"
                          >
                            Xem Shop
                            <FiChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Details */}
                {selectedVariant && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                      Thông tin chi tiết
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <dt className="text-xs text-gray-500 mb-1">SKU</dt>
                        <dd className="font-mono text-sm font-semibold text-gray-900">{selectedVariant.sku}</dd>
                      </div>
                      {product.category && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <dt className="text-xs text-gray-500 mb-1">Danh mục</dt>
                          <dd className="text-sm font-semibold text-gray-900">{product.category.name}</dd>
                        </div>
                      )}
                      {selectedVariant.variantValues && selectedVariant.variantValues.length > 0 && (
                        selectedVariant.variantValues.map((vv, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-3">
                            <dt className="text-xs text-gray-500 mb-1">{vv.productAttribute?.name || 'Thuộc tính'}</dt>
                            <dd className="text-sm font-semibold text-gray-900">{vv.value}</dd>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ReviewSection 
              productId={id}
              product={product}
              isAuthenticated={isAuthenticated}
              user={user}
              hasRole={hasRole}
              isProductOwner={isProductOwner}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;