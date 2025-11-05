import React from "react";
import colorPattern from "../../styles/colorPattern";

const Roadmap = ({ items = [] }) => {
  if (!items.length) return null;
  
  return (
    <nav className="roadmap-breadcrumb" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, idx) => (
          <li key={item.label} className="flex items-center">
            {idx > 0 && (
              <span 
                className="mx-2"
                style={{ color: colorPattern.textMuted }}
              >
                /
              </span>
            )}
            {item.active ? (
              <span 
                className="font-semibold"
                style={{ color: colorPattern.primary }}
              >
                {item.label}
              </span>
            ) : item.href ? (
              <a 
                href={item.href} 
                className="hover:underline transition-colors"
                style={{ 
                  color: colorPattern.textLight,
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = colorPattern.primary;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = colorPattern.textLight;
                }}
              >
                {item.label}
              </a>
            ) : (
              <span 
                style={{ color: colorPattern.textLight }}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Roadmap;