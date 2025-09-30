import React from "react";

const Roadmap = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <nav className="roadmap-breadcrumb" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center">
            {idx > 0 && (
              <span className="mx-2 text-gray-400">/</span>
            )}
            {item.active ? (
              <span className="font-semibold text-black">{item.label}</span>
            ) : item.href ? (
              <a href={item.href} className="text-gray-500 hover:underline">{item.label}</a>
            ) : (
              <span className="text-gray-500">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Roadmap;
