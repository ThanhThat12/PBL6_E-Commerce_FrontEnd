import React from "react";
import colorPattern from "../../styles/colorPattern";

export default function VerifyOTP({
  onSubmit,
  onResend,
  otp,
  setOtp,
  isLoading,
  message,
}) {
  // Handle input change - only allow numbers
  const handleChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setOtp(value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp?.length === 6) {
      onSubmit && onSubmit();
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div 
        className="w-full max-w-md rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center"
        style={{
          backgroundColor: colorPattern.backgroundGray,
          border: `1px solid ${colorPattern.primary}`,
          boxShadow: `0 8px 32px ${colorPattern.shadow}`,
        }}
      >
        {/* Header with Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md"
            style={{ backgroundColor: colorPattern.primary }}
          >
            <svg 
              className="w-8 h-8" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke={colorPattern.textWhite}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 
            className="text-2xl font-bold"
            style={{ color: colorPattern.primary }}
          >
            Verification
          </h2>
        </div>

        {/* Subtitle */}
        <p 
          className="text-center mb-6"
          style={{ color: colorPattern.textLight }}
        >
          We have sent a verification code to your email
        </p>

        {/* OTP Input Form */}
        <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
          {/* Visual OTP Display */}
          <div className="w-full flex justify-between mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index} 
                className="w-12 h-14 flex items-center justify-center rounded-md border-2 transition-colors"
                style={{
                  borderColor: otp && otp[index] ? colorPattern.primary : colorPattern.border,
                  backgroundColor: otp && otp[index] ? colorPattern.primaryLight + '20' : colorPattern.background,
                }}
              >
                <span 
                  className="text-2xl font-bold"
                  style={{ color: colorPattern.primary }}
                >
                  {otp && otp[index] ? otp[index] : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg text-center transition-colors focus:outline-none"
              style={{
                border: `1px solid ${colorPattern.inputBorder}`,
                backgroundColor: colorPattern.background,
                color: colorPattern.text,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = colorPattern.inputFocus;
                e.target.style.boxShadow = `0 0 0 2px ${colorPattern.primaryLight}40`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colorPattern.inputBorder;
                e.target.style.boxShadow = 'none';
              }}
              value={otp || ""}
              onChange={handleChange}
              maxLength={6}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (otp || "").length !== 6}
            className="w-full py-3 rounded-lg font-semibold transition-colors mb-4"
            style={{
              backgroundColor: (otp || "").length === 6 && !isLoading 
                ? colorPattern.primary 
                : colorPattern.disabled,
              color: colorPattern.textWhite,
              cursor: (otp || "").length === 6 && !isLoading ? 'pointer' : 'not-allowed',
            }}
            onMouseEnter={(e) => {
              if ((otp || "").length === 6 && !isLoading) {
                e.target.style.backgroundColor = colorPattern.primaryDark;
              }
            }}
            onMouseLeave={(e) => {
              if ((otp || "").length === 6 && !isLoading) {
                e.target.style.backgroundColor = colorPattern.primary;
              }
            }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg 
                  className="animate-spin -ml-1 mr-2 h-5 w-5" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  style={{ color: colorPattern.textWhite }}
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </div>
            ) : (
              "Verify"
            )}
          </button>
        </form>

        {/* Resend Link */}
        <div className="w-full text-center">
          <button
            type="button"
            className="text-sm font-medium transition-colors"
            style={{ 
              color: colorPattern.primaryLight,
            }}
            onMouseEnter={(e) => {
              e.target.style.color = colorPattern.primary;
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colorPattern.primaryLight;
              e.target.style.textDecoration = 'none';
            }}
            onClick={onResend}
            disabled={isLoading}
          >
            Didn't receive code? Resend OTP
          </button>
        </div>
      </div>
    </div>
  );
}