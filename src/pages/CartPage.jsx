import React, { useState } from "react";
import Roadmap from '../components/common/Roadmap';
import ProductsInCart from '../components/feature/cart/ProductsInCart';
import ApplyCoupon from '../components/common/ApplyCoupon';
import CartTotal from '../components/feature/cart/CartTotal';

const initialProducts = [
  {
    id: 1,
    name: "LCD Monitor",
    image: "https://i.imgur.com/2.jpg",
    price: 650,
    quantity: 1,
  },
  {
    id: 2,
    name: "H1 Gamepad",
    image: "https://i.imgur.com/3.jpg",
    price: 550,
    quantity: 2,
  },
];

const CartPage = () => {
  const [products, setProducts] = useState(initialProducts);

  const handleQuantityChange = (id, quantity) => {
    setProducts(products => products.map(p => p.id === id ? { ...p, quantity } : p));
  };

  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shipping = "Free";
  const total = subtotal;

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col gap-8 pt-8">
      <div className="container mx-auto px-4 flex flex-col gap-8">
        <Roadmap items={[{ label: "Home", href: "/" }, { label: "Cart", active: true }]} />
        <ProductsInCart products={products} onQuantityChange={handleQuantityChange} />
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 flex flex-col gap-8">
            <div className="flex justify-between w-full gap-4">
              <button className="border border-gray-400 rounded px-6 py-2 font-medium bg-white hover:bg-gray-50 transition">Return To Shop</button>
              <button className="border border-gray-400 rounded px-6 py-2 font-medium bg-white hover:bg-gray-50 transition">Update Cart</button>
            </div>
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div className="flex-1">
                <ApplyCoupon onApply={code => alert(`Apply coupon: ${code}`)} />
              </div>
              <div className="w-full md:w-1/2 max-w-xs">
                <CartTotal subtotal={subtotal} shipping={shipping} total={total} onCheckout={() => alert('Proceed to checkout')} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
