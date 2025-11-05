import React, { useState } from "react";
import colorPattern from "../../../styles/colorPattern";

const BillingDetailsForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    companyName: "",
    street: "",
    apartment: "",
    city: "",
    phone: "",
    email: "",
    saveInfo: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const inputStyle = {
    background: colorPattern.inputBg,
    color: colorPattern.text,
    borderRadius: 6,
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    border: `1px solid ${colorPattern.inputBorder}`,
    transition: 'border-color 0.2s',
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = colorPattern.inputFocus;
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = colorPattern.inputBorder;
  };

  return (
    <form className="w-full p-0">
      <h2 style={{ 
        color: colorPattern.text, 
        fontSize: 24, 
        fontWeight: 600, 
        marginBottom: 24 
      }}>
        Billing Details
      </h2>
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm mb-2" htmlFor="firstName" style={{ color: colorPattern.textLight }}>
            First Name<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="companyName" style={{ color: colorPattern.textLight }}>
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.companyName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="street" style={{ color: colorPattern.textLight }}>
            Street Address<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="street"
            name="street"
            type="text"
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.street}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="apartment" style={{ color: colorPattern.textLight }}>
            Apartment, floor, etc. (optional)
          </label>
          <input
            id="apartment"
            name="apartment"
            type="text"
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.apartment}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="city" style={{ color: colorPattern.textLight }}>
            Town/City<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="phone" style={{ color: colorPattern.textLight }}>
            Phone Number<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-2" htmlFor="email" style={{ color: colorPattern.textLight }}>
            Email Address<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            style={inputStyle}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            value={form.email}
            onChange={handleChange}
          />
        </div>
        <div className="flex items-center mt-2">
          <input
            id="saveInfo"
            name="saveInfo"
            type="checkbox"
            checked={form.saveInfo}
            onChange={handleChange}
            className="w-5 h-5 rounded mr-3"
            style={{ accentColor: colorPattern.primary }}
          />
          <label htmlFor="saveInfo" className="text-sm select-none" style={{ color: colorPattern.text }}>
            Save this information for faster check-out next time
          </label>
        </div>
      </div>
    </form>
  );
};

export default BillingDetailsForm;