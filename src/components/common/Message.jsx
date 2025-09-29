import React from "react";

/**
 * Message component for displaying success or error messages.
 * @param {string} type - "success" or "error"
 * @param {string} message - The message text to display
 */
const Message = ({ type = "success", message }) => {
  if (!message) return null;
  const base =
    "text-center mb-3 text-sm px-4 py-2 rounded transition";
  const color =
    type === "success"
      ? "bg-green-100 text-green-700 border border-green-300"
      : "bg-red-100 text-red-700 border border-red-300";
  return <div className={`${base} ${color}`}>{message}</div>;
};

export default Message;