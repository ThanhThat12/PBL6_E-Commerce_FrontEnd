import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ProductCard } from './FeaturedProducts';

/**
 * FlashDeals - Component flash sale với countdown timer
 * Dễ dàng tích hợp dữ liệu từ backend API
 */
const FlashDeals = ({ 
  products = [], 
  title = '⚡ Flash Sale',
  endTime, // ISO string hoặc timestamp từ backend
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Default flash sale products nếu không có data từ backend
  const defaultProducts = [
    {
      id: 'fs1',
      name: 'Giày Chạy Bộ Nike React Infinity Run',
      slug: 'nike-react-infinity-run',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
      price: 2390000,
      originalPrice: 3990000,
      rating: 4.8,
      reviewCount: 342,
      brand: 'Nike',
      inStock: true,
      badge: 'sale',
    },
    {
      id: 'fs2',
      name: 'Áo Khoác Gió Adidas Terrex',
      slug: 'adidas-terrex-jacket',
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      price: 1490000,
      originalPrice: 2490000,
      rating: 4.6,
      reviewCount: 187,
      brand: 'Adidas',
      inStock: true,
      badge: 'sale',
    },
    {
      id: 'fs3',
      name: 'Quần Short Gym Puma Performance',
      slug: 'puma-performance-shorts',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop',
      price: 590000,
      originalPrice: 990000,
      rating: 4.5,
      reviewCount: 234,
      brand: 'Puma',
      inStock: true,
      badge: 'sale',
    },
    {
      id: 'fs4',
      name: 'Găng Tay Tập Gym Under Armour',
      slug: 'under-armour-gym-gloves',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
      price: 390000,
      originalPrice: 690000,
      rating: 4.7,
      reviewCount: 156,
      brand: 'Under Armour',
      inStock: true,
      badge: 'sale',
    },
  ];

  const displayProducts = products.length > 0 ? products : defaultProducts;


  // Countdown timer
  useEffect(() => {
    // Nếu không có endTime từ backend, dùng default 6 giờ từ bây giờ
    const defaultEndTime = endTime || new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    
    const calculateTimeLeft = () => {
      const difference = new Date(defaultEndTime) - new Date();
      
      if (difference > 0) {
        return {
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      
      return { hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (time) => String(time).padStart(2, '0');

  return (
    <section className="py-8 md:py-12">
      {/* Header with Countdown */}
      <div className="bg-gradient-secondary rounded-2xl p-6 md:p-8 mb-6 shadow-colored-secondary">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {title}
            </h2>
            <p className="text-white/90">
              Giảm giá khủng - Số lượng có hạn
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-3">
            <span className="text-white/90 font-semibold hidden md:inline">
              Kết thúc sau:
            </span>
            <div className="flex gap-2">
              {/* Hours */}
              <div className="bg-white rounded-lg p-3 min-w-[60px] text-center shadow-medium">
                <div className="text-2xl font-bold text-secondary-600">
                  {formatTime(timeLeft.hours)}
                </div>
                <div className="text-xs text-text-tertiary uppercase">Giờ</div>
              </div>
              
              {/* Separator */}
              <div className="flex items-center text-white text-2xl font-bold">:</div>
              
              {/* Minutes */}
              <div className="bg-white rounded-lg p-3 min-w-[60px] text-center shadow-medium">
                <div className="text-2xl font-bold text-secondary-600">
                  {formatTime(timeLeft.minutes)}
                </div>
                <div className="text-xs text-text-tertiary uppercase">Phút</div>
              </div>
              
              {/* Separator */}
              <div className="flex items-center text-white text-2xl font-bold">:</div>
              
              {/* Seconds */}
              <div className="bg-white rounded-lg p-3 min-w-[60px] text-center shadow-medium">
                <div className="text-2xl font-bold text-secondary-600">
                  {formatTime(timeLeft.seconds)}
                </div>
                <div className="text-xs text-text-tertiary uppercase">Giây</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} showDiscount />
        ))}
      </div>
    </section>
  );
};

FlashDeals.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string,
      image: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      originalPrice: PropTypes.number,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      brand: PropTypes.string,
      inStock: PropTypes.bool,
      badge: PropTypes.oneOf(['new', 'hot', 'sale']),
    })
  ),
  title: PropTypes.string,
  endTime: PropTypes.string, // ISO string hoặc timestamp
};

export default FlashDeals;
