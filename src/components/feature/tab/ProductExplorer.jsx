
import { explorerProducts } from '../../../mockDataExplorer';
import ProductList from "../../common/ProductList";

const ProductExplorer = ({
  products = explorerProducts,
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