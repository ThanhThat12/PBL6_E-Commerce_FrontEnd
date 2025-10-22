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

  // Group variants by attributes
  const attributeOptions = {};
  
  variants.forEach(variant => {
    variant.variantValues?.forEach(vv => {
      const attrName = vv.attribute?.name || 'Option';
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
          vv => vv.attribute?.name === attrName && vv.value === attrValue
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
        vv => vv.attribute?.name === attrName && vv.value === value
      );

      const matchesOthers = otherSelectedAttrs.every(([name, val]) => 
        variant.variantValues?.some(
          vv => vv.attribute?.name === name && vv.value === val
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

          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const isSelected = selectedAttributes[attrName] === value;
              const isAvailable = isAttributeValueAvailable(attrName, value);

              return (
                <button
                  key={value}
                  onClick={() => handleAttributeChange(attrName, value)}
                  disabled={!isAvailable}
                  className={`
                    px-4 py-2 rounded-lg border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : isAvailable
                        ? 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                    ${!isAvailable && 'opacity-50'}
                  `}
                >
                  {/* Color preview if attribute is Color */}
                  {attrName.toLowerCase() === 'color' && (
                    <span
                      className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300"
                      style={{ backgroundColor: value.toLowerCase() }}
                    />
                  )}
                  <span className="font-medium">{value}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">SKU</p>
              <p className="font-mono text-sm font-semibold">{selectedVariant.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Stock</p>
              <p className={`font-semibold ${
                selectedVariant.stock > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {selectedVariant.stock > 0 
                  ? `${selectedVariant.stock} available` 
                  : 'Out of stock'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
