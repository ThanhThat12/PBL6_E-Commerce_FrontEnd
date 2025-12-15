import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../../common/Button';

/**
 * HeroSection - Banner chính cho trang chủ sàn thương mại đồ thể thao
 * Hỗ trợ slider nhiều banner với auto-play và manual navigation
 * Dễ dàng tích hợp dữ liệu từ backend
 */
const HeroSection = ({ banners = [], autoPlayInterval = 4000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Default banners nếu không có data từ backend
  const defaultBanners = [
    {
      id: 1,
      title: 'Bộ Sưu Tập Thể Thao Mùa Hè 2024',
      subtitle: '🔥 Giảm đến 50% - Miễn phí vận chuyển',
      description: 'Nâng tầm phong cách với thiết bị thể thao chất lượng cao. Hàng nghìn sản phẩm chính hãng.',
      buttonText: 'Mua Ngay',
      buttonLink: '/products',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop',
      bgGradient: 'from-primary-600 via-primary-700 to-primary-800',
      badge: '50% OFF',
    },
    {
      id: 2,
      title: 'Giày Chạy Bộ Cao Cấp 2024',
      subtitle: '⚡ Công nghệ đệm Air - Êm ái vượt trội',
      description: 'Trải nghiệm cảm giác thoải mái tuyệt đối. Thiết kế thời trang, bền bỉ mọi địa hình.',
      buttonText: 'Khám Phá Ngay',
      buttonLink: '/products?category=running-shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
      bgGradient: 'from-secondary-600 via-secondary-700 to-secondary-800',
      badge: 'NEW',
    },
    {
      id: 3,
      title: 'Thiết Bị Gym Chuyên Nghiệp',
      subtitle: '💪 Xây dựng phòng gym tại nhà',
      description: 'Đầy đủ thiết bị tập luyện. Giá tốt nhất thị trường. Bảo hành chính hãng 24 tháng.',
      buttonText: 'Xem Bộ Sưu Tập',
      buttonLink: '/products?category=gym-equipment',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
      bgGradient: 'from-accent-green-600 via-accent-green-700 to-accent-green-800',
      badge: 'HOT',
    },
    {
      id: 4,
      title: 'Bóng Đá & Phụ Kiện',
      subtitle: '⚽ Thương hiệu chính hãng - Giá sốc',
      description: 'Trang phục thi đấu, giày đá banh, quả bóng FIFA Quality. Ưu đãi đặc biệt cho đội nhóm.',
      buttonText: 'Mua Sắm Ngay',
      buttonLink: '/products?category=football',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&h=600&fit=crop',
      bgGradient: 'from-blue-600 via-blue-700 to-blue-800',
      badge: 'SALE',
    },
  ];

  const displayBanners = banners.length > 0 ? banners : defaultBanners;

  // Auto-play slider
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev + 1) % displayBanners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    if (displayBanners.length <= 1) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayInterval, displayBanners.length]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleDotClick = (index) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const currentBanner = displayBanners[activeIndex];

  return (
    <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-strong">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.image}
          alt={currentBanner.title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${currentBanner.bgGradient} opacity-80`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="max-w-2xl">
            <div
              className={`transition-all duration-500 transform ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {/* Subtitle */}
              <p className="text-white/90 text-sm md:text-base font-semibold mb-2 uppercase tracking-wide">
                {currentBanner.subtitle}
              </p>

              {/* Title */}
              <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
                {currentBanner.title}
              </h1>

              {/* Badge */}
              {currentBanner.badge && (
                <span className="inline-block px-4 py-2 bg-secondary-500 text-white font-bold rounded-lg mb-4 shadow-lg animate-pulse">
                  {currentBanner.badge}
                </span>
              )}

              {/* Description */}
              <p className="text-white/95 text-base md:text-lg mb-6 md:mb-8 drop-shadow-md">
                {currentBanner.description}
              </p>

              {/* CTA Button */}
              <Link to={currentBanner.buttonLink}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="shadow-colored-secondary hover:scale-105 transform transition-all duration-300 font-bold"
                >
                  {currentBanner.buttonText}
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {displayBanners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
            aria-label="Previous banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all disabled:opacity-50"
            aria-label="Next banner"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {displayBanners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              disabled={isTransitioning}
              className={`h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

HeroSection.propTypes = {
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
      description: PropTypes.string,
      buttonText: PropTypes.string,
      buttonLink: PropTypes.string,
      image: PropTypes.string.isRequired,
      bgGradient: PropTypes.string,
    })
  ),
  autoPlayInterval: PropTypes.number,
};

export default HeroSection;
