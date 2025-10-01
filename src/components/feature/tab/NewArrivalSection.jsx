import React from "react";
import colorPattern from "../../../styles/colorPattern";
import { newArrivalProducts } from '../../../mockDataNewArrival';

const NewArrivalSection = ({ products = newArrivalProducts, onShopClick }) => {
    return (
        <section 
            className="rounded-xl shadow p-6 md:p-10 mb-8"
            style={{ 
                backgroundColor: colorPattern.background,
                boxShadow: `0 4px 16px ${colorPattern.shadow}`,
            }}
        >
            {/* Label + Title */}
            <div className="mb-6">
                <div className="flex items-center mb-2">
                    <span 
                        className="rounded h-6 w-4 mr-2"
                        style={{ backgroundColor: colorPattern.secondary }}
                    ></span>
                    <span 
                        className="font-bold text-lg"
                        style={{ color: colorPattern.secondary }}
                    >
                        Featured
                    </span>
                </div>
                <h2 
                    className="font-bold text-3xl mt-2"
                    style={{ color: colorPattern.text }}
                >
                    New Arrival
                </h2>
            </div>
            {/* Product cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
                {/* Big left card */}
                <div 
                    className="relative col-span-1 md:row-span-2 md:col-span-1 rounded-lg overflow-hidden flex items-end min-h-[340px]"
                    style={{
                        background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryDark} 100%)`,
                    }}
                >
                    <img
                        src={products[0].image}
                        alt={products[0].name}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="relative z-10 p-8">
                        <div 
                            className="font-bold text-xl mb-2"
                            style={{ color: colorPattern.textWhite }}
                        >
                            {products[0].name}
                        </div>
                        <div 
                            className="text-base mb-4"
                            style={{ color: colorPattern.backgroundGray }}
                        >
                            {products[0].description}
                        </div>
                        <button
                            className="bg-transparent font-semibold underline underline-offset-2 transition-colors"
                            style={{ color: colorPattern.textWhite }}
                            onMouseEnter={(e) => {
                                e.target.style.color = colorPattern.secondary;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = colorPattern.textWhite;
                            }}
                            onClick={() => onShopClick && onShopClick(products[0])}
                        >
                            {products[0].buttonText}
                        </button>
                    </div>
                </div>
                {/* Top right card */}
                <div 
                    className="relative rounded-lg overflow-hidden flex items-end min-h-[160px]"
                    style={{
                        background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryDark} 100%)`,
                    }}
                >
                    <img
                        src={products[1].image}
                        alt={products[1].name}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                    <div className="relative z-10 p-6">
                        <div 
                            className="font-bold text-lg mb-2"
                            style={{ color: colorPattern.textWhite }}
                        >
                            {products[1].name}
                        </div>
                        <div 
                            className="text-sm mb-4"
                            style={{ color: colorPattern.backgroundGray }}
                        >
                            {products[1].description}
                        </div>
                        <button
                            className="bg-transparent font-semibold underline underline-offset-2 transition-colors"
                            style={{ color: colorPattern.textWhite }}
                            onMouseEnter={(e) => {
                                e.target.style.color = colorPattern.secondary;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.color = colorPattern.textWhite;
                            }}
                            onClick={() => onShopClick && onShopClick(products[1])}
                        >
                            {products[1].buttonText}
                        </button>
                    </div>
                </div>
                {/* Bottom right cards */}
                <div className="grid grid-cols-2 gap-6">
                    {[products[2], products[3]].map((product) => (
                        <div
                            key={product.id}
                            className="relative rounded-lg overflow-hidden flex items-end min-h-[160px]"
                            style={{
                                background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryDark} 100%)`,
                            }}
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                            <div className="relative z-10 p-6">
                                <div 
                                    className="font-bold text-lg mb-2"
                                    style={{ color: colorPattern.textWhite }}
                                >
                                    {product.name}
                                </div>
                                <div 
                                    className="text-sm mb-4"
                                    style={{ color: colorPattern.backgroundGray }}
                                >
                                    {product.description}
                                </div>
                                <button
                                    className="bg-transparent font-semibold underline underline-offset-2 transition-colors"
                                    style={{ color: colorPattern.textWhite }}
                                    onMouseEnter={(e) => {
                                        e.target.style.color = colorPattern.secondary;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.color = colorPattern.textWhite;
                                    }}
                                    onClick={() => onShopClick && onShopClick(product)}
                                >
                                    {product.buttonText}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewArrivalSection;