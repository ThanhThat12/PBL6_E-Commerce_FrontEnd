import React from 'react';
import { 
  TruckIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

/**
 * ServiceFeatures - Tính năng dịch vụ nổi bật
 * Highlights của SportZone
 */
const ServiceFeatures = () => {
  const features = [
    {
      id: 1,
      icon: TruckIcon,
      title: 'Miễn Phí Vận Chuyển',
      description: 'Cho đơn hàng trên 500.000₫',
      color: 'primary',
      bgGradient: 'from-primary-500 to-primary-600',
    },
    {
      id: 2,
      icon: ShieldCheckIcon,
      title: 'Hàng Chính Hãng 100%',
      description: 'Cam kết chất lượng',
      color: 'accent-green',
      bgGradient: 'from-accent-green-500 to-accent-green-600',
    },
    {
      id: 3,
      icon: ClockIcon,
      title: 'Giao Hàng Nhanh',
      description: '2-3 ngày toàn quốc',
      color: 'secondary',
      bgGradient: 'from-secondary-500 to-secondary-600',
    },
    {
      id: 4,
      icon: GiftIcon,
      title: 'Ưu Đãi Hấp Dẫn',
      description: 'Khuyến mãi mỗi ngày',
      color: 'accent-red',
      bgGradient: 'from-accent-red-500 to-accent-red-600',
    },
    {
      id: 5,
      icon: ChatBubbleLeftRightIcon,
      title: 'Hỗ Trợ 24/7',
      description: 'Tư vấn nhiệt tình',
      color: 'accent-purple',
      bgGradient: 'from-accent-purple-500 to-accent-purple-600',
    },
    {
      id: 6,
      icon: CreditCardIcon,
      title: 'Thanh Toán Đa Dạng',
      description: 'COD, Ví, Thẻ, Chuyển khoản',
      color: 'primary',
      bgGradient: 'from-primary-400 to-primary-500',
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background-secondary via-white to-background-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-3">
            Tại Sao Chọn SportZone?
          </h2>
          <p className="text-lg text-text-secondary">
            Trải nghiệm mua sắm tốt nhất dành cho bạn
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="
                  group
                  relative
                  bg-white
                  rounded-2xl
                  p-6
                  shadow-soft
                  hover:shadow-strong
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  overflow-hidden
                "
              >
                {/* Background Gradient on Hover */}
                <div className={`
                  absolute
                  inset-0
                  bg-gradient-to-br
                  ${feature.bgGradient}
                  opacity-0
                  group-hover:opacity-5
                  transition-opacity
                  duration-300
                `}></div>

                {/* Content */}
                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0
                    w-14
                    h-14
                    rounded-xl
                    bg-gradient-to-br
                    ${feature.bgGradient}
                    flex
                    items-center
                    justify-center
                    shadow-colored-primary
                    group-hover:scale-110
                    transition-transform
                    duration-300
                  `}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-primary-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-block p-8 bg-gradient-primary rounded-2xl shadow-colored-primary">
            <p className="text-white text-lg mb-4">
              🎉 <strong>Đăng ký ngay</strong> để nhận ưu đãi đặc biệt lên đến <strong className="text-2xl">50%</strong>
            </p>
            <button className="
              px-8
              py-3
              bg-white
              text-primary-600
              font-bold
              rounded-lg
              hover:bg-primary-50
              hover:scale-105
              transition-all
              duration-300
              shadow-strong
            ">
              Đăng Ký Ngay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceFeatures;
