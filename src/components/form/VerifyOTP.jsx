import React from "react";

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
      <div className="w-full max-w-md bg-[#E1F5FE] border border-[#1E88E5] rounded-2xl shadow-lg px-8 py-10 flex flex-col items-center">
        {/* Header with Icon */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#1E88E5] flex items-center justify-center mb-3 shadow-md">
            <svg className="w-8 h-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1E88E5]">Verification</h2>
        </div>

        {/* Subtitle */}
        <p className="text-gray-700 text-center mb-6">
          We have sent a verification code to your email
        </p>


        {/* OTP Input Form */}
        <form className="w-full flex flex-col items-center" onSubmit={handleSubmit}>
          {/* Visual OTP Display */}
          <div className="w-full flex justify-between mb-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div 
                key={index} 
                className={`w-12 h-14 flex items-center justify-center rounded-md border-2 ${
                  otp && otp[index]
                    ? "border-[#1E88E5] bg-[#B3E5FC]"
                    : "border-gray-300 bg-white"
                }`}
              >
                <span className="text-2xl font-bold text-[#1E88E5]">
                  {otp && otp[index] ? otp[index] : ""}
                </span>
              </div>
            ))}
          </div>

          {/* Hidden Input Field */}
          <div className="relative w-full mb-6">
            <input
              type="text"
              value={otp || ""}
              onChange={handleChange}
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="sr-only"
              autoFocus
              required
              aria-label="Enter verification code"
            />
            <input
              type="text"
              className="w-full px-4 py-3 border border-[#90CAF9] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#42A5F5] focus:border-[#1E88E5] transition text-center"
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
            className={`w-full py-3 rounded-lg font-semibold text-white transition mb-4 ${
              (otp || "").length === 6
                ? "bg-[#1E88E5] hover:bg-[#42A5F5]"
                : "bg-[#90CAF9] cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            className="text-[#42A5F5] hover:text-[#1E88E5] hover:underline text-sm font-medium transition"
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