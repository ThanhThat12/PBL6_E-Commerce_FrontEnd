import React from "react";
import colorPattern from "../../../styles/colorPattern";

const features = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M3 3h18v18H3V3z" stroke="currentColor" />
        <path d="M8 21V8h8v13" stroke="currentColor" />
      </svg>
    ),
    title: "Free Shipping",
    desc: "Order above $200",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
        <path d="M12 6v6l4 2" stroke="currentColor" />
      </svg>
    ),
    title: "24/7 Support",
    desc: "Dedicated support",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
        <path d="M16 3v4a2 2 0 01-2 2H6" stroke="currentColor" />
      </svg>
    ),
    title: "Money Back",
    desc: "Within 30 days",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" />
        <path d="M8 12l2 2 4-4" stroke="currentColor" />
      </svg>
    ),
    title: "Secure Payment",
    desc: "100% secure payment",
  },
];

const ServiceFeatures = () => (
  <section 
    className="rounded-xl shadow p-6 md:p-10 mb-8"
    style={{ 
      backgroundColor: colorPattern.background,
      boxShadow: `0 4px 16px ${colorPattern.shadow}`,
    }}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {features.map((f, idx) => (
        <div key={idx} className="flex flex-col items-center text-center p-4">
          <div 
            className="mb-3"
            style={{ color: colorPattern.primary }}
          >
            {f.icon}
          </div>
          <div 
            className="font-bold text-lg mb-1"
            style={{ color: colorPattern.text }}
          >
            {f.title}
          </div>
          <div 
            className="text-sm"
            style={{ color: colorPattern.textLight }}
          >
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ServiceFeatures;