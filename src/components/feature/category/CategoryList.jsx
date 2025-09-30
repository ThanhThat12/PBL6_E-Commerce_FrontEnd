import React from "react";
import colorPattern from "../../../styles/colorPattern";

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Fashion" },
  { id: 3, name: "Home & Garden" },
  { id: 4, name: "Sports" },
  { id: 5, name: "Toys" },
  { id: 6, name: "Automotive" },
  { id: 7, name: "Books" },
  { id: 8, name: "Groceries" },
];

const CategoryList = ({ onSelectCategory }) => {
  return (
    <aside 
      className="rounded-xl shadow p-6 w-full"
      style={{ 
        backgroundColor: colorPattern.background,
        boxShadow: `0 2px 8px ${colorPattern.shadow}`,
      }}
    >
      <h3 
        className="font-bold text-lg mb-4"
        style={{ color: colorPattern.text }}
      >
        Categories
      </h3>
      <ul className="flex flex-col gap-2">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              className="w-full text-left px-3 py-2 rounded transition-colors"
              style={{
                color: colorPattern.text,
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colorPattern.hover;
                e.target.style.color = colorPattern.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colorPattern.text;
              }}
              onClick={() => onSelectCategory && onSelectCategory(cat)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategoryList;