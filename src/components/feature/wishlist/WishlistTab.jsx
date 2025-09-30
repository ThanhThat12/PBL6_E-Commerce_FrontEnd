import React from 'react';
import colorPattern from "../../../styles/colorPattern";
import ProductList from '../../common/ProductList';

const WishlistTab = ({ products, onAddToCart, onRemove, onMoveAllToBag }) => {
  return (
    <div className="wishlist-container">
      <div 
        className="wishlist-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 40 
        }}
      >
        <h2 
          style={{ 
            color: colorPattern.text,
            fontSize: 24,
            fontWeight: 600,
            margin: 0
          }}
        >
          Wishlist ({products.length})
        </h2>
        <button
          className="move-all-btn rounded-md px-6 py-2 font-medium transition-colors"
          style={{
            border: `1px solid ${colorPattern.border}`,
            backgroundColor: colorPattern.background,
            color: colorPattern.text,
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colorPattern.hover;
            e.target.style.borderColor = colorPattern.primary;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = colorPattern.background;
            e.target.style.borderColor = colorPattern.border;
          }}
          onClick={onMoveAllToBag}
        >
          Move All To Bag
        </button>
      </div>
      <ProductList 
        products={products} 
        onAddToCart={onAddToCart} 
        onRemove={onRemove} 
        showRemove
        showAddToCart
        wishlistMode
      />
    </div>
  );
};

export default WishlistTab;