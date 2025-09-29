import React from "react";

const ButtonUp = ({ onClick }) => (
  <button
    className="fixed bottom-8 right-8 md:flex hidden items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-black text-2xl shadow-lg z-50"
    onClick={onClick}
    aria-label="Return to Top"
  >
    ↑
  </button>
);

export default ButtonUp;