import React from "react";
import colorPattern, { withOpacity } from "../../styles/colorPattern";

export default function ProductTopBar({
  filteredProducts,
  selectedCategories,
  handleCategoryChange,
  setSelectedCategories
}) {
  return (
    <div 
      className="mb-6 p-4 rounded-xl"
      style={{ 
        backgroundColor: colorPattern.background,
        border: `1px solid ${colorPattern.borderLight}`,
        boxShadow: `0 2px 4px ${colorPattern.shadow}`
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-xl font-bold mb-1"
            style={{ color: colorPattern.text }}
          >
            Sản phẩm thể thao
          </h2>
          <p 
            className="text-sm"
            style={{ color: colorPattern.textLight }}
          >
            Tìm thấy {filteredProducts.length} sản phẩm
            {selectedCategories.length > 0 && (
              <span style={{ color: colorPattern.primary }}>
                {" "}trong danh mục: {selectedCategories.join(", ")}
              </span>
            )}
          </p>
        </div>
        
        {/* Clear Filters Button */}
        {selectedCategories.length > 0 && (
          <button
            className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
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
            onClick={() => setSelectedCategories([])}
          >
            <span className="material-icons text-sm mr-2">clear</span>
            Xóa bộ lọc
          </button>
        )}
      </div>
      
      {/* Active Filters */}
      {selectedCategories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedCategories.map(category => (
            <span
              key={category}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: withOpacity(colorPattern.primary, 0.1),
                color: colorPattern.primary,
                border: `1px solid ${withOpacity(colorPattern.primary, 0.2)}`
              }}
            >
              {category}
              <button
                className="ml-2 hover:scale-110 transition-transform"
                onClick={() => handleCategoryChange(category)}
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}