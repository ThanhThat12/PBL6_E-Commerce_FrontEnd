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
import useCart from '../../hooks/useCart';

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

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (selectedVariant && selectedVariant.stock > 0) {
      navigate('/cart');
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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
