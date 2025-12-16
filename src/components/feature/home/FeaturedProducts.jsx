import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card } from '../../common/Card/Card';
import Button from '../../common/Button';

/**
 * ProductCard - Card hiển thị sản phẩm với đầy đủ thông tin
 * Tái sử dụng cho FeaturedProducts, FlashDeals, và các section khác
 */
const ProductCard = ({ product, showDiscount = false }) => {
  const {
    id,
    name,
    image,
    price,
    originalPrice,
    discount,
    rating = 0,
    reviewCount = 0,
    brand,
    inStock = true,
    badge, // "new", "hot", "sale"
  } = product;

  const hasDiscount = originalPrice && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : discount;

  return (
    <Link to={`/products/${id}`} className="group no-underline">
      <Card
        hoverable
        shadow="soft"
        padding="none"
        className="h-full flex flex-col"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-background-secondary">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {badge === 'new' && (
              <span className="px-3 py-1 bg-accent-green-500 text-white text-xs font-bold rounded-full">
                MỚI
              </span>
            )}
            {badge === 'hot' && (
              <span className="px-3 py-1 bg-accent-red-500 text-white text-xs font-bold rounded-full">
                HOT
              </span>
            )}
            {(showDiscount || badge === 'sale') && discountPercent > 0 && (
              <span className="px-3 py-1 bg-secondary-500 text-white text-xs font-bold rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.preventDefault();
                // Handle wishlist
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-accent-red-50 hover:text-accent-red-500 transition-colors"
              aria-label="Add to wishlist"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Handle quick view
              }}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-medium hover:bg-primary-50 hover:text-primary-500 transition-colors"
              aria-label="Quick view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>

          {/* Out of Stock Overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-text-primary px-4 py-2 rounded-lg font-bold">
                HẾT HÀNG
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand */}
          {brand && (
            <p className="text-xs text-text-tertiary uppercase tracking-wide mb-1">
              {brand}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm md:text-base font-semibold text-text-primary mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'text-secondary-500'
                      : 'text-neutral-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-text-tertiary">
              ({reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg font-bold text-primary-600">
                {price.toLocaleString('vi-VN')}₫
              </span>
              {hasDiscount && (
                <span className="text-sm text-text-tertiary line-through">
                  {originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>

            {/* Add to Cart Button */}
            {inStock && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  // Handle add to cart
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Thêm vào giỏ
              </Button>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    discount: PropTypes.number,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    brand: PropTypes.string,
    inStock: PropTypes.bool,
    badge: PropTypes.oneOf(['new', 'hot', 'sale']),
  }).isRequired,
  showDiscount: PropTypes.bool,
};

/**
 * FeaturedProducts - Hiển thị sản phẩm nổi bật
 * Dễ dàng tích hợp dữ liệu từ backend API
 */
const FeaturedProducts = ({ products = [], title = 'Sản Phẩm Nổi Bật' }) => {
  // Default products nếu không có data từ backend
  const defaultProducts = [
    {
      id: 1,
      name: 'Giày Nike Air Zoom Pegasus 40',
      slug: 'nike-air-zoom-pegasus-40',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      price: 3290000,
      originalPrice: 3990000,
      rating: 4.8,
      reviewCount: 234,
      brand: 'Nike',
      inStock: true,
      badge: 'hot',
    },
    {
      id: 2,
      name: 'Áo Thể Thao Adidas Own The Run',
      slug: 'adidas-own-the-run',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      price: 890000,
      originalPrice: 1190000,
      rating: 4.5,
      reviewCount: 156,
      brand: 'Adidas',
      inStock: true,
      badge: 'sale',
    },
    {
      id: 3,
      name: 'Bóng Đá Adidas Champions League',
      slug: 'adidas-champions-league-ball',
      image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=400&fit=crop',
      price: 2490000,
      rating: 5.0,
      reviewCount: 89,
      brand: 'Adidas',
      inStock: true,
      badge: 'new',
    },
    {
      id: 4,
      name: 'Găng Tay Boxing Everlast Pro',
      slug: 'everlast-pro-boxing-gloves',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
      price: 1590000,
      rating: 4.7,
      reviewCount: 67,
      brand: 'Everlast',
      inStock: true,
    },
    {
      id: 5,
      name: 'Thảm Yoga Lululemon Premium',
      slug: 'lululemon-premium-yoga-mat',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
      price: 1790000,
      rating: 4.9,
      reviewCount: 312,
      brand: 'Lululemon',
      inStock: true,
      badge: 'hot',
    },
    {
      id: 6,
      name: 'Túi Gym Under Armour Undeniable 5.0',
      slug: 'under-armour-undeniable-5',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=400&fit=crop',
      price: 1490000,
      originalPrice: 1890000,
      rating: 4.6,
      reviewCount: 145,
      brand: 'Under Armour',
      inStock: true,
    },
    {
      id: 7,
      name: 'Giày Bóng Rổ Nike LeBron 21',
      slug: 'nike-lebron-21',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop',
      price: 4290000,
      rating: 4.8,
      reviewCount: 198,
      brand: 'Nike',
      inStock: true,
      badge: 'new',
    },
    {
      id: 8,
      name: 'Vợt Tennis Wilson Pro Staff',
      slug: 'wilson-pro-staff',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop',
      price: 5490000,
      rating: 4.9,
      reviewCount: 87,
      brand: 'Wilson',
      inStock: false,
    },
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;

  console.log('🎯 FeaturedProducts component:');
  console.log('Products prop received:', products.length, 'items');
  console.log('Products array:', products);
  console.log('Display products:', displayProducts.length, 'items');

  return (
    <section className="py-8 md:py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            {title}
          </h2>
          <p className="text-text-secondary">
            Sản phẩm được yêu thích nhất
          </p>
        </div>
        <Link
          to="/products"
          className="hidden md:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors no-underline"
        >
          Xem tất cả
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} showDiscount />
        ))}
      </div>

      {/* Mobile "View All" Link */}
      <div className="mt-6 md:hidden text-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors no-underline"
        >
          Xem tất cả sản phẩm
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
};

FeaturedProducts.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string,
      image: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      originalPrice: PropTypes.number,
      discount: PropTypes.number,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      brand: PropTypes.string,
      inStock: PropTypes.bool,
      badge: PropTypes.oneOf(['new', 'hot', 'sale']),
    })
  ),
  title: PropTypes.string,
};

export { ProductCard };
export default FeaturedProducts;
