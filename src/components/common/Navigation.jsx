import React from "react";
import './Navigation.css';
import colorPattern from "../../styles/colorPattern";

const navItems = [
  { icon: <span className="material-icons">dashboard</span>, label: "Dashboard", active: true },
  { icon: <span className="material-icons">sync</span>, label: "Order History" },
  { icon: <span className="material-icons">favorite_border</span>, label: "Wishlist" },
  { icon: <span className="material-icons">shopping_cart</span>, label: "Shopping Cart" },
  { icon: <span className="material-icons">settings</span>, label: "Settings" },
  { icon: <span className="material-icons">logout</span>, label: "Log-out" },
];

export default function Navigation({ items = navItems, activeIndex = 0, onItemClick }) {
  return (
    <nav
      className="navigation-container"
      style={{
        background: colorPattern.background,
        border: `1px solid ${colorPattern.border}`,
        borderRadius: "16px",
        boxShadow: `0 2px 8px ${colorPattern.shadow}`,
        padding: "24px 0",
        color: colorPattern.text,
        minWidth: "220px"
      }}
    >
      <div
        className="navigation-title"
        style={{
          fontWeight: "bold",
          color: colorPattern.primary,
          fontSize: "1.2rem",
          marginBottom: "16px",
          textAlign: "center"
        }}
      >
        Navigation
      </div>
      <ul className="navigation-list" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, idx) => {
          const isActive = idx === activeIndex;
          return (
            <li
              key={item.label}
              className={`navigation-item${isActive ? " active" : ""}`}
              onClick={() => onItemClick && onItemClick(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 24px",
                cursor: "pointer",
                background: isActive ? colorPattern.primaryLight : colorPattern.background,
                color: isActive ? colorPattern.textWhite : colorPattern.text,
                borderLeft: isActive ? `4px solid ${colorPattern.secondary}` : "4px solid transparent",
                fontWeight: isActive ? "bold" : "normal",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.background = isActive ? colorPattern.primaryLight : colorPattern.hover}
              onMouseOut={e => e.currentTarget.style.background = isActive ? colorPattern.primaryLight : colorPattern.background}
            >
              <span className="navigation-icon" style={{ fontSize: "1.4rem", color: isActive ? colorPattern.secondary : colorPattern.primary }}>{item.icon}</span>
              <span className="navigation-label">{item.label}</span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
