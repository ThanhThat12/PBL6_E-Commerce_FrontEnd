import React, { useState } from "react";

// SVG icons
const icons = {
  Phones: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
  Computers: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" />
      <rect x="8" y="17" width="8" height="2" rx="1" fill="currentColor" />
    </svg>
  ),
  SmartWatch: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="7" y="6" width="10" height="12" rx="3" stroke="currentColor" />
      <rect x="9" y="2" width="6" height="2" rx="1" fill="currentColor" />
      <rect x="9" y="20" width="6" height="2" rx="1" fill="currentColor" />
    </svg>
  ),
  Camera: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="7" width="18" height="12" rx="3" stroke="currentColor" />
      <circle cx="12" cy="13" r="3" stroke="currentColor" />
      <rect x="8" y="3" width="8" height="4" rx="1" stroke="currentColor" />
    </svg>
  ),
  Headphones: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 17v-3a8 8 0 0116 0v3" stroke="currentColor" />
      <rect x="2" y="17" width="4" height="5" rx="2" stroke="currentColor" />
      <rect x="18" y="17" width="4" height="5" rx="2" stroke="currentColor" />
    </svg>
  ),
  Gaming: (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="4" y="8" width="16" height="8" rx="4" stroke="currentColor" />
      <circle cx="8" cy="12" r="1" stroke="currentColor" />
      <circle cx="16" cy="12" r="1" stroke="currentColor" />
      <path d="M12 8v8" stroke="currentColor" />
    </svg>
  ),
};

const categories = [
  "Phones",
  "Computers",
  "SmartWatch",
  "Camera",
  "Headphones",
  "Gaming",
];

const CategoryCards = ({
  categories,
  icons,
  selected,
  onSelect,
}) => (
  <div className="flex-1 flex flex-row flex-wrap gap-6 justify-center items-center">
    {categories.map((cat) => {
      const isActive = selected === cat;
      return (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`flex flex-col items-center justify-center px-8 py-8 rounded-lg border transition-all duration-300
            ${isActive
              ? "bg-red-500 border-red-500 shadow-lg"
              : "bg-white border-gray-300 hover:scale-105 hover:border-red-400"
            }`}
          style={{ minWidth: "150px", minHeight: "150px" }}
        >
          <span className={`mb-3 ${isActive ? "text-white" : "text-black"}`}>
            {icons[cat]}
          </span>
          <span className={`font-semibold text-lg ${isActive ? "text-white" : "text-black"}`}>
            {cat}
          </span>
        </button>
      );
    })}
  </div>
);

const CategoryBrowser = ({
  activeCategory = "Camera",
  onCategorySelect,
}) => {
  const [selected, setSelected] = useState(activeCategory);

  const handleSelect = (cat) => {
    setSelected(cat);
    if (onCategorySelect) onCategorySelect(cat);
  };

  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-10 mb-8">
      {/* Top row: label + title (left) and arrows (right) */}
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-col items-start min-w-[120px]">
          <div className="flex items-center mb-2">
            <span className="bg-red-500 rounded h-6 w-4 mr-2"></span>
            <span className="text-red-500 font-bold text-lg">Categories</span>
          </div>
          <h2 className="font-bold text-black text-3xl mt-2">Browse By Category</h2>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <button className="bg-gray-100 border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="bg-gray-100 border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Category cards row */}
      <CategoryCards
        categories={categories}
        icons={icons}
        selected={selected}
        onSelect={handleSelect}
      />
    </section>
  );
};

export default CategoryBrowser;