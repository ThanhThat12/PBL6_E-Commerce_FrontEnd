import React from 'react';
import colorPattern from "../../../styles/colorPattern";
import ProductList from '../../common/ProductList';

const JustForYou = ({ products, onAddToCart, onSeeAll }) => {
  return (
    <div className="just-for-you-container">
      <div 
        className="just-for-you-header" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 40 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span 
            style={{ 
              width: 8, 
              height: 24, 
              background: colorPattern.secondary, 
              borderRadius: 4, 
              display: 'inline-block' 
            }}
          ></span>
          <h2 
            style={{ 
              fontWeight: 600, 
              fontSize: 20,
              color: colorPattern.text
            }}
          >
            Just For You
          </h2>
        </div>
        <button 
          className="see-all-btn transition-colors" 
          onClick={onSeeAll} 
          style={{ 
            border: `1px solid ${colorPattern.border}`, 
            borderRadius: 6, 
            padding: '8px 24px', 
            background: colorPattern.background, 
            fontWeight: 500,
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
        >
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