
import React, { useState, useEffect } from "react";
import ProductList from "../../common/ProductList";
import { flashSaleProducts } from '../../../mockDataFlashSale';

const PRODUCTS_PER_PAGE = 4;

const FlashSaleSection = ({ products = flashSaleProducts }) => {
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