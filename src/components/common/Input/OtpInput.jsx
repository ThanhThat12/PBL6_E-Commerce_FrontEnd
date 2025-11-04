import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const OtpInput = ({
  length = 6,
  onComplete,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
  className = '',
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (onChange) {
      onChange(newOtp.join(''));
    }

    if (element.value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      if (onChange) {
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < length) {
        newOtp[index] = char;
      }
    });
    
    setOtp(newOtp);
    
    if (onChange) {
      onChange(newOtp.join(''));
    }

    const lastFilledIndex = Math.min(pastedData.length, length) - 1;
    inputRefs.current[lastFilledIndex]?.focus();

    if (newOtp.every(digit => digit !== '') && onComplete) {
      onComplete(newOtp.join(''));
    }
  };

  const inputBaseClasses = 'w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-neutral-100 disabled:cursor-not-allowed';
  
  const inputStateClasses = error
    ? 'border-accent-red-500 focus:border-accent-red-500 focus:ring-accent-red-500'
    : 'border-border-DEFAULT focus:border-primary-500 focus:ring-primary-500';

  return (
    <div className={className}>
      <div className="flex gap-3 justify-center">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`${inputBaseClasses} ${inputStateClasses}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-3 text-sm text-accent-red-500 text-center">{error}</p>
      )}
    </div>
  );
};

OtpInput.propTypes = {
  length: PropTypes.number,
  onComplete: PropTypes.func,
  onChange: PropTypes.func,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
};

export default OtpInput;