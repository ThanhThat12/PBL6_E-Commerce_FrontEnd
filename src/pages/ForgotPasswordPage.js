import React, { useState } from "react";
import { useForm } from "react-hook-form";
import colorPattern from "../styles/colorPattern";
import Navbar from "../components/common/Navbar";
import Message from "../components/common/Message";
import VerifyOTP from "../components/form/VerifyOTP";
import SendOtpForm from "../components/form/SendOtpForm";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // Step 1: gửi OTP
  const onSendOtp = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: data.contact }),
      });
      const result = await res.json();
      if (res.ok) {
        setContact(data.contact);
        setMessage("OTP đã được gửi tới " + data.contact);
        setMessageType("success");
        setStep(2);
      } else {
        setMessage(result.error || "Lỗi gửi OTP");
        setMessageType("error");
      }
    } catch {
      setMessage("Không thể kết nối server");
      setMessageType("error");
    }
    setIsLoading(false);
  };

  // Step 2: xác minh OTP
  const onVerifyOtp = async () => {
    if (!otp) {
      setMessage("❌ Vui lòng nhập OTP");
      setMessageType("error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("✅ OTP chính xác, hãy đặt mật khẩu mới");
        setMessageType("success");
        setStep(3);
      } else {
        setMessage(result.error || "OTP không hợp lệ");
        setMessageType("error");
      }
    } catch {
      setMessage("Không thể kết nối server");
      setMessageType("error");
    }
    setIsLoading(false);
  };

  // Resend OTP handler
  const onResendOtp = async () => {
    if (!contact) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("OTP đã được gửi lại tới " + contact);
        setMessageType("success");
      } else {
        setMessage(result.error || "Lỗi gửi lại OTP");
        setMessageType("error");
      }
    } catch {
      setMessage("Không thể kết nối server");
      setMessageType("error");
    }
    setIsLoading(false);
  };

  // Step 3: đặt mật khẩu mới
  const onResetPassword = async (data) => {
    if (data.password !== data.confirmNewPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      setMessageType("error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contact, 
          otp, 
          newPassword: data.password, 
          confirmNewPassword: data.confirmNewPassword 
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("🎉 Đặt mật khẩu thành công, hãy đăng nhập lại");
        setMessageType("success");
        setStep(1);
        reset();
      } else {
        setMessage(result.error || "Đặt mật khẩu thất bại");
        setMessageType("error");
      }
    } catch {
      setMessage("Không thể kết nối server");
      setMessageType("error");
    }
    setIsLoading(false);
  };

  const inputStyle = {
    backgroundColor: colorPattern.inputBg,
    borderColor: colorPattern.inputBorder,
    color: colorPattern.text,
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = colorPattern.inputFocus;
    e.target.style.boxShadow = `0 0 0 2px ${colorPattern.primaryLight}40`;
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = colorPattern.inputBorder;
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colorPattern.backgroundGray }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center relative py-12">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full opacity-5"
            style={{
              background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.secondary} 100%)`,
            }}
          />
          {/* Sport-themed background elements */}
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: colorPattern.secondary }} />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-5" style={{ backgroundColor: colorPattern.primary }} />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rotate-45 opacity-5" style={{ backgroundColor: colorPattern.accent }} />
        </div>

        {/* Card Container */}
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div 
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{ 
              backgroundColor: colorPattern.background,
              boxShadow: `0 20px 60px ${colorPattern.shadowDark}`,
            }}
          >
            {/* Header */}
            <div 
              className="px-8 py-8 text-center"
              style={{
                background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 100%)`,
              }}
            >
              <div className="mb-4">
                <div 
                  className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: colorPattern.background + '20' }}
                >
                  <svg 
                    className="w-10 h-10" 
                    fill="none" 
                    stroke={colorPattern.textWhite} 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: colorPattern.textWhite }}
              >
                Reset Password
              </h1>
              <p 
                className="text-lg opacity-90"
                style={{ color: colorPattern.textWhite }}
              >
                {step === 1 && "Enter your contact to receive OTP"}
                {step === 2 && "Verify your identity"}
                {step === 3 && "Set your new password"}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="px-8 py-6" style={{ backgroundColor: colorPattern.backgroundGray }}>
              <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        step >= stepNum ? 'shadow-lg' : ''
                      }`}
                      style={{
                        backgroundColor: step >= stepNum ? colorPattern.primary : colorPattern.disabled,
                        color: colorPattern.textWhite,
                      }}
                    >
                      {stepNum}
                    </div>
                    {stepNum < 3 && (
                      <div 
                        className="w-8 h-1 mx-2 rounded"
                        style={{
                          backgroundColor: step > stepNum ? colorPattern.primary : colorPattern.disabled,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              {message && (
                <div className="mb-6">
                  <Message type={messageType} message={message} />
                </div>
              )}

              {step === 1 && (
                <SendOtpForm
                  onSubmit={onSendOtp}
                  isLoading={isLoading}
                  register={register}
                  handleSubmit={handleSubmit}
                />
              )}

              {step === 2 && (
                <VerifyOTP
                  otp={otp}
                  setOtp={setOtp}
                  onSubmit={onVerifyOtp}
                  onResend={onResendOtp}
                  isLoading={isLoading}
                  message={messageType === "error" || messageType === "success" ? message : ""}
                />
              )}

              {step === 3 && (
                <form onSubmit={handleSubmit(onResetPassword)} className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colorPattern.primary }}
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      {...register("password", { required: true })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colorPattern.primary }}
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none transition-all"
                      style={inputStyle}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      {...register("confirmNewPassword", { required: true })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1" 
                    style={{
                      backgroundColor: isLoading ? colorPattern.disabled : colorPattern.accent,
                      color: colorPattern.textWhite,
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = colorPattern.accentDark;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.backgroundColor = colorPattern.accent;
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center mt-6">
            <a 
              href="/login" 
              className="inline-flex items-center text-lg font-medium transition-colors"
              style={{ color: colorPattern.primary }}
              onMouseEnter={(e) => {
                e.target.style.color = colorPattern.secondary;
              }}
              onMouseLeave={(e) => {
                e.target.style.color = colorPattern.primary;
              }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;