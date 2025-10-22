import React from 'react';
import { 
  ShoppingBagIcon, 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  InboxIcon,
  HeartIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

/**
 * EmptyState Component - Hiển thị trạng thái trống với icon và message
 * 
 * @param {string} type - Loại empty state: 'cart', 'search', 'wishlist', 'order', 'error', 'default'
 * @param {string} title - Tiêu đề chính
 * @param {string} description - Mô tả chi tiết
 * @param {React.ReactNode} action - Button hoặc action element
 * @param {React.ReactNode} icon - Custom icon (optional)
 * @param {string} size - Kích thước: 'sm', 'md', 'lg'
 */
const EmptyState = ({ 
  type = 'default',
  title,
  description,
  action,
  icon: CustomIcon,
  size = 'md'
}) => {
  // Cấu hình cho từng loại empty state
  const configs = {
    cart: {
      icon: ShoppingBagIcon,
      defaultTitle: 'Giỏ hàng trống',
      defaultDescription: 'Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá và thêm sản phẩm yêu thích!',
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-50'
    },
    search: {
      icon: MagnifyingGlassIcon,
      defaultTitle: 'Không tìm thấy kết quả',
      defaultDescription: 'Không tìm thấy sản phẩm phù hợp với từ khóa tìm kiếm. Hãy thử với từ khóa khác!',
      iconColor: 'text-neutral-500',
      bgColor: 'bg-neutral-50'
    },
    wishlist: {
      icon: HeartIcon,
      defaultTitle: 'Danh sách yêu thích trống',
      defaultDescription: 'Bạn chưa có sản phẩm nào trong danh sách yêu thích. Khám phá và lưu những sản phẩm bạn yêu thích!',
      iconColor: 'text-accent-red-500',
      bgColor: 'bg-accent-red-50'
    },
    order: {
      icon: ClipboardDocumentListIcon,
      defaultTitle: 'Chưa có đơn hàng',
      defaultDescription: 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!',
      iconColor: 'text-secondary-500',
      bgColor: 'bg-secondary-50'
    },
    error: {
      icon: ExclamationTriangleIcon,
      defaultTitle: 'Có lỗi xảy ra',
      defaultDescription: 'Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!',
      iconColor: 'text-error',
      bgColor: 'bg-accent-red-50'
    },
    default: {
      icon: InboxIcon,
      defaultTitle: 'Không có dữ liệu',
      defaultDescription: 'Chưa có dữ liệu để hiển thị.',
      iconColor: 'text-neutral-500',
      bgColor: 'bg-neutral-50'
    }
  };

  const config = configs[type] || configs.default;
  const Icon = CustomIcon || config.icon;

  // Cấu hình size
  const sizeConfig = {
    sm: {
      container: 'py-8',
      iconWrapper: 'w-16 h-16 mb-3',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm',
      maxWidth: 'max-w-sm'
    },
    md: {
      container: 'py-12',
      iconWrapper: 'w-20 h-20 mb-4',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-base',
      maxWidth: 'max-w-md'
    },
    lg: {
      container: 'py-16',
      iconWrapper: 'w-24 h-24 mb-6',
      icon: 'w-12 h-12',
      title: 'text-2xl',
      description: 'text-lg',
      maxWidth: 'max-w-lg'
    }
  };

  const sizeClasses = sizeConfig[size] || sizeConfig.md;

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses.container} ${sizeClasses.maxWidth} mx-auto text-center`}>
      {/* Icon Container */}
      <div className={`
        ${sizeClasses.iconWrapper}
        ${config.bgColor}
        rounded-full
        flex items-center justify-center
        transition-all duration-300
        group-hover:scale-110
      `}>
        <Icon className={`${sizeClasses.icon} ${config.iconColor}`} />
      </div>

      {/* Title */}
      <h3 className={`
        ${sizeClasses.title}
        font-bold
        text-text-primary
        mb-2
      `}>
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className={`
        ${sizeClasses.description}
        text-text-secondary
        mb-6
        leading-relaxed
      `}>
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
