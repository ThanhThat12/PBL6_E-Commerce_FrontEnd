import React from "react";

export default function SendOtpForm({
  onSubmit,
  isLoading,
  register,
  handleSubmit,
  COLOR_INPUT,
  COLOR_BTN,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#1E88E5] mb-1">
          Email hoặc Số điện thoại
        </label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${COLOR_INPUT}`}
          {...register("contact", { required: true })}
          placeholder="Nhập email hoặc số điện thoại"
        />
      </div>
      <button
        type="submit"
        className={`w-full py-2 rounded-lg font-semibold ${COLOR_BTN} transition`}
        disabled={isLoading}
      >
        Gửi OTP
      </button>
    </form>
  );
}