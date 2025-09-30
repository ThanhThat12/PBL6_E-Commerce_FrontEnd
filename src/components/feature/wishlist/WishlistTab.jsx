import React from 'react';
import ProductList from '../../common/ProductList';


const WishlistTab = ({ products, onAddToCart, onRemove, onMoveAllToBag }) => {
  return (
    <div className="wishlist-container">
      <div className="wishlist-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <h2>Wishlist ({products.length})</h2>
        <button
          className="move-all-btn border border-gray-300 rounded-md px-6 py-2 bg-white font-medium hover:bg-gray-50 transition"
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
