import React from "react";
import { CiPaperplane } from "react-icons/ci";
const Footer = () => {
  return (
    <footer className="bg-black text-white px-4 pt-16 w-full text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 pl-16 pb-12 md:grid-cols-4">
        {/* Column 1: Exclusive */}
        <div className="flex flex-col space-y-2">
          <h2 className="font-bold text-base mb-1">Exclusive</h2>
          <p className="mb-1">Subscribe</p>
          <p className="mb-2">Get 10% off your first order</p>
          <form className="flex items-center border border-white rounded overflow-hidden w-48">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-black text-white pl-2 py-1 outline-none flex-grow placeholder-gray-400 text-sm"
            />
            <button
              type="submit"
              className="bg-black text-black pr-2 py-1 flex items-center justify-center shrink-0"
              aria-label="Subscribe"
            >
              <CiPaperplane className="text-white" size={20} />
            </button>
          </form>
        </div>

        {/* Column 2: Support */}
        <div className="flex flex-col space-y-2 text-sm">
          <h2 className="font-bold text-base mb-1">Support</h2>
          <address className="not-italic">
            111 Bijoy sarani, Dhaka, <br />
            DH 1515, Bangladesh.
          </address>
          <p>exclusive@gmail.com</p>
          <p>+88015-88888-9999</p>
        </div>

        {/* Column 3: Account */}
        <div className="flex flex-col space-y-2 text-sm">
          <h2 className="font-bold text-base mb-1">Account</h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {['My Account', 'Login / Register', 'Cart', 'Wishlist', 'Shop'].map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="bg-transparent p-0 m-0 text-white hover:underline hover:text-gray-300 transition cursor-pointer text-sm"
                  aria-label={item}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Quick Link */}
        <div className="flex flex-col space-y-2 text-sm">
          <h2 className="font-bold text-base mb-1">Quick Link</h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {['Privacy Policy', 'Terms Of Use', 'FAQ', 'Contact'].map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="bg-transparent p-0 m-0 text-white hover:underline hover:text-gray-300 transition cursor-pointer text-sm"
                  aria-label={item}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <p className="text-center text-xs text-gray-500">
          © Copyright Rimel 2022. All right reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
