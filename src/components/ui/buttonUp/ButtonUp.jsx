import React from "react";
import colorPattern from '../../../styles/colorPattern';

const ButtonUp = ({ onClick }) => (
  <button
    style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center', 
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: colorPattern.inputBg,
      color: colorPattern.text,
      fontSize: 24,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      zIndex: 50
    }}
    className="md:flex hidden"
    onClick={onClick}
    aria-label="Return to Top"
  >
    ↑
  </button>
);

export default ButtonUp;