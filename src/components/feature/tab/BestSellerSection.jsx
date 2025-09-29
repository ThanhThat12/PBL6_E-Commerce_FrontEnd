import React from "react";
import ProductList from "../../common/ProductList";

const defaultProducts = [
  {
    id: 1,
    name: "The north coat",
    image: "https://m.media-amazon.com/images/I/71w6l5pGQbL._AC_UL1500_.jpg",
    price: 260,
    originalPrice: 360,
    rating: 4.5,
    reviews: 65,
    isFavorite: false,
    discount: null,
  },
  {
    id: 2,
    name: "Gucci duffle bag",
    image: "https://m.media-amazon.com/images/I/61vQpQJpKDL._AC_UL1500_.jpg",
    price: 960,
    originalPrice: 1160,
    rating: 4.5,
    reviews: 65,
    isFavorite: true,
    discount: null,
  },
  {
    id: 3,
    name: "RGB liquid CPU Cooler",
    image: "https://m.media-amazon.com/images/I/71QkQwQdKDL._AC_UL1500_.jpg",
    price: 160,
    originalPrice: 170,
    rating: 4.5,
    reviews: 65,
    isFavorite: false,
    discount: null,
  },
  {
    id: 4,
    name: "Small BookSelf",
    image: "https://m.media-amazon.com/images/I/71QKQwQdKDL._AC_UL1500_.jpg",
    price: 360,
    originalPrice: 400,
    rating: 4.5,
    reviews: 65,
    isFavorite: false,
    discount: null,
  },
];

const BestSellerSection = ({
  products = defaultProducts,
  onViewAll,
}) => {
  return (
    <section className="bg-white rounded-xl shadow p-6 md:p-10 mb-8">
      <div className="flex flex-row items-center justify-between mb-8">
        <div className="flex flex-col items-start min-w-[120px]">
          <div className="flex items-center mb-2">
            <span className="bg-red-500 rounded h-6 w-4 mr-2"></span>
            <span className="text-red-500 font-bold text-lg">This Month</span>
          </div>
          <h2 className="font-bold text-black text-3xl mt-2">Best Selling Products</h2>
        </div>
        <button
          className="bg-red-500 text-white px-8 py-3 rounded font-bold shadow hover:brightness-110 transition-all duration-200 text-lg"
          onClick={onViewAll}
        >
          View All
        </button>
      </div>
      <ProductList products={products} />
    </section>
  );
};

export default BestSellerSection;