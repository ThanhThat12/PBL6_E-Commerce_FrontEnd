import React from "react";
import { categories, locations, conditions, ratings } from "./mockProductData";
import colorPattern from "../styles/colorPattern";

export default function ProductSidebar({
  priceRange,
  setPriceRange,
  selectedLocations,
  setSelectedLocations,
  selectedConditions,
  setSelectedConditions,
  selectedCategories,
  setSelectedCategories,
  handleLocationChange,
  handleConditionChange,
  handleCategoryChange,
  sortBy,
  setSortBy,
}) {
  function CollapsibleSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
      <div className="mb-4 border-b border-[#B3E5FC] pb-2">
        <button
          className="flex items-center justify-between w-full text-[#1E88E5] font-semibold py-2 focus:outline-none"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span>{title}</span>
          <span className="text-[#42A5F5]">{open ? "−" : "+"}</span>
        </button>
        {open && <div className="mt-2">{children}</div>}
      </div>
    );
  }

  return (
    <aside
      className="w-full md:w-64 rounded-2xl p-4 mb-6 md:mb-0 border"
      style={{
        backgroundColor: colorPattern.backgroundGray,
        borderColor: colorPattern.borderLight,
      }}
    >
      {/* Sort Dropdown */}
      <div className="mb-4">
        <label
          htmlFor="sort"
          className="block text-sm font-medium mb-1"
          style={{ color: colorPattern.textLight }}
        >
          Sắp xếp theo
        </label>
        <select
          id="sort"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="w-full px-3 py-2 rounded border"
          style={{
            borderColor: colorPattern.border,
            backgroundColor: colorPattern.background,
            color: colorPattern.text,
          }}
        >
          <option value="latest">Mới nhất</option>
          <option value="priceAsc">Giá tăng dần</option>
          <option value="priceDesc">Giá giảm dần</option>
          <option value="rating">Đánh giá</option>
        </select>
      </div>

      <CollapsibleSection title="Categories">
        <ul>
          {categories.map((cat) => (
            <li key={cat.name} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.name)}
                onChange={() => handleCategoryChange(cat.name)}
                className="accent-[#1E88E5] w-4 h-4"
              />
              <span className="text-[#1E88E5]">{cat.name}</span>
              <span className="text-[#42A5F5] text-xs font-semibold">({cat.count})</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Price">
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="Min"
            value={priceRange.min}
            onChange={e => setPriceRange(r => ({ ...r, min: e.target.value }))}
            className="w-20 px-2 py-1 border rounded focus:outline-none"
            style={{
              borderColor: colorPattern.border,
              color: colorPattern.text,
              backgroundColor: colorPattern.backgroundGray,
            }}
          />
          <span className="text-[#90CAF9] font-bold">-</span>
          <input
            type="text"
            placeholder="Max"
            value={priceRange.max}
            onChange={e => setPriceRange(r => ({ ...r, max: e.target.value }))}
            className="w-20 px-2 py-1 border rounded focus:outline-none"
            style={{
              borderColor: colorPattern.border,
              color: colorPattern.text,
              backgroundColor: colorPattern.backgroundGray,
            }}
          />
          <span className="text-[#1E88E5] text-xs">VND</span>
        </div>
        <button
          className="w-full py-1 mt-1 rounded font-semibold transition"
          style={{
            backgroundColor: colorPattern.primary,
            color: colorPattern.textWhite,
          }}
        >
          Áp dụng
        </button>
      </CollapsibleSection>
      <CollapsibleSection title="Location">
        <ul>
          {locations.map((loc) => (
            <li key={loc} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedLocations.includes(loc)}
                onChange={() => handleLocationChange(loc)}
                className="accent-[#1E88E5] w-4 h-4"
              />
              <span className="text-[#1E88E5]">{loc}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Condition">
        <ul>
          {conditions.map((cond) => (
            <li key={cond} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                checked={selectedConditions.includes(cond)}
                onChange={() => handleConditionChange(cond)}
                className="accent-[#1E88E5] w-4 h-4"
              />
              <span className="text-[#1E88E5]">{cond}</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>
      <CollapsibleSection title="Rating">
        <ul>
          {ratings.map((r) => (
            <li key={r} className="flex items-center gap-1 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${i < r ? "text-[#FFD600]" : "text-[#B3E5FC]"}`}
                >★</span>
              ))}
              <span className="text-[#1E88E5] text-sm font-medium">{r}.0 & up</span>
            </li>
          ))}
        </ul>
      </CollapsibleSection>

      {/* Delete Filter Button */}
      {(selectedCategories.length > 0 ||
        selectedLocations.length > 0 ||
        selectedConditions.length > 0 ||
        priceRange.min ||
        priceRange.max) && (
        <button
          className="w-full mt-4 py-2 rounded-lg font-semibold transition-all duration-200"
          style={{
            backgroundColor: colorPattern.secondary,
            color: colorPattern.textWhite,
          }}
          onMouseEnter={e => {
            e.target.style.backgroundColor = colorPattern.secondaryDark;
          }}
          onMouseLeave={e => {
            e.target.style.backgroundColor = colorPattern.secondary;
          }}
          onClick={() => {
            setSelectedCategories([]);
            setSelectedLocations([]);
            setSelectedConditions([]);
            setPriceRange({ min: "", max: "" });
          }}
        >
          <span className="material-icons text-sm mr-2">clear</span>
          Xóa bộ lọc
        </button>
      )}
    </aside>
  );
}