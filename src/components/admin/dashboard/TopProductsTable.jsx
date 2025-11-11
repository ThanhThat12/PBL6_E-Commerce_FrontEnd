import React from "react";
import { Package } from "lucide-react";

const TopProductsTable = ({ products }) => {
  return (
    <div className="table-card">
      <div className="table-header">
        <h3 className="table-title">Top Selling Products</h3>
        <button className="view-all-btn">View All</button>
      </div>
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Sales</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index}>
                <td>
                  <div className="product-info">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-image" />
                    ) : (
                      <div className="product-image product-image-placeholder">
                        <Package size={20} />
                      </div>
                    )}
                    <div>
                      <div className="product-name">{product.name}</div>
                      <div className="product-sku">SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-badge">{product.category}</span>
                </td>
                <td className="sales-count">{product.sales}</td>
                <td className="revenue-amount">${product.revenue}</td>
                <td>
                  <span className={`status-badge ${product.status.toLowerCase()}`}>
                    {product.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProductsTable;