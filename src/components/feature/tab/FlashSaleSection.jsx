import React, { useState, useEffect } from "react";
import ProductList from "../../common/ProductList";

// 10 sản phẩm mẫu
const defaultProducts = [
  {
    id: 1,
    name: "AK-900 Wired Keyboard",
    image: "https://m.media-amazon.com/images/I/71w6l5pGQbL._AC_UL1500_.jpg",
    price: 960,
    originalPrice: 1160,
    rating: 4,
    reviews: 75,
    isFavorite: false,
    discount: 35,
  },
  {
    id: 2,
    name: "Logitech G502 Mouse",
    image: "https://m.media-amazon.com/images/I/61mpMH5TzkL._AC_UL1500_.jpg",
    price: 120,
    originalPrice: 150,
    rating: 4.5,
    reviews: 120,
    isFavorite: true,
    discount: 20,
  },
  {
    id: 3,
    name: "Samsung 27\" Monitor",
    image: "https://m.media-amazon.com/images/I/81QpkIctqPL._AC_UL1500_.jpg",
    price: 300,
    originalPrice: 350,
    rating: 4.7,
    reviews: 210,
    isFavorite: false,
    discount: 15,
  },
  {
    id: 4,
    name: "Sony WH-1000XM4",
    image: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_UL1500_.jpg",
    price: 250,
    originalPrice: 320,
    rating: 4.8,
    reviews: 340,
    isFavorite: true,
    discount: 22,
  },
  {
    id: 5,
    name: "Apple iPad 10.2\"",
    image: "https://m.media-amazon.com/images/I/61NGnpjoRDL._AC_UL1500_.jpg",
    price: 400,
    originalPrice: 450,
    rating: 4.6,
    reviews: 180,
    isFavorite: false,
    discount: 11,
  },
  {
    id: 6,
    name: "JBL Flip 6 Speaker",
    image: "https://m.media-amazon.com/images/I/71+F7lFQKGL._AC_UL1500_.jpg",
    price: 99,
    originalPrice: 129,
    rating: 4.4,
    reviews: 95,
    isFavorite: false,
    discount: 23,
  },
  {
    id: 7,
    name: "Canon EOS M50",
    image: "https://m.media-amazon.com/images/I/81E5g5l5QbL._AC_UL1500_.jpg",
    price: 650,
    originalPrice: 750,
    rating: 4.5,
    reviews: 60,
    isFavorite: true,
    discount: 13,
  },
  {
    id: 8,
    name: "Nintendo Switch",
    image: "https://m.media-amazon.com/images/I/61-PblYntsL._AC_UL1500_.jpg",
    price: 299,
    originalPrice: 349,
    rating: 4.9,
    reviews: 500,
    isFavorite: false,
    discount: 14,
  },
  {
    id: 9,
    name: "Dell XPS 13",
    image: "https://m.media-amazon.com/images/I/71w6l5pGQbL._AC_UL1500_.jpg",
    price: 1200,
    originalPrice: 1350,
    rating: 4.7,
    reviews: 80,
    isFavorite: false,
    discount: 11,
  },
  {
    id: 10,
    name: "GoPro HERO10",
    image: "https://m.media-amazon.com/images/I/71QKQwQdKDL._AC_UL1500_.jpg",
    price: 399,
    originalPrice: 499,
    rating: 4.6,
    reviews: 110,
    isFavorite: true,
    discount: 20,
  },
];

const PRODUCTS_PER_PAGE = 4;

const FlashSaleSection = ({ products = defaultProducts }) => {
  // Countdown logic (demo)
  const [seconds, setSeconds] = useState(59);
  const [minutes, setMinutes] = useState(59);
  const [hours, setHours] = useState(23);
  const [days, setDays] = useState(1);

  // Pagination
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 59));
      if (seconds === 0) {
        setMinutes((m) => (m > 0 ? m - 1 : 59));
        if (minutes === 0) {
          setHours((h) => (h > 0 ? h - 1 : 23));
          if (hours === 0) setDays((d) => (d > 0 ? d - 1 : 0));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, minutes, hours, days]);

  const formatTime = (n) => n.toString().padStart(2, "0");

  // Lấy sản phẩm cho trang hiện tại
  const pagedProducts = products.slice(
    page * PRODUCTS_PER_PAGE,
    page * PRODUCTS_PER_PAGE + PRODUCTS_PER_PAGE
  );

  const handlePrev = () => setPage((p) => (p > 0 ? p - 1 : totalPages - 1));
  const handleNext = () => setPage((p) => (p < totalPages - 1 ? p + 1 : 0));

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-10 mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* Left: Label + Title */}
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span className="bg-red-500 rounded-l h-6 w-1 mr-2"></span>
            <span className="text-red-600 font-bold text-lg">Today's</span>
          </div>
          <h2 className="font-extrabold text-3xl text-black mb-2">Flash Sales</h2>
        </div>
        {/* Countdown */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex gap-4 items-end">
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl text-black font-bold">{formatTime(days)}</span>
              <span className="text-xs text-gray-500">Days</span>
            </div>
            <span className="font-mono text-lg text-red-500">:</span>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl text-black font-bold">{formatTime(hours)}</span>
              <span className="text-xs text-gray-500">Hours</span>
            </div>
            <span className="font-mono text-lg text-red-500">:</span>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl text-black font-bold">{formatTime(minutes)}</span>
              <span className="text-xs text-gray-500">Minutes</span>
            </div>
            <span className="font-mono text-lg text-red-500">:</span>
            <div className="flex flex-col items-center">
              <span className="font-mono text-2xl text-black font-bold">{formatTime(seconds)}</span>
              <span className="text-xs text-gray-500">Seconds</span>
            </div>
          </div>
        </div>
        {/* Carousel Arrows */}
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            className="bg-white border rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-100 transition"
            onClick={handlePrev}
            aria-label="Previous"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="bg-white border rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-100 transition"
            onClick={handleNext}
            aria-label="Next"
          >
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Product List */}
      <ProductList products={pagedProducts} />
      {/* View All Products */}
      <div className="flex justify-center">
        <button className="bg-red-500 text-white px-8 py-3 rounded font-bold shadow hover:brightness-110 transition-all duration-200 text-lg">
          View All Products
        </button>
      </div>
    </section>
  );
};

export default FlashSaleSection;