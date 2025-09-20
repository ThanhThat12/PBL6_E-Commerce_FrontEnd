import React from "react";

const InputField = ({ label, type, value, onChange, name }) => (
  <div className="mb-3">
    <label className="form-label">{label}</label>
    <input
      type={type}
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.name, e.target.value)}
      name={name}
      required
    />
  </div>
);

export default InputField;