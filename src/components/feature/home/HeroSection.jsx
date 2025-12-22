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
      subtitle: 'Giảm giá lên đến 50% cho tất cả sản phẩm',
      description: 'Nâng tầm phong cách thể thao của bạn với các thiết bị chất lượng cao',
      buttonText: 'Mua Ngay',
      buttonLink: '/products?category=summer-collection',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop',
      bgGradient: 'from-primary-500 to-primary-700',
    },
    {
      id: 2,
      title: 'Giày Chạy Bộ Cao Cấp',
      subtitle: 'Công nghệ đệm mới nhất - Thoải mái vượt trội',
      description: 'Trải nghiệm cảm giác êm ái trong từng bước chạy',
      buttonText: 'Khám Phá',
      buttonLink: '/products?category=running-shoes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=600&fit=crop',
      bgGradient: 'from-secondary-500 to-secondary-700',
    },
    {
      id: 3,
      title: 'Phụ Kiện Tập Gym',
      subtitle: 'Hoàn thiện phòng gym tại nhà của bạn',
      description: 'Thiết bị chuyên nghiệp, giá cả phải chăng',
      buttonText: 'Xem Thêm',
      buttonLink: '/products?category=gym-equipment',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=600&fit=crop',
      bgGradient: 'from-accent-green-500 to-accent-green-700',
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
    <section className="relative w-full h-[260px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden shadow-strong">
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

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 md:gap-6 items-stretch">
            <div className="max-w-2xl self-center">
              <div
                className={`transition-all duration-500 transform ${
                  isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
                }`}
              >
                <p className="text-white/90 text-sm md:text-base font-semibold mb-2 uppercase tracking-wide">
                  {currentBanner.subtitle}
                </p>
                <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  {currentBanner.title}
                </h1>
                <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8">
                  {currentBanner.description}
                </p>
                <Link to={currentBanner.buttonLink}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="shadow-colored-secondary hover:scale-105 transform transition-transform"
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
            <div className="hidden md:flex flex-col gap-3 lg:gap-4 h-full">
              <Link
                to="/products?tag=qr-deal"
                className="relative flex-1 rounded-2xl overflow-hidden bg-white/95 shadow-soft hover:shadow-medium transition-shadow no-underline"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-sky-600 opacity-90" />
                <div className="relative h-full flex items-center px-4 md:px-5">
                  <div className="flex-1 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1">Thanh toán QR</p>
                    <p className="text-lg font-bold leading-snug mb-1">Giảm ngay 50%</p>
                    <p className="text-xs text-white/90">Áp dụng cho nhiều ngân hàng</p>
                  </div>
                  <div className="hidden lg:block w-20 h-20 rounded-xl bg-white/10 border border-white/30" />
                </div>
              </Link>
              <Link
                to="/products?tag=personal-care"
                className="relative flex-1 rounded-2xl overflow-hidden bg-white/95 shadow-soft hover:shadow-medium transition-shadow no-underline"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-90" />
                <div className="relative h-full flex items-center px-4 md:px-5">
                  <div className="flex-1 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1">Ưu đãi tháng này</p>
                    <p className="text-lg font-bold leading-snug mb-1">Deal chăm sóc cơ thể</p>
                    <p className="text-xs text-white/90">Giảm sâu sản phẩm thiết yếu</p>
                  </div>
                  <div className="hidden lg:block w-20 h-20 rounded-xl bg-white/10 border border-white/30" />
                </div>
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
