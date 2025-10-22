import React, { useRef, useState, useEffect } from 'react';

/**
 * OTPInput Component
 * Input field for OTP verification with auto-focus and paste support
 * 
 * @param {number} length - Number of OTP digits (default: 6)
 * @param {function} onChange - Callback when OTP changes
 * @param {function} onComplete - Callback when OTP is complete
 * @param {boolean} disabled - Disable input
 * @param {string} error - Error message
 */
const OTPInput = ({
  length = 6,
  onChange,
  onComplete,
  disabled = false,
  error = '',
}) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  /**
   * Handle input change
   */
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Call onChange callback
    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete if all digits filled
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  /**
   * Handle keydown (backspace, arrow keys)
   */
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        if (onChange) {
          onChange(newOtp.join(''));
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Handle paste
   */
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Only allow numbers
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    const digits = pastedData.slice(0, length).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastFilledIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Call callbacks
    const otpString = newOtp.join('');
    if (onChange) {
      onChange(otpString);
    }
    if (otpString.length === length && onComplete) {
      onComplete(otpString);
    }
  };

  /**
   * Clear OTP
   */
  const clearOtp = () => {
    setOtp(Array(length).fill(''));
    if (onChange) {
      onChange('');
    }
    inputRefs.current[0]?.focus();
  };

  // Expose clearOtp method
  useEffect(() => {
    if (window.clearOtpInput) {
      window.clearOtpInput = clearOtp;
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 md:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={`
              w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold
              border-2 rounded-lg transition-all duration-200 outline-none
              ${error
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
              }
              ${disabled
                ? 'bg-gray-100 cursor-not-allowed text-gray-500'
                : 'bg-white text-gray-900 hover:border-gray-400'
              }
              ${digit ? 'border-primary-500' : ''}
            `}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-600 text-sm text-center mt-3" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default OTPInput;
