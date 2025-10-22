import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';

import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import VariantSelector from '../../components/product/VariantSelector';
import { getProductById } from '../../services/productService';
import { addToCart } from '../../services/cartService';

/**
 * ProductDetailPage
 * Product details with variant selection and add to cart
 */
const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
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
        console.log('📦 ProductDetailPage - Product response:', response);
        
        if (response.code === 200) {
          setProduct(response.data);
          setSelectedImage(response.data.image || response.data.mainImage);
          
          // Auto-select first variant
          if (response.data.variants && response.data.variants.length > 0) {
            setSelectedVariant(response.data.variants[0]);
          }
          console.log('✅ Product loaded:', response.data.name);
        } else {
          console.warn('❌ Product load failed:', response.message);
        }
      } catch (error) {
        console.error('Failed to load product:', error);
        toast.error('Failed to load product details');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta;
      const maxStock = selectedVariant?.stock || 0;
      return Math.max(1, Math.min(newQty, maxStock));
    });
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    if (selectedVariant.stock === 0) {
      toast.error('This variant is out of stock');
      return;
    }

    setAdding(true);
    try {
      const response = await addToCart(selectedVariant.id, quantity);
      if (response.code === 200) {
        toast.success(`Added ${quantity} item(s) to cart!`);
        setQuantity(1);
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
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
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <Button onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const displayPrice = selectedVariant?.price || product.basePrice || 0;
  const isInStock = selectedVariant ? selectedVariant.stock > 0 : false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600 no-underline">
              Home
            </Link>
            <FiChevronRight className="w-4 h-4 text-gray-400" />
            <Link to="/products" className="text-gray-600 hover:text-primary-600 no-underline">
              Products
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
              <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isInStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isInStock 
                  ? `In Stock (${selectedVariant.stock} available)` 
                  : 'Out of Stock'
                }
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 pb-8 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
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
                Quantity
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                    className="p-3 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!isInStock || adding}
                loading={adding}
                variant="primary"
                className="flex-1"
              >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={!isInStock || adding}
                variant="secondary"
                className="flex-1"
              >
                Buy Now
              </Button>

              <button
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500 transition-colors"
                aria-label="Add to wishlist"
              >
                <FiHeart className="w-6 h-6" />
              </button>
            </div>

            {/* Product Details */}
            {selectedVariant && (
              <div className="mt-8 pt-8 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Product Details
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
    </div>
  );
};

export default ProductDetailPage;
