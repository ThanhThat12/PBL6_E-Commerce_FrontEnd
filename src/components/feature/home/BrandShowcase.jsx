import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * BrandShowcase - Hiển thị các thương hiệu thể thao nổi tiếng
 * Dễ dàng tích hợp dữ liệu từ backend API
 */
const BrandShowcase = ({ brands = [], title = 'Thương Hiệu Nổi Bật' }) => {
  // Default brands nếu không có data từ backend
  const defaultBrands = [
    {
      id: 1,
      name: 'Nike',
      slug: 'nike',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
      description: 'Just Do It',
    },
    {
      id: 2,
      name: 'Adidas',
      slug: 'adidas',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
      description: 'Impossible is Nothing',
    },
    {
      id: 3,
      name: 'Puma',
      slug: 'puma',
      logo: 'https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg',
      description: 'Forever Faster',
    },
    {
      id: 4,
      name: 'Under Armour',
      slug: 'under-armour',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg',
      description: 'I Will',
    },
    {
      id: 5,
      name: 'New Balance',
      slug: 'new-balance',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg',
      description: 'Run Your Way',
    },
    {
      id: 6,
      name: 'Reebok',
      slug: 'reebok',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Reebok_red_logo.svg',
      description: 'Be More Human',
    },
  ];

  const displayBrands = brands.length > 0 ? brands : defaultBrands;

  return (
    <section className="py-8 md:py-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-secondary">
          Sản phẩm chính hãng từ các thương hiệu hàng đầu thế giới
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {displayBrands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brand/${brand.slug}`}
            className="group"
          >
            <div className="bg-white border border-border-light rounded-xl p-6 md:p-8 flex items-center justify-center hover:shadow-medium hover:border-primary-300 hover:-translate-y-1 transition-all duration-200">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-auto max-h-12 object-contain filter grayscale group-hover:grayscale-0 transition-all duration-200"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-12 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 md:p-12 text-center shadow-colored-primary">
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Trở Thành Đối Tác Của Chúng Tôi
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Mở rộng thị trường và tiếp cận hàng triệu khách hàng yêu thể thao trên toàn quốc
        </p>
        <Link
          to="/become-vendor"
          className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-medium"
        >
          Đăng Ký Ngay
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
};

BrandShowcase.propTypes = {
  brands: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      logo: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  title: PropTypes.string,
};

export default BrandShowcase;
