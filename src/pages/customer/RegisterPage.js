import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import colorPattern from "../../styles/colorPattern";
import Message from "../../components/common/Message";
import SendOtpForm from "../../components/form/SendOtpForm";
import VerifyOTP from "../../components/form/VerifyOTP";

function Register() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const { register: formRegister, handleSubmit, reset } = useForm();

  // Step 1: gửi contact để nhận OTP
  const onCheckContact = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/register/check-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: data.contact })
      });
      const result = await res.json();
      if (res.ok) {
        setContact(data.contact);
        setMessage("Mã OTP đã được gửi đến " + data.contact);
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
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp })
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("✅ OTP chính xác, hãy tạo tài khoản");
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

  // Step 2: resend OTP
  const onResendOtp = async () => {
    if (!contact) return;
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/register/check-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact })
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("🔄 Mã OTP đã được gửi lại đến " + contact);
        setMessageType("success");
      } else {
        setMessage(result.error || "Không thể gửi lại OTP");
        setMessageType("error");
      }
    } catch {
      setMessage("Không thể kết nối server");
      setMessageType("error");
    }
    setIsLoading(false);
  };

  // Step 3: đăng ký
  const onRegister = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      setMessageType("error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:8081/api/register/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact,
          username: data.username,
          password: data.password,
          confirmPassword: data.confirmPassword
        })
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("🎉 Đăng ký thành công, hãy đăng nhập");
        setMessageType("success");
        setStep(1);
        reset();
      } else {
        setMessage(result.error || "Đăng ký thất bại");
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
      <div className="flex-1 flex items-center justify-center relative py-12">
        {/* Animated Sports Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-24 h-24 rounded-full opacity-10 animate-pulse" style={{ backgroundColor: colorPattern.fitness }} />
          <div className="absolute top-1/3 right-10 w-32 h-32 opacity-5" style={{ backgroundColor: colorPattern.outdoor, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          <div className="absolute bottom-20 left-1/4 w-20 h-20 rotate-45 opacity-10" style={{ backgroundColor: colorPattern.team }} />
          <div className="absolute bottom-10 right-1/3 w-28 h-28 rounded-full opacity-5 animate-bounce" style={{ backgroundColor: colorPattern.water }} />
          <div className="absolute top-2/3 left-20 w-16 h-16 opacity-10" style={{ backgroundColor: colorPattern.winter, clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
        </div>

        {/* Card Container */}
        <div className="relative z-10 w-full max-w-lg mx-4">
          <div 
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: colorPattern.background,
              boxShadow: `0 25px 80px ${colorPattern.shadowDark}`,
            }}
          >
            {/* Header */}
            <div 
              className="px-8 py-8 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colorPattern.secondary} 0%, ${colorPattern.secondaryLight} 100%)`,
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id="sport-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.3"/>
                      <circle cx="5" cy="5" r="1" fill="currentColor" opacity="0.2"/>
                      <circle cx="15" cy="15" r="1.5" fill="currentColor" opacity="0.25"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#sport-pattern)"/>
                </svg>
              </div>
              
              <div className="relative z-10">
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
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <h1 
                  className="text-3xl font-bold mb-2"
                  style={{ color: colorPattern.textWhite }}
                >
                  Join SportZone
                </h1>
                <p 
                  className="text-lg opacity-90"
                  style={{ color: colorPattern.textWhite }}
                >
                  {step === 1 && "Create your account to get started"}
                  {step === 2 && "Verify your contact information"}
                  {step === 3 && "Complete your profile setup"}
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-8 py-6" style={{ backgroundColor: colorPattern.backgroundGray }}>
              <div className="flex items-center justify-center space-x-4">
                {[
                  { num: 1, label: "Contact", icon: "✉️" },
                  { num: 2, label: "Verify", icon: "🔐" },
                  { num: 3, label: "Create", icon: "👤" }
                ].map((stepInfo) => (
                  <div key={stepInfo.num} className="flex items-center">
                    <div 
                      className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
                        step >= stepInfo.num ? 'shadow-lg transform scale-105' : ''
                      }`}
                      style={{
                        backgroundColor: step >= stepInfo.num ? colorPattern.secondary : colorPattern.disabled,
                        color: colorPattern.textWhite,
                      }}
                    >
                      <span className="text-lg">{step >= stepInfo.num ? stepInfo.icon : stepInfo.num}</span>
                    </div>
                    {stepInfo.num < 3 && (
                      <div 
                        className="w-8 h-1 mx-2 rounded transition-all duration-300"
                        style={{
                          backgroundColor: step > stepInfo.num ? colorPattern.secondary : colorPattern.disabled,
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

              {/* Step 1: Nhập contact */}
              {step === 1 && (
                <div>
                  <SendOtpForm
                    onSubmit={onCheckContact}
                    isLoading={isLoading}
                    register={formRegister}
                    handleSubmit={handleSubmit}
                  />
                  <div className="mt-6 text-center">
                    <p style={{ color: colorPattern.textLight }}>
                      Already have an account?{" "}
                      <Link 
                        to="/login" 
                        className="font-semibold transition-colors"
                        style={{ color: colorPattern.secondary }}
                        onMouseEnter={(e) => {
                          e.target.style.color = colorPattern.secondaryDark;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = colorPattern.secondary;
                        }}
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Nhập OTP */}
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

              {/* Step 3: Đăng ký */}
              {step === 3 && (
                <form onSubmit={handleSubmit(onRegister)} className="space-y-6">
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colorPattern.secondary }}
                    >
                      Username
                    </label>
                    <div className="relative">
                      <span 
                        className="absolute inset-y-0 left-0 flex items-center pl-4"
                        style={{ color: colorPattern.textLight }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all"
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        {...formRegister("username", { required: true })}
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colorPattern.secondary }}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span 
                        className="absolute inset-y-0 left-0 flex items-center pl-4"
                        style={{ color: colorPattern.textLight }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all"
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        {...formRegister("password", { required: true })}
                        placeholder="Create a strong password"
                      />
                    </div>
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-semibold mb-2"
                      style={{ color: colorPattern.secondary }}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span 
                        className="absolute inset-y-0 left-0 flex items-center pl-4"
                        style={{ color: colorPattern.textLight }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <input
                        type="password"
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none transition-all"
                        style={inputStyle}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        {...formRegister("confirmPassword", { required: true })}
                        placeholder="Confirm your password"
                      />
                    </div>
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
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center mt-6">
            <p className="text-lg" style={{ color: colorPattern.textLight }}>
              © 2025 SportZone. Join the sporting community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;