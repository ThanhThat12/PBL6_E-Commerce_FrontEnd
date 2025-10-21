import React, { useState, useEffect } from "react";
import { categories, locations, conditions, ratings, products } from "../../mockProductData";
import ProductSidebar from "../../components/product/ProductSidebar";
import ProductTopBar from "../../components/product/ProductTopBar";
import ProductGrid from "../../components/product/ProductGrid";
import colorPattern, { withOpacity } from "../../styles/colorPattern";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/layout/footer/Footer";

const PRODUCTS_PER_PAGE = 9;

export default function ProductByCategoryPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategoryChange = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Filter products by selected categories
  const filteredProducts = selectedCategories.length === 0
    ? products
    : products.filter(product => selectedCategories.includes(product.category));

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  // Checkbox handlers
  const handleLocationChange = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc)
        ? prev.filter((l) => l !== loc)
        : [...prev, loc]
    );
  };

  const handleConditionChange = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond)
        ? prev.filter((c) => c !== cond)
        : [...prev, cond]
    );
  };

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colorPattern.backgroundGray }}>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-8 px-6 py-8 max-w-7xl mx-auto">
        {/* Sidebar */}
        <ProductSidebar
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedLocations={selectedLocations}
          setSelectedLocations={setSelectedLocations}
          selectedConditions={selectedConditions}
          setSelectedConditions={setSelectedConditions}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          handleLocationChange={handleLocationChange}
          handleConditionChange={handleConditionChange}
          handleCategoryChange={handleCategoryChange}
        />
        {/* Product Grid Section */}
        <main className="flex-1">
          <ProductTopBar
            filteredProducts={filteredProducts}
            selectedCategories={selectedCategories}
            handleCategoryChange={handleCategoryChange}
            setSelectedCategories={setSelectedCategories}
          />
          <ProductGrid paginatedProducts={paginatedProducts} />
          {/* Pagination */}
          {totalPages > 1 && (
            <div 
              className="flex justify-center items-center mt-8 gap-2 p-4 rounded-xl"
              style={{ 
                backgroundColor: colorPattern.background,
                boxShadow: `0 2px 4px ${colorPattern.shadow}`
              }}
            >
              <button
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: currentPage === 1 ? colorPattern.disabled : colorPattern.borderLight,
                  color: currentPage === 1 ? colorPattern.textMuted : colorPattern.primary,
                }}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = withOpacity(colorPattern.primary, 0.1);
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.target.style.backgroundColor = colorPattern.borderLight;
                  }
                }}
              >
                <span className="material-icons text-sm mr-1">chevron_left</span>
                Trước
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  className="w-10 h-10 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: currentPage === idx + 1 ? colorPattern.primary : colorPattern.background,
                    color: currentPage === idx + 1 ? colorPattern.textWhite : colorPattern.text,
                    border: `1px solid ${currentPage === idx + 1 ? colorPattern.primary : colorPattern.border}`,
                  }}
                  onClick={() => setCurrentPage(idx + 1)}
                  onMouseEnter={(e) => {
                    if (currentPage !== idx + 1) {
                      e.target.style.backgroundColor = withOpacity(colorPattern.primary, 0.1);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== idx + 1) {
                      e.target.style.backgroundColor = colorPattern.background;
                    }
                  }}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: currentPage === totalPages ? colorPattern.disabled : colorPattern.borderLight,
                  color: currentPage === totalPages ? colorPattern.textMuted : colorPattern.primary,
                }}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = withOpacity(colorPattern.primary, 0.1);
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.target.style.backgroundColor = colorPattern.borderLight;
                  }
                }}
              >
                Sau
                <span className="material-icons text-sm ml-1">chevron_right</span>
              </button>
              <div 
                className="ml-4 text-sm font-medium"
                style={{ color: colorPattern.textLight }}
              >
                Trang {currentPage} / {totalPages}
              </div>
            </div>
          )}
          {/* No Results Message */}
          {filteredProducts.length === 0 && (
            <div 
              className="text-center py-12 rounded-xl"
              style={{ 
                backgroundColor: colorPattern.background,
                boxShadow: `0 2px 4px ${colorPattern.shadow}`
              }}
            >
              <div 
                className="text-6xl mb-4"
                style={{ color: colorPattern.textMuted }}
              >
                🔍
              </div>
              <h3 
                className="text-xl font-semibold mb-2"
                style={{ color: colorPattern.text }}
              >
                Không tìm thấy sản phẩm
              </h3>
              <p 
                className="text-sm mb-4"
                style={{ color: colorPattern.textLight }}
              >
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
              <button
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: colorPattern.primary,
                  color: colorPattern.textWhite,
                }}
                onClick={() => setSelectedCategories([])}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colorPattern.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = colorPattern.primary;
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
