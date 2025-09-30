import React, { useEffect, useState } from "react";
import colorPattern from "../../../styles/colorPattern";

const appleLogo =
  "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg";

const banners = [
  {
    img: "https://www.apple.com/v/iphone-14/i/images/overview/hero/hero_purple__e6khcva4hkeq_large.jpg",
    title: "iPhone 14 Series",
    subtitle: "Up to 10% off Voucher",
    active: true,
  },
  {
    img: "https://www.apple.com/v/iphone-14/i/images/overview/hero/hero_yellow__e6khcva4hkeq_large.jpg",
    title: "iPhone 14 Yellow",
    subtitle: "Special Edition Discount",
    active: false,
  },
  {
    img: "https://www.apple.com/v/iphone-14/i/images/overview/hero/hero_blue__e6khcva4hkeq_large.jpg",
    title: "iPhone 14 Blue",
    subtitle: "Limited Time Offer",
    active: false,
  },
  {
    img: "https://www.apple.com/v/iphone-14/i/images/overview/hero/hero_red__e6khcva4hkeq_large.jpg",
    title: "iPhone 14 Red",
    subtitle: "Exclusive Red Deal",
    active: false,
  },
];

const PromoBanner = ({ onShopClick }) => {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hiệu ứng fade khi chuyển banner
  const handleDotClick = (idx) => {
    if (idx === activeIdx) return;
    setFade(false); // Bắt đầu fade out
    setTimeout(() => {
      setActiveIdx(idx);
      setFade(true); // Fade in banner mới
    }, 350); // Thời gian fade out (ms)
  };

  const banner = banners[activeIdx];

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden flex flex-row items-center justify-between py-12 px-8 transition-all duration-700 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ 
        minHeight: "340px",
        background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryDark} 100%)`
      }}
    >
      {/* Left: Logo + Text */}
      <div
        className={`flex flex-col justify-center h-full z-10 md:w-1/2 w-full transition-all duration-500 ${
          fade ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8 pointer-events-none"
        }`}
      >
        <div className="flex items-center mb-6">
          <img
            src={appleLogo}
            alt="Apple Logo"
            className="w-[40px] h-[40px] mr-4"
            style={{ filter: "invert(1)" }}
          />
          <span 
            className="font-sans text-xl md:text-2xl font-semibold"
            style={{ color: colorPattern.textWhite }}
          >
            {banner.title}
          </span>
        </div>
        <div className="mb-8">
          <span 
            className="font-extrabold text-4xl md:text-5xl leading-tight block"
            style={{ color: colorPattern.textWhite }}
          >
            {banner.subtitle}
          </span>
        </div>
        <button
          className="flex items-center gap-2 bg-transparent text-lg font-semibold underline underline-offset-4 transition w-fit"
          style={{ 
            color: colorPattern.textWhite,
          }}
          onMouseEnter={(e) => {
            e.target.style.color = colorPattern.secondary;
          }}
          onMouseLeave={(e) => {
            e.target.style.color = colorPattern.textWhite;
          }}
          onClick={onShopClick}
        >
          Shop Now
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Right: iPhone Image */}
      <div className={`flex-1 flex items-center justify-center relative transition-all duration-500 ${fade ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8 pointer-events-none"}`}>
        <img
          src={banner.img}
          alt={banner.title}
          className="relative z-10 max-h-[260px] md:max-h-[340px] object-contain"
        />
      </div>

      {/* Dots dưới cùng (carousel indicators) */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center items-center space-x-3">
        {banners.map((b, i) => (
          <button
            key={i}
            className="w-4 h-4 rounded-full border-0 focus:outline-none transition-all"
            style={{
              backgroundColor: i === activeIdx ? colorPattern.secondary : colorPattern.textMuted,
              boxShadow: i === activeIdx ? `0 0 0 2px ${colorPattern.secondaryLight}` : 'none',
            }}
            onClick={() => handleDotClick(i)}
            aria-label={`Show banner ${i + 1}`}
            type="button"
          ></button>
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;