import React, { useState, useEffect } from "react";
import colorPattern from "../../../styles/colorPattern";
import ProductList from "../../common/ProductList";
import { addToCart } from '../../../services/cartService';
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

  const handleAddToCart = async (product) => {
    console.log("handleAddToCart called", product);
    try {
      console.log("Calling addToCart from handleAddToCart", product.id, 1);
      const result = await addToCart(product.id, 1);
      console.log("addToCart resolved", result);
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("addToCart error", error);
      alert("Thêm vào giỏ hàng thất bại!");
    }
  };
  return (
    <section 
      className="rounded-xl shadow p-6 md:p-10 mb-8"
      style={{ 
        backgroundColor: colorPattern.background,
        boxShadow: `0 4px 16px ${colorPattern.shadow}`,
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* Left: Label + Title */}
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <span 
              className="rounded-l h-6 w-1 mr-2"
              style={{ backgroundColor: colorPattern.secondary }}
            ></span>
            <span 
              className="font-bold text-lg"
              style={{ color: colorPattern.secondary }}
            >
              Today's
            </span>
          </div>
          <h2 
            className="font-extrabold text-3xl mb-2"
            style={{ color: colorPattern.text }}
          >
            Flash Sales
          </h2>
        </div>
        {/* Countdown */}
        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex gap-4 items-end">
            <div className="flex flex-col items-center">
              <span 
                className="font-mono text-2xl font-bold"
                style={{ color: colorPattern.text }}
              >
                {formatTime(days)}
              </span>
              <span 
                className="text-xs"
                style={{ color: colorPattern.textLight }}
              >
                Days
              </span>
            </div>
            <span 
              className="font-mono text-lg"
              style={{ color: colorPattern.secondary }}
            >
              :
            </span>
            <div className="flex flex-col items-center">
              <span 
                className="font-mono text-2xl font-bold"
                style={{ color: colorPattern.text }}
              >
                {formatTime(hours)}
              </span>
              <span 
                className="text-xs"
                style={{ color: colorPattern.textLight }}
              >
                Hours
              </span>
            </div>
            <span 
              className="font-mono text-lg"
              style={{ color: colorPattern.secondary }}
            >
              :
            </span>
            <div className="flex flex-col items-center">
              <span 
                className="font-mono text-2xl font-bold"
                style={{ color: colorPattern.text }}
              >
                {formatTime(minutes)}
              </span>
              <span 
                className="text-xs"
                style={{ color: colorPattern.textLight }}
              >
                Minutes
              </span>
            </div>
            <span 
              className="font-mono text-lg"
              style={{ color: colorPattern.secondary }}
            >
              :
            </span>
            <div className="flex flex-col items-center">
              <span 
                className="font-mono text-2xl font-bold"
                style={{ color: colorPattern.text }}
              >
                {formatTime(seconds)}
              </span>
              <span 
                className="text-xs"
                style={{ color: colorPattern.textLight }}
              >
                Seconds
              </span>
            </div>
          </div>
        </div>
        {/* Carousel Arrows */}
        <div className="flex gap-2 mt-4 md:mt-0">
          <button
            className="border rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            style={{
              backgroundColor: colorPattern.background,
              borderColor: colorPattern.border,
              color: colorPattern.text,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colorPattern.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colorPattern.background;
            }}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="border rounded-full w-10 h-10 flex items-center justify-center shadow transition"
            style={{
              backgroundColor: colorPattern.background,
              borderColor: colorPattern.border,
              color: colorPattern.text,
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colorPattern.hover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colorPattern.background;
            }}
            onClick={handleNext}
            aria-label="Next"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Product List */}
  <ProductList products={pagedProducts} onAddToCart={handleAddToCart} showAddToCart />
      {/* View All Products */}
      <div className="flex justify-center">
        <button 
          className="px-8 py-3 rounded font-bold shadow transition-all duration-200 text-lg"
          style={{
            backgroundColor: colorPattern.secondary,
            color: colorPattern.textWhite,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colorPattern.secondaryDark;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colorPattern.secondary;
          }}
        >
          View All Products
        </button>
      </div>
    </section>
  );
};

export default FlashSaleSection;