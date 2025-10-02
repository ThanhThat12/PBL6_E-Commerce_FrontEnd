# Seller Components Structure

This folder contains all components used in the Seller dashboard and management pages.

## 📁 Folder Structure

```
Seller/
├── Layout/              # Layout components (Header, Sidebar, etc.)
│   ├── Header.jsx
│   ├── Header.css
│   ├── Sidebar.jsx
│   ├── Sidebar.css
│   ├── SellerLayout.jsx
│   └── SellerLayout.css
│
├── Dashboard/           # Dashboard-specific components
│   ├── StatCard.jsx
│   ├── SalesLineChart.jsx
│   ├── TransactionTable.jsx
│   ├── TransactionTable.css
│   ├── BestSellingProducts.jsx
│   ├── BestSellingProducts.css
│   ├── TopProductsList.jsx
│   ├── TopProductsList.css
│   ├── AddNewProduct.jsx
│   ├── AddNewProduct.css
│   ├── SalesByCountry.jsx
│   ├── SalesByCountry.css
│   ├── UsersChart.jsx
│   └── UsersChart.css
│
├── Products/            # Product management components
│   ├── ProductTable.jsx
│   └── ProductTable.css
│
├── Categories/          # Category management components
│   ├── CategoryCard.jsx
│   └── CategoryCard.css
│
├── Customers/           # Customer management components
│   ├── CustomerStatsCard.jsx
│   ├── CustomerStatsCard.css
│   ├── CustomerTable.jsx
│   ├── CustomerTable.css
│   ├── TopSpendersCard.jsx
│   ├── TopSpendersCard.css
│   ├── CustomerSegmentCard.jsx
│   └── CustomerSegmentCard.css
│
├── Common/              # Shared/reusable components
│   └── LineChartMini.jsx
│
└── index.jsx            # Central export file
```

## 🎯 Usage

All components are exported from the central `index.jsx` file, so you can import them like:

```javascript
import { Header, Sidebar, StatCard } from '../../components/Seller';
```

## 📝 Component Categories

### Layout Components
Core layout components used across all seller pages.

### Dashboard Components
Components specific to the seller dashboard page (charts, stats, tables).

### Products Components
Components for product management functionality.

### Categories Components
Components for category management.

### Customers Components
Components for customer management and analytics.

### Common Components
Reusable components that can be used across different features.

## 🔧 Adding New Components

When adding new components:
1. Place them in the appropriate folder based on their feature
2. Export them in `index.jsx`
3. Update this README if adding a new category

## 📌 Notes

- Each component has its own CSS file for better maintainability
- Follow the existing naming conventions
- Keep components focused and single-responsibility
