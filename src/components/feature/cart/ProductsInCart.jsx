
import CartProductItem from './CartProductItem';

const ProductsInCart = ({ products = [], onQuantityChange }) => {
  return (
    <div className="cart-products-table w-full bg-transparent">
      <div className="hidden md:grid grid-cols-4 gap-2 px-2 pb-2">
        <div className="font-semibold text-gray-500 py-3 min-w-[180px] text-left">Product</div>
        <div className="font-semibold text-gray-500 py-3 min-w-[100px] text-center">Price</div>
        <div className="font-semibold text-gray-500 py-3 min-w-[100px] text-center">Quantity</div>
        <div className="font-semibold text-gray-500 py-3 min-w-[100px] text-center">Subtotal</div>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((item) => (
          <CartProductItem key={item.id} item={item} onQuantityChange={onQuantityChange} />
        ))}
      </div>
    </div>
  );
};

export default ProductsInCart;
