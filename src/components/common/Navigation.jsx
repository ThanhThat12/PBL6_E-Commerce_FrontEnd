import React from "react";
import './Navigation.css';

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
    <nav className="navigation-container">
      <div className="navigation-title">Navigation</div>
      <ul className="navigation-list">
        {items.map((item, idx) => (
          <li
            key={item.label}
            className={`navigation-item${idx === activeIndex ? " active" : ""}`}
            onClick={() => onItemClick && onItemClick(idx)}
          >
            <span className="navigation-icon">{item.icon}</span>
            <span className="navigation-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
