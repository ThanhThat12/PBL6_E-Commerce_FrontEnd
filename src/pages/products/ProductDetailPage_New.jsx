import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiMinus, 
  FiPlus, 
  FiChevronRight,
  FiStar,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiMessageCircle,
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
  FiMapPin,
  FiUsers,
  FiAward,
  FiClock,
  FiCheck,
  FiEye,
  FiGrid,
  FiBookmark
} from 'react-icons/fi';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import VariantSelector from '../../components/product/VariantSelector';
import { getProductById, getProductImages } from '../../services/productService';
import reviewService from '../../services/reviewService';
import orderService from '../../services/orderService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import { getProductImage } from '../../utils/placeholderImage';

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
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadingReview, setUploadingReview] = useState(false);
  const [replyState, setReplyState] = useState({});
  const [activeTab, setActiveTab] = useState('details'); // details, reviews, qna, shipping
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, isAuthenticated, hasRole } = useAuth();

  // Mock shop data (replace with real data from backend)
  const shopInfo = {
    id: product?.seller?.id || 1,
    name: product?.seller?.shopName || product?.seller?.name || 'Tech Official Store',
    logo: product?.seller?.logo || '',
    banner: product?.seller?.banner || '',
    isVerified: product?.seller?.isVerified ?? true,
    rating: product?.seller?.rating || 4.8,
    followers: product?.seller?.followers || 125000,
    products: product?.seller?.productCount || 850,
    responseTime: product?.seller?.responseTime || '2 phút',
    responseRate: product?.seller?.responseRate || 98,
    joinedDate: product?.seller?.joinedDate || '2020-03-15',
    location: product?.seller?.location || 'TP. Hồ Chí Minh',
    isOnline: true, // Mock online status
  };

  // Product images for gallery
  const [productGallery, setProductGallery] = useState([]);

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        console.log('🔍 Product detail response:', response);
        
        if (response && response.data) {
          const productData = response.data;
          setProduct(productData);
          
          // Setup image gallery
          const mainImageUrl = getProductImage(productData);
          setSelectedImage(mainImageUrl);
          setProductGallery([mainImageUrl]);
          
          // Auto-select first available variant
          if (productData.variants && productData.variants.length > 0) {
            const firstAvailable = productData.variants.find(v => v.stock > 0) || productData.variants[0];
            setSelectedVariant(firstAvailable);
          }

          // Load product images
          try {
            const imagesResponse = await getProductImages(id);
            console.log('🖼️ Product images loaded:', imagesResponse);
            if (imagesResponse && imagesResponse.data) {
              setProductImages(imagesResponse.data);
              
              // Update gallery with all available images
              const gallery = [];
              if (imagesResponse.data.mainImage) {
                gallery.push(imagesResponse.data.mainImage);
              }
              if (imagesResponse.data.galleryImages) {
                gallery.push(...imagesResponse.data.galleryImages.map(img => img.imageUrl));
              }
              if (gallery.length === 0) {
                gallery.push(mainImageUrl); // Fallback to placeholder
              }
              setProductGallery(gallery);
              setSelectedImage(gallery[0]);
            }
          } catch (error) {
            console.error('Failed to load product images:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        if (error.response?.status === 404) {
          toast.error('Sản phẩm không tồn tại');
          navigate('/products', { replace: true });
        } else {
          toast.error('Không thể tải thông tin sản phẩm');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Update image when variant changes
  useEffect(() => {
    if (!selectedVariant || !product) return;

    if (productImages && productImages.primaryAttribute) {
      const primaryAttrValue = selectedVariant.variantValues?.find(
        vv => vv.productAttribute?.id === productImages.primaryAttribute.id
      )?.value;

      if (primaryAttrValue && productImages.variantImages && productImages.variantImages[primaryAttrValue]) {
        const variantImageUrl = productImages.variantImages[primaryAttrValue].imageUrl;
        setSelectedImage(variantImageUrl);
        return;
      }
    }

    // Fallback to main image
    const fallbackImage = productImages?.mainImage || getProductImage(product);
    setSelectedImage(fallbackImage);
  }, [selectedVariant, productImages, product]);

  // Load reviews
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewService.getReviews(product.id, { page: 0, size: 10 });
        const reviewData = res?.content || res?.data?.content || res || [];
        setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    const checkUserPurchaseEligibility = async () => {
      try {
        if (!isAuthenticated) {
          setCanReview(false);
          return;
        }

        const resp = await orderService.getMyOrders();
        const data = resp?.data || resp;
        let ordersArray = Array.isArray(data) ? data : (data?.content || []);

        const purchased = ordersArray.some((ord) => {
          const items = ord.items || ord.orderItems || [];
          const status = ord.status || '';
          return String(status).toUpperCase() === 'COMPLETED' && 
                 items.some(it => Number(it.productId || it.product?.id) === Number(product.id));
        });

        setCanReview(purchased);
      } catch (err) {
        console.error('Failed to check purchase eligibility:', err);
        setCanReview(false);
      }
    };

    fetchReviews();
    checkUserPurchaseEligibility();
  }, [product, isAuthenticated, user]);

  // Handlers
  const handleQuantityChange = (newQuantity) => {
    if (!selectedVariant) return;
    
    const min = 1;
    const max = selectedVariant.stock || 999;
    const qty = Math.max(min, Math.min(max, newQuantity));
    setQuantity(qty);
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

  const handleBuyNow = async () => {
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
      // Add to cart
      await addItemToCart(selectedVariant.id, quantity);
      
      // Store flag to auto-select this item after cart loads
      sessionStorage.setItem('autoSelectVariantId', selectedVariant.id.toString());
      
      // Navigate to cart
      navigate('/cart');
    } catch (error) {
      console.error('Buy now error:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy sản phẩm');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Số lượng không hợp lệ');
      } else {
        toast.error('Không thể thực hiện mua ngay');
      }
    } finally {
      setAdding(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getDiscountPercentage = () => {
    if (product?.originalPrice && product?.basePrice && product.originalPrice > product.basePrice) {
      return Math.round(((product.originalPrice - product.basePrice) / product.originalPrice) * 100);
    }
    return 0;
  };

  const renderStars = (rating, size = 'sm') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FiStar key={i} className={`${starSize} text-yellow-400 fill-current`} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <div key="half" className={`${starSize} relative text-yellow-400`}>
          <FiStar className={`${starSize} absolute`} />
          <FiStar className={`${starSize} fill-current`} style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }
    
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <FiStar key={`empty-${i}`} className={`${starSize} text-gray-300`} />
      );
    }
    
    return stars;
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

  const discount = getDiscountPercentage();
  const rating = product.averageRating || 4.5;
  const reviewCount = reviews.length || Math.floor(Math.random() * 500);
  const soldCount = product.soldCount || Math.floor(Math.random() * 1000);

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

        {/* Shop Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              {/* Shop Info */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  {shopInfo.logo ? (
                    <img src={shopInfo.logo} alt={shopInfo.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-primary-600 font-bold text-xl">
                      {shopInfo.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{shopInfo.name}</h2>
                    {shopInfo.isVerified && (
                      <div className="flex items-center gap-1 bg-blue-500 px-2 py-1 rounded-full">
                        <FiShield className="w-3 h-3" />
                        <span className="text-xs font-medium">Official</span>
                      </div>
                    )}
                    {shopInfo.isOnline && (
                      <div className="flex items-center gap-1 bg-green-500 px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-xs font-medium">Online</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-1">
                      {renderStars(shopInfo.rating, 'sm')}
                      <span className="ml-1">{shopInfo.rating}</span>
                    </div>
                    <span>•</span>
                    <span>{shopInfo.followers.toLocaleString()} Người theo dõi</span>
                    <span>•</span>
                    <span>{shopInfo.products} Sản phẩm</span>
                  </div>
                </div>
              </div>

              {/* Shop Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                  <FiMessageCircle className="w-4 h-4 mr-2" />
                  Chat Ngay
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                  <FiUsers className="w-4 h-4 mr-2" />
                  + Theo Dõi
                </Button>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                  <FiEye className="w-4 h-4 mr-2" />
                  Xem Shop
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = getProductImage(product);
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
                
                {/* Thumbnail Gallery */}
                {productGallery.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {productGallery.slice(0, 5).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImage(image);
                          setCurrentImageIndex(index);
                        }}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image
                            ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                {/* Product Name & Basic Info */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium text-gray-900">{rating}</span>
                      <span>({reviewCount} đánh giá)</span>
                    </div>
                    <span>•</span>
                    <span>Đã bán {soldCount.toLocaleString()}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <FiEye className="w-3 h-3" />
                      <span>2.1k lượt xem</span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-gray-700 text-sm line-clamp-3">{product.description}</p>
                  )}
                </div>

                {/* Price */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-3xl font-bold text-primary-600">
                      ₫{formatPrice(selectedVariant?.price || product.basePrice)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.basePrice && (
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
                  <div>
                    <VariantSelector
                      product={product}
                      selectedVariant={selectedVariant}
                      onVariantChange={setSelectedVariant}
                    />
                  </div>
                )}

                {/* Quantity & Actions */}
                <div className="space-y-4">
                  {/* Quantity */}
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">Số lượng:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-white transition-colors"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        className="w-16 text-center py-2 border-0 focus:ring-0"
                        min="1"
                        max={selectedVariant?.stock || 999}
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={!selectedVariant || quantity >= selectedVariant.stock}
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
                      disabled={adding || !selectedVariant || selectedVariant.stock === 0 || !product.isActive}
                      variant="outline"
                      className="flex-1 border-primary-500 text-primary-600 hover:bg-primary-50"
                    >
                      <FiShoppingCart className="w-5 h-5 mr-2" />
                      {adding ? 'Đang thêm...' : 'Thêm Vào Giỏ Hàng'}
                    </Button>
                    
                    <Button
                      onClick={handleBuyNow}
                      disabled={adding || !selectedVariant || selectedVariant.stock === 0 || !product.isActive}
                      variant="primary"
                      className="flex-1"
                    >
                      Mua Ngay
                    </Button>
                  </div>
                </div>

                {/* Product Guarantees */}
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

          {/* Product Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'details', label: 'Mô tả sản phẩm', icon: FiGrid },
                  { id: 'reviews', label: `Đánh giá (${reviewCount})`, icon: FiStar },
                  { id: 'qna', label: 'Hỏi & Đáp', icon: FiMessageCircle },
                  { id: 'shipping', label: 'Vận chuyển', icon: FiTruck },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'details' && (
                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
                  {product.description ? (
                    <div className="whitespace-pre-wrap text-gray-700">
                      {product.description}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                  )}
                  
                  {/* Product Specifications */}
                  <div className="mt-8">
                    <h4 className="text-md font-semibold mb-4">Thông số kỹ thuật</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Danh mục:</span>
                          <span className="ml-2 text-gray-600">{product.category?.name || 'Chưa phân loại'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Thương hiệu:</span>
                          <span className="ml-2 text-gray-600">{shopInfo.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Tình trạng:</span>
                          <span className="ml-2 text-gray-600">
                            {product.isActive ? 'Còn hàng' : 'Tạm hết'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Xuất xứ:</span>
                          <span className="ml-2 text-gray-600">Việt Nam</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Đánh giá sản phẩm</h3>
                  
                  {/* Rating Overview */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-primary-600 mb-2">{rating}</div>
                        <div className="flex items-center justify-center mb-2">
                          {renderStars(rating, 'md')}
                        </div>
                        <div className="text-sm text-gray-600">{reviewCount} đánh giá</div>
                      </div>
                      
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = Math.floor(Math.random() * reviewCount);
                          const percentage = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                          
                          return (
                            <div key={star} className="flex items-center gap-3 mb-2">
                              <span className="text-sm w-6">{star}★</span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Review List */}
                  {reviewsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-semibold">
                                {review.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="font-medium text-gray-900">
                                  {review.user?.name || 'Người dùng'}
                                </span>
                                <div className="flex items-center">
                                  {renderStars(review.rating || 5, 'sm')}
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              
                              {/* Review Actions */}
                              <div className="flex items-center gap-4 text-sm">
                                <button className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
                                  <FiThumbsUp className="w-4 h-4" />
                                  <span>Hữu ích (12)</span>
                                </button>
                                <button className="flex items-center gap-1 text-gray-500 hover:text-primary-600">
                                  <FiThumbsDown className="w-4 h-4" />
                                  <span>Không hữu ích</span>
                                </button>
                                <button className="text-gray-500 hover:text-primary-600">
                                  Trả lời
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-center">
                        <Button variant="outline">Xem thêm đánh giá</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiStar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có đánh giá</h4>
                      <p className="text-gray-500">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'qna' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Hỏi & Đáp</h3>
                  <div className="text-center py-8">
                    <FiMessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Chưa có câu hỏi nào</h4>
                    <p className="text-gray-500 mb-4">Hãy đặt câu hỏi đầu tiên về sản phẩm này!</p>
                    <Button variant="primary">Đặt câu hỏi</Button>
                  </div>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Thông tin vận chuyển</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <FiTruck className="w-6 h-6 text-green-500" />
                        <div>
                          <div className="font-medium text-green-700">Miễn phí vận chuyển</div>
                          <div className="text-sm text-green-600">Cho đơn hàng từ 500.000đ</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                        <FiClock className="w-6 h-6 text-blue-500" />
                        <div>
                          <div className="font-medium text-blue-700">Giao hàng nhanh</div>
                          <div className="text-sm text-blue-600">2-3 ngày làm việc</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                        <FiRotateCcw className="w-6 h-6 text-purple-500" />
                        <div>
                          <div className="font-medium text-purple-700">Đổi trả dễ dàng</div>
                          <div className="text-sm text-purple-600">15 ngày đổi trả miễn phí</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Địa chỉ giao hàng</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>Từ: {shopInfo.location}</span>
                        </div>
                        <div>Phí ship: Miễn phí (đơn từ 500k)</div>
                        <div>Thời gian: 2-3 ngày</div>
                        <div>Đối tác: Giao hàng nhanh, Giao hàng tiết kiệm</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;