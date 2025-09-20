import React, { useState } from "react";
import { useForm } from "react-hook-form";

function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset } = useForm();

  // Step 1: gửi OTP
  const onSendOtp = async (data) => {
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
        setStep(2);
      } else {
        setMessage(result.error || "Lỗi gửi OTP");
      }
    } catch {
      setMessage("Không thể kết nối server");
    }
  };

  // Step 2: xác minh OTP
  const onVerifyOtp = async (data) => {
    if (!data.otp) {
      setMessage("❌ Vui lòng nhập OTP");
      return;
    }
    try {
      // Gọi API verify OTP (bạn cần có API /verify-otp ở backend)
      const res = await fetch("http://localhost:8081/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp: data.otp }),
      });
      const result = await res.json();
      if (res.ok) {
        setOtp(data.otp);
        setMessage("✅ OTP chính xác, hãy đặt mật khẩu mới");
        setStep(3);
      } else {
        setMessage(result.error || "OTP không hợp lệ");
      }
    } catch {
      setMessage("Không thể kết nối server");
    }
  };

  // Step 3: đặt mật khẩu mới
  const onResetPassword = async (data) => {
    if (data.password !== data.confirmNewPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      return;
    }
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
        setStep(1);
        reset();
      } else {
        setMessage(result.error || "Đặt mật khẩu thất bại");
      }
    } catch {
      setMessage("Không thể kết nối server");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-3">Quên mật khẩu</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {step === 1 && (
        <form onSubmit={handleSubmit(onSendOtp)}>
          <div className="mb-3">
            <label>Email hoặc Số điện thoại</label>
            <input type="text" className="form-control" {...register("contact", { required: true })} />
          </div>
          <button type="submit" className="btn btn-primary w-100">Gửi OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onVerifyOtp)}>
          <div className="mb-3">
            <label>Nhập mã OTP</label>
            <input type="text" className="form-control" {...register("otp", { required: true })} />
          </div>
          <button type="submit" className="btn btn-success w-100">Xác minh OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit(onResetPassword)}>
          <div className="mb-3">
            <label>Mật khẩu mới</label>
            <input type="password" className="form-control" {...register("password", { required: true })} />
          </div>
          <div className="mb-3">
            <label>Xác nhận mật khẩu</label>
            <input type="password" className="form-control" {...register("confirmNewPassword", { required: true })} />
          </div>
          <button type="submit" className="btn btn-primary w-100">Đặt mật khẩu mới</button>
        </form>
      )}
    </div>
  );
}

export default ForgotPasswordPage;
