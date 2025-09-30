import React from 'react';
import ProductList from '../../common/ProductList';



const JustForYou = ({ products, onAddToCart, onSeeAll }) => {
  return (
    <div className="just-for-you-container">
      <div className="just-for-you-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 24, background: '#F75555', borderRadius: 4, display: 'inline-block' }}></span>
          <h2 style={{ fontWeight: 600, fontSize: 20 }}>Just For You</h2>
        </div>
        <button className="see-all-btn" onClick={onSeeAll} style={{ border: '1px solid #ccc', borderRadius: 6, padding: '8px 24px', background: 'white', fontWeight: 500 }}>
          See All
        </button>
      </div>
      <ProductList 
        products={products} 
        onAddToCart={onAddToCart} 
        showAddToCart
      />
    </div>
  );
};

export default JustForYou;
