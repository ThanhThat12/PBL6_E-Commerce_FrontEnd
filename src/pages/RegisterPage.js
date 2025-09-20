import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

function Register() {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset } = useForm();

  // Step 1: gửi contact để nhận OTP
  const onCheckContact = async (data) => {
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
    try {
      const res = await fetch("http://localhost:8081/api/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp: data.otp })
      });
      const result = await res.json();
      if (res.ok) {
        setMessage("✅ OTP chính xác, hãy tạo tài khoản");
        setStep(3);
      } else {
        setMessage(result.error || "OTP không hợp lệ");
      }
    } catch {
      setMessage("Không thể kết nối server");
    }
  };

  // Step 3: đăng ký
  const onRegister = async (data) => {
    if (data.password !== data.confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp");
      return;
    }
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
        setStep(1);
        reset();
      } else {
        setMessage(result.error || "Đăng ký thất bại");
      }
    } catch {
      setMessage("Không thể kết nối server");
    }
  };

  // Component con: Nút gửi lại OTP với countdown
  function OTPForm({ onResend }) {
    const [counter, setCounter] = useState(60);

    useEffect(() => {
      let timer;
      if (counter > 0) {
        timer = setInterval(() => {
          setCounter((prev) => prev - 1);
        }, 1000);
      }
      return () => clearInterval(timer);
    }, [counter]);

    const handleResend = () => {
      onResend();       // gọi API gửi lại OTP
      setCounter(60);   // đặt lại thời gian chờ
    };

    return (
      <button
        type="button"
        className="btn btn-link"
        onClick={handleResend}
        disabled={counter > 0}
      >
        {counter > 0 ? `Gửi lại sau ${counter}s` : "Gửi lại OTP"}
      </button>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-3">Đăng ký tài khoản</h2>
      {message && <div className="alert alert-info">{message}</div>}

      {/* Step 1 */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onCheckContact)}>
          <div className="mb-3">
            <label>Email hoặc Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              {...register("contact", { required: true })}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Gửi OTP</button>
        </form>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit(onVerifyOtp)}>
          <div className="mb-3">
            <label>Nhập mã OTP</label>
            <input
              type="text"
              className="form-control"
              {...register("otp", { required: true })}
            />
          </div>
          <button type="submit" className="btn btn-success w-100 mb-2">Xác minh OTP</button>
          <OTPForm
            onResend={async () => {
              try {
                const res = await fetch("http://localhost:8081/api/register/check-contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ contact })
                });
                const result = await res.json();
                if (res.ok) {
                  setMessage("🔄 Mã OTP đã được gửi lại đến " + contact);
                } else {
                  setMessage(result.error || "Không thể gửi lại OTP");
                }
              } catch {
                setMessage("Không thể kết nối server");
              }
            }}
          />
        </form>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onRegister)}>
          <div className="mb-3">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              className="form-control"
              {...register("username", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label>Mật khẩu</label>
            <input
              type="password"
              className="form-control"
              {...register("password", { required: true })}
            />
          </div>
          <div className="mb-3">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              className="form-control"
              {...register("confirmPassword", { required: true })}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Đăng ký</button>
        </form>
      )}
    </div>
  );
}

export default Register;
