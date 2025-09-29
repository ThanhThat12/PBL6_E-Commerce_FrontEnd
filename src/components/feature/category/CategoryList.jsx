import React from "react";

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
    <aside className="bg-white rounded-xl shadow p-6 w-full">
      <h3 className="font-bold text-lg mb-4">Categories</h3>
      <ul className="flex flex-col gap-2">
        {categories.map((cat) => (
          <li key={cat.id}>
            <button
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition"
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
