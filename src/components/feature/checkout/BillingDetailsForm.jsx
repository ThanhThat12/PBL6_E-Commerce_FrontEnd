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

  return (
    <form className="w-full p-0">
      <h2 style={{ color: colorPattern.text, fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Billing Details</h2>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="firstName" style={{ color: colorPattern.textLight }}>
            First Name<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            style={{ background: colorPattern.inputBg, color: colorPattern.text, borderRadius: 6, padding: '8px 16px', width: '100%', outline: 'none', border: `1px solid ${colorPattern.border}` }}
            value={form.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="companyName" style={{ color: colorPattern.textLight }}>
            Company Name
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            style={{ background: colorPattern.inputBg, color: colorPattern.text, borderRadius: 6, padding: '8px 16px', width: '100%', outline: 'none', border: `1px solid ${colorPattern.border}` }}
            value={form.companyName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="street" style={{ color: colorPattern.textLight }}>
            Street Address<span style={{ color: colorPattern.error }}>*</span>
          </label>
          <input
            id="street"
            name="street"
            type="text"
            required
            style={{ background: colorPattern.inputBg, color: colorPattern.text, borderRadius: 6, padding: '8px 16px', width: '100%', outline: 'none', border: `1px solid ${colorPattern.border}` }}
            value={form.street}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="apartment" style={{ color: colorPattern.textLight }}>
            Apartment, floor, etc. (optional)
          </label>
          <input
            id="apartment"
            name="apartment"
            type="text"
            style={{ background: colorPattern.inputBg, color: colorPattern.text, borderRadius: 6, padding: '8px 16px', width: '100%', outline: 'none', border: `1px solid ${colorPattern.border}` }}
            value={form.apartment}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="city">
            Town/City<span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            value={form.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="phone">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-gray-500 text-sm mb-1" htmlFor="email">
            Email Address<span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-gray-100 rounded-md px-4 py-2 outline-none focus:ring-2 focus:ring-primary"
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
            className="accent-red-500 w-5 h-5 rounded mr-2"
          />
          <label htmlFor="saveInfo" className="text-gray-700 text-sm select-none">
            <span className="text-black">Save this information for faster check-out next time</span>
          </label>
        </div>
      </div>
    </form>
  );
};

export default BillingDetailsForm;
