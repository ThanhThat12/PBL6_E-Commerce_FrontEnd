import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";

export default function LogoutContent() {
  const { logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Bạn có chắc chắn muốn đăng xuất?</h2>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: "10px 24px",
          background: "#1E88E5",
          color: "white",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Đăng xuất
      </button>
    </div>
  );
}
