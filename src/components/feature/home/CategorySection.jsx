import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card } from '../../common/Card/Card';

/**
 * CategorySection - Hiển thị danh mục sản phẩm thể thao
 * Dễ dàng tích hợp dữ liệu từ backend API
 */
const CategorySection = ({ categories = [], title = 'Danh Mục Sản Phẩm' }) => {
  // Default categories nếu không có data từ backend
  const defaultCategories = [
    {
      id: 1,
      name: 'Bóng Đá',
      slug: 'bong-da',
      image: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=300&fit=crop',
      productCount: 156,
      icon: '⚽',
    },
    {
      id: 2,
      name: 'Bóng Rổ',
      slug: 'bong-ro',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=300&fit=crop',
      productCount: 89,
      icon: '🏀',
    },
    {
      id: 3,
      name: 'Tennis',
      slug: 'tennis',
      image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=300&fit=crop',
      productCount: 72,
      icon: '🎾',
    },
    {
      id: 4,
      name: 'Chạy Bộ',
      slug: 'chay-bo',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop',
      productCount: 124,
      icon: '🏃',
    },
    {
      id: 5,
      name: 'Gym & Fitness',
      slug: 'gym-fitness',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      productCount: 203,
      icon: '💪',
    },
    {
      id: 6,
      name: 'Bơi Lội',
      slug: 'boi-loi',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=300&fit=crop',
      productCount: 45,
      icon: '🏊',
    },
    {
      id: 7,
      name: 'Yoga',
      slug: 'yoga',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      productCount: 67,
      icon: '🧘',
    },
    {
      id: 8,
      name: 'Phụ Kiện',
      slug: 'phu-kien',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400&h=300&fit=crop',
      productCount: 189,
      icon: '🎒',
    },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  console.log('🏷️  CategorySection component:');
  console.log('Categories prop received:', categories.length, 'items');
  console.log('Categories array:', categories);
  console.log('Display categories:', displayCategories.length, 'items');

  return (
    <section className="py-4 md:py-6">
      <div className="overflow-x-auto">
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[minmax(110px,1fr)] gap-2.5 md:gap-3 py-1">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group no-underline"
            >
              <Card
                hoverable
                shadow="soft"
                padding="none"
                className="overflow-hidden h-full"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-1.5 right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center text-base shadow-medium">
                    {category.icon}
                  </div>
                </div>

                <div className="px-2.5 py-2">
                  <h3 className="text-xs md:text-sm font-semibold text-text-primary mb-0.5 group-hover:text-primary-600 transition-colors truncate">
                    {category.name}
                  </h3>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

CategorySection.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      icon: PropTypes.string,
    })
  ),
  title: PropTypes.string,
};

export default CategorySection;
