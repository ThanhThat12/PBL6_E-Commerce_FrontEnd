import React, { useState, useEffect } from 'react';

/**
 * VariantSelector Component
 * Select product variant based on attributes (color, size, etc.)
 * 
 * @param {Array} variants - Product variants
 * @param {Object} selectedVariant - Currently selected variant
 * @param {Function} onVariantChange - Variant change handler
 */
const VariantSelector = ({ variants = [], selectedVariant, onVariantChange }) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});

  // Initialize selectedAttributes from selectedVariant on mount or when selectedVariant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.variantValues) {
      const attrs = {};
      selectedVariant.variantValues.forEach(vv => {
        const attrName = vv.productAttribute?.name || 'Option';
        attrs[attrName] = vv.value;
      });
      setSelectedAttributes(attrs);
      console.log('🔍 [VariantSelector] Initialized selectedAttributes:', attrs);
    }
  }, [selectedVariant]);

  // Group variants by attributes
  const attributeOptions = {};
  
  variants.forEach(variant => {
    variant.variantValues?.forEach(vv => {
      const attrName = vv.productAttribute?.name || 'Option';
      if (!attributeOptions[attrName]) {
        attributeOptions[attrName] = new Set();
      }
      attributeOptions[attrName].add(vv.value);
    });
  });

  // Convert Sets to Arrays
  Object.keys(attributeOptions).forEach(key => {
    attributeOptions[key] = Array.from(attributeOptions[key]);
  });

  // Find variant matching selected attributes
  useEffect(() => {
    const matchingVariant = variants.find(variant => {
      return Object.entries(selectedAttributes).every(([attrName, attrValue]) => {
        return variant.variantValues?.some(
          vv => vv.productAttribute?.name === attrName && vv.value === attrValue
        );
      });
    });

    if (matchingVariant && matchingVariant.id !== selectedVariant?.id) {
      onVariantChange(matchingVariant);
    }
  }, [selectedAttributes, variants, selectedVariant, onVariantChange]);

  const handleAttributeChange = (attrName, value) => {
    setSelectedAttributes(prev => ({
      ...prev,
      [attrName]: value
    }));
  };

  const isAttributeValueAvailable = (attrName, value) => {
    // Check if there's a variant with this attribute value
    // that also matches other selected attributes
    const otherSelectedAttrs = Object.entries(selectedAttributes)
      .filter(([name]) => name !== attrName);

    return variants.some(variant => {
      const hasThisValue = variant.variantValues?.some(
        vv => vv.productAttribute?.name === attrName && vv.value === value
      );

      const matchesOthers = otherSelectedAttrs.every(([name, val]) => 
        variant.variantValues?.some(
          vv => vv.productAttribute?.name === name && vv.value === val
        )
      );

      return hasThisValue && matchesOthers && variant.stock > 0;
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(attributeOptions).map(([attrName, values]) => (
        <div key={attrName}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {attrName}
            {selectedAttributes[attrName] && (
              <span className="ml-2 text-primary-600">
                : {selectedAttributes[attrName]}
              </span>
            )}
          </h4>

          <div className="flex flex-wrap gap-3">
            {values.map((value) => {
              const isSelected = selectedAttributes[attrName] === value;
              const isAvailable = isAttributeValueAvailable(attrName, value);

              return (
                <button
                  key={value}
                  onClick={() => handleAttributeChange(attrName, value)}
                  disabled={!isAvailable}
                  className={`
                    relative px-5 py-3 rounded-lg border-2 transition-all duration-200 font-medium
                    ${isSelected
                      ? 'border-primary-500 bg-primary-500 text-white shadow-md transform scale-105'
                      : isAvailable
                        ? 'border-gray-300 bg-white hover:border-primary-400 hover:shadow-sm text-gray-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through'
                    }
                    ${!isAvailable && 'opacity-50'}
                  `}
                >
                  {/* Color preview if attribute is Color */}
                  {attrName.toLowerCase().includes('color') && (
                    <span
                      className="inline-block w-5 h-5 rounded-full mr-2 border-2 border-white shadow-sm"
                      style={{ backgroundColor: value.toLowerCase() }}
                    />
                  )}
                  <span>{value}</span>
                  
                  {/* Checkmark for selected */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Mã sản phẩm</p>
              <p className="font-mono text-sm font-bold text-gray-900">{selectedVariant.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Tồn kho</p>
              <p className={`font-bold text-lg ${
                selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedVariant.stock > 0 
                  ? `${selectedVariant.stock} sản phẩm` 
                  : 'Hết hàng'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Giá</p>
              <p className="font-bold text-lg text-primary-600">
                {new Intl.NumberFormat('vi-VN').format(selectedVariant.price)}₫
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
