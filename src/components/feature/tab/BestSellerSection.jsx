
import ProductList from "../../common/ProductList";
import { bestSellerProducts } from '../../../mockDataBestSeller';

const BestSellerSection = ({
  products = bestSellerProducts,
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