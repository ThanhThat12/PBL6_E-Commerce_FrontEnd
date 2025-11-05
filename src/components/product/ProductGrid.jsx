import React from "react";
import { products } from "../../mockProductData";
import colorPattern, { withOpacity } from "../../styles/colorPattern";

function formatVND(number) {
  return Number(number).toLocaleString("vi-VN") + " ₫";
}

export default function ProductGrid({ paginatedProducts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedProducts.map((product) => {
        // For demo, randomly assign a discount between 10% and 30% for some products
        const hasDiscount = Math.random() > 0.7;
        const discountPercent = hasDiscount ? Math.floor(Math.random() * 21) + 10 : 0;
        const originalPrice = hasDiscount
          ? Math.floor(product.price * (1 + discountPercent / 100))
          : product.price;

        return (
          <div
            key={product.id}
            className="group relative bg-white rounded-2xl shadow-md p-6 flex flex-col items-center border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{
              borderColor: colorPattern.borderLight,
              boxShadow: `0 4px 6px ${colorPattern.shadow}`,
            }}
          >
            {/* Discount Tag in the position of the old category tag */}
            {hasDiscount && (
              <div 
                className="absolute -top-2 left-4 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: colorPattern.discount,
                  color: colorPattern.textWhite,
                  boxShadow: `0 2px 4px ${withOpacity(colorPattern.discount, 0.3)}`,
                }}
              >
                -{discountPercent}%
              </div>
            )}

            {/* Favorite Icon */}
            <button 
              className="absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                color: colorPattern.textLight,
                backgroundColor: colorPattern.backgroundGray,
              }}
              onMouseEnter={(e) => {
                e.target.style.color = colorPattern.error;
                e.target.style.backgroundColor = withOpacity(colorPattern.error, 0.1);
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colorPattern.textLight;
                e.target.style.backgroundColor = colorPattern.backgroundGray;
              }}
            >
              <span className="material-icons text-lg">favorite_border</span>
            </button>

            {/* Product Image */}
            <div className="relative mb-4 overflow-hidden rounded-xl">
              <img
                src={product.image}
                alt={product.name}
                className="w-32 h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: colorPattern.backgroundGray }}
              />
            </div>

            {/* Product Info */}
            <div className="w-full text-center space-y-2">
              {/* Product Name */}
              <h3 
                className="font-semibold text-lg truncate px-2"
                style={{ color: colorPattern.text }}
              >
                {product.name}
              </h3>

              {/* Price */}
              <div className="flex items-center justify-center gap-2">
                <span 
                  className="text-xl font-bold"
                  style={{ color: colorPattern.price }}
                >
                  {formatVND(product.price)}
                </span>
                {hasDiscount && (
                  <span 
                    className="text-sm line-through"
                    style={{ color: colorPattern.originalPrice }}
                  >
                    {formatVND(originalPrice)}
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="text-lg"
                    style={{ 
                      color: i < Math.round(product.rating) ? colorPattern.gold : colorPattern.borderLight 
                    }}
                  >
                    ★
                  </span>
                ))}
                <span 
                  className="text-sm font-medium ml-1"
                  style={{ color: colorPattern.textLight }}
                >
                  ({product.rating})
                </span>
              </div>

              {/* Sales Info */}
              <div 
                className="text-xs font-medium"
                style={{ color: colorPattern.textMuted }}
              >
                Đã bán: {product.sold}
              </div>

              {/* Stock Status */}
              <div className="flex items-center justify-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: product.stock > 0 ? colorPattern.inStock : colorPattern.outOfStock
                  }}
                ></div>
                <span
                  className="text-xs font-medium"
                  style={{
                    color: product.stock > 0 ? colorPattern.inStock : colorPattern.outOfStock
                  }}
                >
                  {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full mt-4 space-y-2">
              {/* Add to Cart Button */}
              <button
                className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                style={{
                  backgroundColor: colorPattern.primary,
                  boxShadow: `0 2px 4px ${withOpacity(colorPattern.primary, 0.3)}`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colorPattern.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colorPattern.primary;
                }}
              >
                <span className="material-icons text-sm mr-2">add_shopping_cart</span>
                Thêm vào giỏ
              </button>

              {/* Quick View Button */}
              <button
                className="w-full py-2 px-4 rounded-lg font-medium border transition-all duration-200"
                style={{
                  color: colorPattern.primary,
                  borderColor: colorPattern.primary,
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colorPattern.primary;
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = colorPattern.primary;
                }}
              >
                <span className="material-icons text-sm mr-2">visibility</span>
                Xem nhanh
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}