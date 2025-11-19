import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import VariantSelector from '../../components/product/VariantSelector';
import { getProductById } from '../../services/productService';
import reviewService from '../../services/reviewService';
import orderService from '../../services/orderService';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';

/**
 * ProductDetailPage
 * Product details with variant selection and add to cart
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
  const { user, isAuthenticated, hasRole } = useAuth();

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const response = await getProductById(id);
        console.log('🔍 Product detail response:', response);
        console.log('🔍 Response data:', response.data);
        console.log('🔍 Response data variants:', response.data?.variants);
        
        if (response && response.data) {
          const productData = response.data;
          setProduct(productData);
          setSelectedImage(productData.mainImage || '/placeholder-product.jpg');
          
          // Auto-select first available variant
          if (productData.variants && productData.variants.length > 0) {
            const firstAvailable = productData.variants.find(v => v.stock > 0) || productData.variants[0];
            console.log('🔍 Auto-selected variant:', firstAvailable);
            setSelectedVariant(firstAvailable);
          }
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        
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

  // When product or user changes, load reviews and check if user can review
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewService.getReviews(product.id, { page: 0, size: 10 });
        if (res && res.content) {
          setReviews(res.content);
        } else if (res && res.data && res.data.content) {
          setReviews(res.data.content);
        } else if (Array.isArray(res)) {
          setReviews(res);
        } else {
          setReviews([]);
        }
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
        let ordersArray = [];
        if (Array.isArray(data)) ordersArray = data;
        else if (data && Array.isArray(data.content)) ordersArray = data.content;

        const purchased = ordersArray.some((ord) => {
          const items = ord.items || ord.orderItems || [];
          const status = ord.status || '';
          if (!items || !Array.isArray(items)) return false;
          if (String(status).toUpperCase() !== 'COMPLETED') return false;
          return items.some(it => Number(it.productId || it.product?.id) === Number(product.id));
        });

        setCanReview(!!purchased);
      } catch (err) {
        console.error('Failed to check purchase eligibility:', err);
        setCanReview(false);
      }
    };

    fetchReviews();
    checkUserPurchaseEligibility();
  }, [product, isAuthenticated, user]);

  const submitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }
    if (!canReview) {
      toast.error('Bạn chỉ có thể đánh giá sản phẩm sau khi hoàn tất đơn hàng');
      return;
    }
    if (!ratingInput || ratingInput < 1) {
      toast.error('Vui lòng chọn số sao');
      return;
    }

    try {
      setUploadingReview(true);
      const payload = { rating: Number(ratingInput), comment: commentInput || '' };
      if (selectedFiles && selectedFiles.length > 0) {
        payload.images = selectedFiles;
      }
      const res = await reviewService.postReview(product.id, payload);
      if (res && (res.status === 200 || res.status === 201 || res.status === 'success')) {
        toast.success('Cảm ơn đánh giá của bạn!');
        setCommentInput('');
        setRatingInput(5);
        setSelectedFiles([]);
        previewUrls.forEach(u => URL.revokeObjectURL(u));
        setPreviewUrls([]);
        // refresh
        const r = await reviewService.getReviews(product.id, { page: 0, size: 10 });
        if (r && r.content) setReviews(r.content);
      } else {
        toast.success(res.message || 'Đã gửi đánh giá');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      const msg = err.response?.data?.message || err.message || 'Không thể gửi đánh giá';
      toast.error(msg);
    } finally {
      setUploadingReview(false);
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      const maxStock = selectedVariant?.stock || 100;
      const maxAllowed = Math.min(maxStock, 100); // Max 100 per order
      return Math.max(1, Math.min(newQty, maxAllowed));
    });
  };

  const handleAddToCart = async () => {
    // Check if product is active
    if (!product.isActive) {
      toast.error('Sản phẩm này hiện không khả dụng');
      return;
    }

    if (!selectedVariant) {
      toast.error('Vui lòng chọn phiên bản sản phẩm');
      return;
    }

    // Check stock
    if (selectedVariant.stock === 0) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }

    // Validate quantity vs stock
    if (quantity > selectedVariant.stock) {
      toast.error(`Chỉ còn ${selectedVariant.stock} sản phẩm trong kho`);
      return;
    }

    // Validate quantity range
    if (quantity < 1 || quantity > 100) {
      toast.error('Số lượng phải từ 1 đến 100');
      return;
    }

    setAdding(true);
    try {
      await addItemToCart(selectedVariant.id, quantity);
      toast.success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
      setQuantity(1); // Reset quantity after successful add
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

  const handleBuyNow = () => {
    if (selectedVariant && selectedVariant.stock > 0) {
      // Lưu sản phẩm hiện tại vào sessionStorage dưới dạng mảng
      const checkoutItem = {
        productId: product.id,
        productName: product.name,
        variantId: selectedVariant.id,
        unitPrice: selectedVariant.price,
        quantity: quantity,
        image: selectedVariant.imageUrl || product.mainImage,
        name: product.name,
        price: selectedVariant.price
      };
      sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
      navigate('/payment');
    } else {
      toast.error('Sản phẩm không khả dụng hoặc hết hàng');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" text="Đang tải sản phẩm..." />
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
            <p className="text-gray-600 mb-4">Không tìm thấy sản phẩm</p>
            <Button onClick={() => navigate('/products')}>
              Quay lại danh sách sản phẩm
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    // Limit to 6 images
    const limited = files.slice(0, 6);
    setSelectedFiles(limited);

    // Generate preview URLs
    const urls = limited.map(f => URL.createObjectURL(f));
    // Revoke previous urls
    previewUrls.forEach(u => URL.revokeObjectURL(u));
    setPreviewUrls(urls);
  };

  const removePreview = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

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

  const handleToggleReply = (reviewId, open = true) => {
    setReplyState(prev => ({ ...prev, [reviewId]: { ...(prev[reviewId] || {}), open, text: prev[reviewId]?.text || '' } }));
  };

  const handleReplyChange = (reviewId, text) => {
    setReplyState(prev => ({ ...prev, [reviewId]: { ...(prev[reviewId] || {}), text } }));
  };

  const submitReply = async (reviewId) => {
    const state = replyState[reviewId] || {};
    const text = (state.text || '').trim();
    if (!text) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }
    try {
      setReplyState(prev => ({ ...prev, [reviewId]: { ...(prev[reviewId] || {}), loading: true } }));
      const payload = { sellerResponse: text };
      const res = await reviewService.replyReview(reviewId, payload);
      if (res && (res.status === 200 || res.status === 201 || res.status === 'success')) {
        toast.success('Đã gửi phản hồi');
        // refresh reviews
        const r = await reviewService.getReviews(product.id, { page: 0, size: 10 });
        if (r && r.content) setReviews(r.content);
        // close reply box
        setReplyState(prev => ({ ...prev, [reviewId]: { ...(prev[reviewId] || {}), open: false, loading: false, text: '' } }));
      } else {
        toast.success(res.message || 'Đã gửi phản hồi');
      }
    } catch (err) {
      console.error('Reply error:', err);
      toast.error(err.response?.data?.message || 'Không thể gửi phản hồi');
      setReplyState(prev => ({ ...prev, [reviewId]: { ...(prev[reviewId] || {}), loading: false } }));
    }
  };

  const displayPrice = selectedVariant?.price || product.basePrice || 0;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 100) : 100;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600 no-underline">
              Trang chủ
            </Link>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/products" className="text-gray-600 hover:text-primary-600 no-underline">
              Sản phẩm
            </Link>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            {product.category && (
              <>
                <span className="text-gray-600">{product.category.name}</span>
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              </>
            )}
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
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

            {/* Thumbnail Images */}
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={() => setSelectedImage(product.mainImage)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === product.mainImage
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={product.mainImage}
                    alt="Main"
                    className="w-full h-full object-cover"
                  />
                </button>
                
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.imageUrl
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
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

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.isActive || !isInStock || adding}
                loading={adding}
                variant="primary"
                className="flex-1"
              >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={!product.isActive || !isInStock || adding}
                variant="secondary"
                className="flex-1"
              >
                Mua ngay
              </Button>

              <button
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                aria-label="Thêm vào yêu thích"
                onClick={() => toast.info('Tính năng yêu thích đang phát triển!')}
              >
                <FiHeart className="w-6 h-6" />
              </button>
            </div>

            {/* Product Details */}
            {selectedVariant && (
              <div className="mt-8 pt-8 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin chi tiết
                </h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">SKU:</dt>
                    <dd className="font-mono font-semibold">{selectedVariant.sku}</dd>
                  </div>
                  {product.shop && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Shop:</dt>
                      <dd className="font-semibold">{product.shop.name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Reviews Section - full width below product content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Đánh giá sản phẩm</h3>

          {/* Review input for eligible users */}
          {canReview ? (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
              <div className="flex items-center gap-4 mb-2">
                <select value={ratingInput} onChange={(e) => setRatingInput(Number(e.target.value))} className="border rounded px-3 py-2">
                  <option value={5}>5 sao</option>
                  <option value={4}>4 sao</option>
                  <option value={3}>3 sao</option>
                  <option value={2}>2 sao</option>
                  <option value={1}>1 sao</option>
                </select>
                <button onClick={submitReview} disabled={uploadingReview} className={`px-4 py-2 text-white rounded ${uploadingReview ? 'bg-gray-400' : 'bg-primary-600'}`}>
                  {uploadingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="w-full border rounded p-3"
                rows={3}
                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
              />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Thêm ảnh (tối đa 6)</label>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} />
                {previewUrls && previewUrls.length > 0 && (
                  <div className="mt-2 grid grid-cols-6 gap-2">
                    {previewUrls.map((u, i) => (
                      <div key={i} className="relative">
                        <img src={u} alt={`preview-${i}`} className="w-24 h-24 object-cover rounded" />
                        <button type="button" onClick={() => removePreview(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 -translate-y-1/4 translate-x-1/4">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">Chỉ khách hàng đã hoàn tất đơn hàng mới có thể gửi đánh giá.</p>
          )}

          {/* Reviews list */}
          {reviewsLoading ? (
            <div className="py-4">
              <Loading size="sm" text="Đang tải đánh giá..." />
            </div>
          ) : (
            <div className="space-y-4">
              {reviews && reviews.length > 0 ? (
                reviews.map(r => (
                  <div key={r.id} className="bg-gray-50 p-4 rounded">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{r.userFullName || r.userName || 'Người dùng'}</div>
                        <div className="text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-yellow-500 font-semibold">{r.rating}★</div>
                    </div>
                    {r.comment && <p className="mt-2 text-gray-700">{r.comment}</p>}
                    {r.images && r.images.length > 0 && (
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {r.images.map((img, i) => (
                          // eslint-disable-next-line jsx-a11y/img-redundant-alt
                          <img key={i} src={img} alt={`review-${i}`} className="w-full h-24 object-cover rounded" />
                        ))}
                      </div>
                    )}
                        {r.sellerResponse && (
                          <div className="mt-2 p-2 bg-white border-l-4 border-primary-600 rounded">
                            <div className="text-sm text-gray-600">Phản hồi từ người bán:</div>
                            <div className="text-sm text-gray-800">{r.sellerResponse}</div>
                            <div className="text-xs text-gray-500">{r.sellerResponseDate}</div>
                          </div>
                        )}

                        {/* Seller reply UI */}
                        {!r.sellerResponse && isProductOwner() && (
                          <div className="mt-2">
                            {!replyState[r.id]?.open ? (
                              <button onClick={() => handleToggleReply(r.id, true)} className="text-sm text-primary-600">Phản hồi</button>
                            ) : (
                              <div className="mt-2">
                                <textarea
                                  value={replyState[r.id]?.text || ''}
                                  onChange={(e) => handleReplyChange(r.id, e.target.value)}
                                  className="w-full border rounded p-2"
                                  rows={2}
                                  placeholder="Viết phản hồi cho khách hàng..."
                                />
                                <div className="flex gap-2 mt-2">
                                  <button onClick={() => submitReply(r.id)} disabled={replyState[r.id]?.loading} className="px-3 py-1 bg-primary-600 text-white rounded text-sm">
                                    {replyState[r.id]?.loading ? 'Đang gửi...' : 'Gửi phản hồi'}
                                  </button>
                                  <button onClick={() => handleToggleReply(r.id, false)} className="px-3 py-1 border rounded text-sm">Hủy</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-600">Chưa có đánh giá cho sản phẩm này.</div>
              )}
            </div>
          )}
        </div>
      </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
