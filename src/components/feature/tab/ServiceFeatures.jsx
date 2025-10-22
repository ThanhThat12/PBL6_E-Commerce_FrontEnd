import React from "react";

/**
 * ServiceFeatures - Hiển thị các tính năng dịch vụ của sàn thương mại
 * Sử dụng Tailwind colors từ config
 */
const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
      </svg>
    ),
    title: "Miễn Phí Vận Chuyển",
    desc: "Đơn hàng trên 500.000₫",
    color: "text-accent-green-500",
    bgColor: "bg-accent-green-50",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: "Hỗ Trợ 24/7",
    desc: "Tư vấn tận tâm mọi lúc",
    color: "text-primary-500",
    bgColor: "bg-primary-50",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Đổi Trả Dễ Dàng",
    desc: "Trong vòng 30 ngày",
    color: "text-secondary-500",
    bgColor: "bg-secondary-50",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: "Thanh Toán An Toàn",
    desc: "Bảo mật 100%",
    color: "text-accent-purple-500",
    bgColor: "bg-accent-purple-50",
  },
];

const ServiceFeatures = () => (
  <section className="py-8 md:py-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, idx) => (
        <div 
          key={idx} 
          className="bg-white border border-border-light rounded-xl p-6 hover:shadow-medium hover:-translate-y-1 transition-all duration-200"
        >
          <div className="flex flex-col items-center text-center">
            {/* Icon with colored background */}
            <div className={`${feature.bgColor} ${feature.color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}>
              {feature.icon}
            </div>
            
            {/* Title */}
            <h3 className="font-bold text-lg text-text-primary mb-2">
              {feature.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-text-secondary">
              {feature.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ServiceFeatures;