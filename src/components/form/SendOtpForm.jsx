import React from "react";
import colorPattern from "../../styles/colorPattern";

export default function SendOtpForm({
  onSubmit,
  isLoading,
  register,
  handleSubmit,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label 
          className="block text-sm font-medium mb-1"
          style={{ color: colorPattern.primary }}
        >
          Email hoặc Số điện thoại
        </label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none transition-colors"
          style={{
            backgroundColor: colorPattern.inputBg,
            borderColor: colorPattern.inputBorder,
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
          {...register("contact", { required: true })}
          placeholder="Nhập email hoặc số điện thoại"
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 rounded-lg font-semibold transition-colors"
        style={{
          backgroundColor: isLoading ? colorPattern.disabled : colorPattern.primary,
          color: colorPattern.textWhite,
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = colorPattern.primaryDark;
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = colorPattern.primary;
          }
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Đang gửi...' : 'Gửi OTP'}
      </button>
    </form>
  );
}