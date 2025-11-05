import React from "react";
import colorPattern from "../../../styles/colorPattern";
import { CiPaperplane } from "react-icons/ci";

const Footer = () => {
  return (
    <footer 
      className="px-4 pt-16 w-full text-sm"
      style={{ 
        backgroundColor: colorPattern.text,
        color: colorPattern.textWhite,
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 pl-16 pb-12 md:grid-cols-4">
        {/* Column 1: Exclusive */}
        <div className="flex flex-col space-y-2">
          <h2 
            className="font-bold text-base mb-1"
            style={{ color: colorPattern.textWhite }}
          >
            SportZone
          </h2>
          <p 
            className="mb-1"
            style={{ color: colorPattern.backgroundGray }}
          >
            Subscribe
          </p>
          <p 
            className="mb-2"
            style={{ color: colorPattern.backgroundGray }}
          >
            Get 10% off your first order
          </p>
          <form 
            className="flex items-center rounded overflow-hidden w-48"
            style={{ border: `1px solid ${colorPattern.backgroundGray}` }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="pl-2 py-1 outline-none flex-grow text-sm transition-colors"
              style={{
                backgroundColor: colorPattern.text,
                color: colorPattern.textWhite,
              }}
              onFocus={(e) => {
                e.target.style.backgroundColor = colorPattern.backgroundDark;
              }}
              onBlur={(e) => {
                e.target.style.backgroundColor = colorPattern.text;
              }}
            />
            <button
              type="submit"
              className="pr-2 py-1 flex items-center justify-center shrink-0 transition-colors"
              style={{ backgroundColor: colorPattern.text }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colorPattern.primary;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colorPattern.text;
              }}
              aria-label="Subscribe"
            >
              <CiPaperplane 
                size={20} 
                style={{ color: colorPattern.textWhite }}
              />
            </button>
          </form>
        </div>

        {/* Column 2: Support */}
        <div className="flex flex-col space-y-2 text-sm">
          <h2 
            className="font-bold text-base mb-1"
            style={{ color: colorPattern.textWhite }}
          >
            Support
          </h2>
          <address 
            className="not-italic"
            style={{ color: colorPattern.backgroundGray }}
          >
            111 Bijoy sarani, Dhaka, <br />
            DH 1515, Bangladesh.
          </address>
          <p style={{ color: colorPattern.backgroundGray }}>
            sportzone@gmail.com
          </p>
          <p style={{ color: colorPattern.backgroundGray }}>
            +88015-88888-9999
          </p>
        </div>

        {/* Column 3: Account */}
        <div className="flex flex-col space-y-2 text-sm">
          <h2 
            className="font-bold text-base mb-1"
            style={{ color: colorPattern.textWhite }}
          >
            Account
          </h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {['My Account', 'Login / Register', 'Cart', 'Wishlist', 'Shop'].map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="bg-transparent p-0 m-0 transition cursor-pointer text-sm"
                  style={{ color: colorPattern.backgroundGray }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colorPattern.secondary;
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colorPattern.backgroundGray;
                    e.target.style.textDecoration = 'none';
                  }}
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
          <h2 
            className="font-bold text-base mb-1"
            style={{ color: colorPattern.textWhite }}
          >
            Quick Link
          </h2>
          <ul className="list-none p-0 m-0 space-y-1">
            {['Privacy Policy', 'Terms Of Use', 'FAQ', 'Contact'].map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="bg-transparent p-0 m-0 transition cursor-pointer text-sm"
                  style={{ color: colorPattern.backgroundGray }}
                  onMouseEnter={(e) => {
                    e.target.style.color = colorPattern.secondary;
                    e.target.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = colorPattern.backgroundGray;
                    e.target.style.textDecoration = 'none';
                  }}
                  aria-label={item}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div 
        className="pt-4"
        style={{ borderTop: `1px solid ${colorPattern.borderDark}` }}
      >
        <p 
          className="text-center text-xs pb-4"
          style={{ color: colorPattern.textMuted }}
        >
          © Copyright SportZone 2024. All right reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;