import React from "react";
import ProductList from "../../common/ProductList";

// Color dots for demo
const colorDots = {
  "Breed Dry Dog Food": [],
  "CANON EOS DSLR Camera": [],
  "ASUS FHD Gaming Laptop": [],
  "Curology Product Set": [],
  "Kids Electric Car": ["bg-red-500", "bg-black"],
  "Jr. Zoom Soccer Cleats": ["bg-lime-400", "bg-black"],
  "GPII Shooter USB Gamepad": ["bg-black", "bg-red-500"],
  "Quilted Satin Jacket": ["bg-black", "bg-green-900"],
};

const defaultProducts = [
  {
    id: 1,
    name: "Breed Dry Dog Food",
    image: "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UL1500_.jpg",
    price: 100,
    rating: 3.5,
    reviews: 35,
    isFavorite: false,
    isNew: false,
    discount: null,
    colorDots: colorDots["Breed Dry Dog Food"],
  },
  {
    id: 2,
    name: "CANON EOS DSLR Camera",
    image: "https://m.media-amazon.com/images/I/71EWRyqzw0L._AC_UL1500_.jpg",
    price: 360,
    rating: 4.5,
    reviews: 95,
    isFavorite: true,
    isNew: false,
    discount: null,
    showAddToCart: true,
    colorDots: colorDots["CANON EOS DSLR Camera"],
  },
  {
    id: 3,
    name: "ASUS FHD Gaming Laptop",
    image: "https://m.media-amazon.com/images/I/81Yb5n4lHCL._AC_UL1500_.jpg",
    price: 700,
    rating: 5,
    reviews: 325,
    isFavorite: false,
    isNew: false,
    discount: null,
    showAddToCart: true,
    colorDots: colorDots["ASUS FHD Gaming Laptop"],
  },
  {
    id: 4,
    name: "Curology Product Set",
    image: "https://m.media-amazon.com/images/I/61QKQwQdKDL._AC_UL1500_.jpg",
    price: 500,
    rating: 4,
    reviews: 145,
    isFavorite: false,
    isNew: false,
    discount: null,
    colorDots: colorDots["Curology Product Set"],
  },
  {
    id: 5,
    name: "Kids Electric Car",
    image: "https://m.media-amazon.com/images/I/71QKQwQdKDL._AC_UL1500_.jpg",
    price: 960,
    rating: 4.5,
    reviews: 65,
    isFavorite: true,
    isNew: true,
    discount: null,
    colorDots: colorDots["Kids Electric Car"],
  },
  {
    id: 6,
    name: "Jr. Zoom Soccer Cleats",
    image: "https://m.media-amazon.com/images/I/71w6l5pGQbL._AC_UL1500_.jpg",
    price: 1160,
    rating: 5,
    reviews: 35,
    isFavorite: false,
    isNew: true,
    discount: null,
    colorDots: colorDots["Jr. Zoom Soccer Cleats"],
  },
  {
    id: 7,
    name: "GPII Shooter USB Gamepad",
    image: "https://m.media-amazon.com/images/I/61nCqYb1c+L._AC_SL1500_.jpg",
    price: 660,
    rating: 4.5,
    reviews: 55,
    isFavorite: false,
    isNew: false,
    discount: null,
    colorDots: colorDots["GPII Shooter USB Gamepad"],
  },
  {
    id: 8,
    name: "Quilted Satin Jacket",
    image: "https://m.media-amazon.com/images/I/71w6l5pGQbL._AC_UL1500_.jpg",
    price: 660,
    rating: 4,
    reviews: 55,
    isFavorite: true,
    isNew: false,
    discount: null,
    colorDots: colorDots["Quilted Satin Jacket"],
  },
];

const ProductExplorer = ({
  products = defaultProducts,
  onViewAll,
}) => {
  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-10 mb-8">
      {/* Label + Title + Navigation arrows */}
      <div className="flex flex-row justify-between items-center gap-6 mb-6">
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <span className="bg-red-500 rounded h-6 w-4 mr-2"></span>
            <span className="text-red-500 font-bold text-lg">Our Products</span>
          </div>
          <h2 className="font-bold text-black text-3xl mt-2">Explore Our Products</h2>
        </div>
        <div className="flex justify-end gap-3 mb-8">
          <button className="bg-gray-100 border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="bg-gray-100 border-none rounded-full w-10 h-10 flex items-center justify-center shadow transition">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Product cards grid (reuse ProductList) */}
      <ProductList products={products} />
      {/* View All Products button */}
      <div className="flex justify-center">
        <button
          className="bg-red-500 text-white px-8 py-3 rounded font-bold shadow hover:brightness-110 transition-all duration-200 text-lg"
          onClick={onViewAll}
        >
          View All Products
        </button>
      </div>
    </section>
  );
};

export default ProductExplorer;