import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/common/Navbar";
import Message from "../components/common/Message";
import SendOtpForm from "../components/form/SendOtpForm";
import VerifyOTP from "../components/form/VerifyOTP";

const COLOR_GRADIENT = "bg-gradient-to-r from-[#1E88E5] via-[#42A5F5] to-[#90CAF9]";
const COLOR_BTN = "bg-[#1E88E5] hover:bg-[#42A5F5] text-white";
const COLOR_INPUT = "border-[#B3E5FC] focus:ring-[#42A5F5] focus:border-[#42A5F5]";
const COLOR_CARD = "bg-white/90 backdrop-blur-md shadow-xl";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center relative">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={require("../assets/background1.jpg")}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/70 via-[#42A5F5]/60 to-[#90CAF9]/50 backdrop-blur-sm"></div>
        </div>
        {/* Card */}
        <div className="relative z-10 w-full max-w-md mx-4 my-8">
          <div className={`${COLOR_CARD} rounded-2xl p-8`}>
            <h2 className="text-2xl font-bold text-[#1E88E5] mb-2 text-center">Đăng ký tài khoản</h2>
            <p className="text-[#42A5F5] text-center mb-6">Nhập email hoặc số điện thoại để đăng ký</p>
            {message && (
              <Message type={messageType} message={message} />
            )}

            {/* Step 1: Nhập contact */}
            {step === 1 && (
              <SendOtpForm
                onSubmit={onCheckContact}
                isLoading={isLoading}
                register={formRegister}
                handleSubmit={handleSubmit}
                COLOR_INPUT={COLOR_INPUT}
                COLOR_BTN={COLOR_BTN}
              />
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
              <form onSubmit={handleSubmit(onRegister)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1E88E5] mb-1">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
                    {...formRegister("username", { required: true })}
                    placeholder="Nhập tên đăng nhập"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E88E5] mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
                    {...formRegister("password", { required: true })}
                    placeholder="Nhập mật khẩu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E88E5] mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
                    {...formRegister("confirmPassword", { required: true })}
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full py-2 rounded-lg font-semibold ${COLOR_BTN} transition`}
                  disabled={isLoading}
                >
                  Đăng ký
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;