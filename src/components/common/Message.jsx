import React from "react";
import colorPattern from "../../styles/colorPattern";

/**
 * Message component for displaying success or error messages.
 * @param {string} type - "success" or "error"
 * @param {string} message - The message text to display
 */
const Message = ({ type = "success", message }) => {
  if (!message) return null;
  
  const getMessageStyles = () => {
    if (type === "success") {
      return {
        backgroundColor: colorPattern.successLight,
        color: colorPattern.success,
        borderColor: colorPattern.success,
      };
    } else if (type === "error") {
      return {
        backgroundColor: colorPattern.errorLight,
        color: colorPattern.error,
        borderColor: colorPattern.error,
      };
    } else if (type === "warning") {
      return {
        backgroundColor: colorPattern.warningLight,
        color: colorPattern.warning,
        borderColor: colorPattern.warning,
      };
    } else if (type === "info") {
      return {
        backgroundColor: colorPattern.infoLight,
        color: colorPattern.info,
        borderColor: colorPattern.info,
      };
    }
    // Default to success
    return {
      backgroundColor: colorPattern.successLight,
      color: colorPattern.success,
      borderColor: colorPattern.success,
    };
  };

  return (
    <div
      className="text-center mb-3 text-sm px-4 py-2 rounded transition border"
      style={getMessageStyles()}
    >
      {message}
    </div>
  );
};

export default Message;