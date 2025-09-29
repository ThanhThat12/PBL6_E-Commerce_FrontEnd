import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Navbar from "../components/common/Navbar";
import Message from "../components/common/Message";
import VerifyOTP from "../components/form/VerifyOTP";
import SendOtpForm from "../components/form/SendOtpForm";

const COLOR_GRADIENT = "bg-gradient-to-r from-[#1E88E5] via-[#42A5F5] to-[#90CAF9]";
const COLOR_BTN = "bg-[#1E88E5] hover:bg-[#42A5F5] text-white";
const COLOR_BTN_SUCCESS = "bg-[#42A5F5] hover:bg-[#1E88E5] text-white";
const COLOR_INPUT = "border-[#B3E5FC] focus:ring-[#42A5F5] focus:border-[#42A5F5]";
const COLOR_CARD = "bg-white/90 backdrop-blur-md shadow-xl";

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className={`flex-1 flex items-center justify-center relative`}>
        {/* Background
        <div className="absolute inset-0 z-0">
          <div className={`${COLOR_GRADIENT} w-full h-full opacity-80`}></div>
        </div> */}
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
            <h2 className="text-2xl font-bold text-[#1E88E5] mb-2 text-center">Quên mật khẩu</h2>
            <p className="text-[#42A5F5] text-center mb-6">Nhập email hoặc số điện thoại để lấy lại mật khẩu</p>
            {message && (
              <Message type={messageType} message={message} />
            )}

            {step === 1 && (
              <SendOtpForm
                onSubmit={onSendOtp}
                isLoading={isLoading}
                register={register}
                handleSubmit={handleSubmit}
                COLOR_INPUT={COLOR_INPUT}
                COLOR_BTN={COLOR_BTN}
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
              <form onSubmit={handleSubmit(onResetPassword)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1E88E5] mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
                    {...register("password", { required: true })}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E88E5] mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
                    {...register("confirmNewPassword", { required: true })}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
                <button type="submit" className={`w-full py-2 rounded-lg font-semibold ${COLOR_BTN} transition`} disabled={isLoading}>
                  Đặt mật khẩu mới
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;