import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/userService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { extractUserFromToken } from "../../utils/jwtUtils";

const styles = {
  container: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "32px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    fontFamily: "Segoe UI, Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333"
  },
  formGroup: {
    marginBottom: "18px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "12px",
  },
  link: {
    display: "block",
    textAlign: "right",
    marginTop: "8px",
    color: "#1976d2",
    textDecoration: "none",
    fontSize: "15px",
  },
  divider: {
    margin: "24px 0",
    border: "none",
    borderTop: "1px solid #eee",
  },
  socialBtn: {
    width: "100%",
    padding: "12px",
    background: "#4267B2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  },
  socialContainer: {
    marginTop: "10px",
    textAlign: "center",
  }
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1095601362306172",
        cookie: true,
        xfbml: true,
        version: "v20.0",
      });

      window.FB.getLoginStatus(function(response) {
        console.log('FB login status:', response);
      });
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      const facebookScript = document.getElementById('facebook-jssdk');
      if (facebookScript) facebookScript.remove();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      console.log("🔐 Attempting login with:", { username, password: "***" });
      const response = await loginUser({ username, password });
      
      console.log("✅ Login response:", response);
      console.log("📦 Response data:", response.data);
      
      // ✅ Backend mới trả về format: {status, message, data: {user, token, refreshToken}}
      if (response.data && response.data.data) {
        const { user: backendUser, token, refreshToken } = response.data.data;
        
        console.log("🔑 Token received:", token?.substring(0, 50) + "...");
        console.log("👤 User from backend:", backendUser);
        
        if (token && backendUser) {
          // ✅ Sử dụng user info trực tiếp từ backend thay vì extract từ JWT
          const user = {
            id: backendUser.id,
            username: backendUser.username,
            email: backendUser.email,
            role: backendUser.role === 'SELLER' ? 1 : 
                  backendUser.role === 'BUYER' ? 2 : 
                  backendUser.role === 'ADMIN' ? 0 : null,
            authorities: backendUser.role
          };
          
          console.log("👤 Processed user:", user);
          console.log("🎭 User role:", user.role, `(${user.authorities})`);
          
          // Lưu vào AuthContext
          login(user, token, refreshToken);
          
          // Phân quyền và điều hướng
          if (user.role === 1) { // SELLER
            console.log("→ Redirecting to seller dashboard");
            navigate("/seller/dashboard");
          } else if (user.role === 2) { // BUYER/CUSTOMER
            console.log("→ Redirecting to customer home");
            navigate("/home");
          } else if (user.role === 0) { // ADMIN
            console.log("→ Redirecting to admin dashboard");
            navigate("/admin/dashboard");
          } else {
            console.log("→ Unknown role, redirecting to home");
            navigate("/");
          }
        } else {
          console.error("❌ Missing token or user info");
          setError("Phản hồi từ server thiếu thông tin cần thiết!");
        }
      } else {
        console.error("❌ Invalid response format:", response.data);
        setError("Backend trả về dữ liệu không hợp lệ!");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      console.error("❌ Error response:", err.response?.data);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Đăng nhập thất bại!";
      
      if (err.response?.status === 401) {
        errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng!";
      } else if (err.response?.status === 403) {
        errorMessage = "Tài khoản của bạn không có quyền truy cập!";
      } else if (err.response?.status === 500) {
        errorMessage = "Lỗi máy chủ! Vui lòng thử lại sau.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8081/api/authenticate/google", {
        idToken: credentialResponse.credential,
      });
      
      // ✅ Cập nhật format mới cho Google login
      if (res.data && res.data.data) {
        const { user: backendUser, token, refreshToken } = res.data.data;
        
        console.log("🔑 Google token received:", token?.substring(0, 50) + "...");
        
        if (token && backendUser) {
          const user = {
            id: backendUser.id,
            username: backendUser.username,
            email: backendUser.email,
            role: backendUser.role === 'SELLER' ? 1 : 
                  backendUser.role === 'BUYER' ? 2 : 
                  backendUser.role === 'ADMIN' ? 0 : null,
            authorities: backendUser.role
          };
          
          console.log("👤 Google user:", user);
          
          // Lưu vào AuthContext
          login(user, token, refreshToken);
          
          // Phân quyền và điều hướng
          if (user.role === 1) { // SELLER
            navigate("/seller/dashboard");
          } else if (user.role === 2) { // BUYER/CUSTOMER
            navigate("/home");
          } else if (user.role === 0) { // ADMIN
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        } else {
          setError("Phản hồi Google thiếu thông tin cần thiết!");
        }
      } else {
        setError("Google trả về dữ liệu không hợp lệ!");
      }
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Đăng nhập Google thất bại!");
    }
  };

  // ✅ Thêm function handleGoogleError
  const handleGoogleError = (error) => {
    console.error("❌ Google login error:", error);
    setError("Đăng nhập Google thất bại! Vui lòng thử lại.");
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      window.fbAsyncInit();
      setTimeout(() => {
        if (!window.FB) setError("Facebook SDK chưa được load! Vui lòng tải lại trang.");
      }, 1000);
      return;
    }

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          axios.post("http://localhost:8081/api/authenticate/facebook", { accessToken }, { headers: { 'Content-Type': 'application/json' } })
            .then((res) => {
              // ✅ Cập nhật format mới cho Facebook login
              if (res.data && res.data.data) {
                const { user: backendUser, token, refreshToken } = res.data.data;
                
                console.log("🔑 Facebook token received:", token?.substring(0, 50) + "...");
                
                if (token && backendUser) {
                  const user = {
                    id: backendUser.id,
                    username: backendUser.username,
                    email: backendUser.email,
                    role: backendUser.role === 'SELLER' ? 1 : 
                          backendUser.role === 'BUYER' ? 2 : 
                          backendUser.role === 'ADMIN' ? 0 : null,
                    authorities: backendUser.role
                  };
                  
                  console.log("👤 Facebook user:", user);
                  
                  // Lưu vào AuthContext
                  login(user, token, refreshToken);
                  
                  // Phân quyền và điều hướng
                  if (user.role === 1) { // SELLER
                    navigate("/seller/dashboard");
                  } else if (user.role === 2) { // BUYER/CUSTOMER
                    navigate("/home");
                  } else if (user.role === 0) { // ADMIN
                    navigate("/admin/dashboard");
                  } else {
                    navigate("/");
                  }
                } else {
                  setError("Phản hồi Facebook thiếu thông tin cần thiết!");
                }
              } else {
                setError("Facebook trả về dữ liệu không hợp lệ!");
              }
            })
            .catch((err) => {
              setError(err.response?.data?.message || "Đăng nhập Facebook thất bại!");
            });
        } else {
          setError("Đăng nhập Facebook bị hủy!");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Tên đăng nhập:</label>
          <input
            type="text"
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Nhập tên đăng nhập hoặc email"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Mật khẩu:</label>
          <input
            type="password"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" style={styles.button}>Đăng nhập</button>
      </form>

      <Link to="/forgot-password" style={styles.link}>Quên mật khẩu?</Link>

      <hr style={styles.divider} />
      <div style={styles.socialContainer}>
        <h3>Hoặc đăng nhập bằng</h3>
        <div style={{ marginBottom: "10px" }}>
          <GoogleLogin onSuccess={handleGoogleLogin} onError={handleGoogleError} />
        </div>
        <button style={styles.socialBtn} onClick={handleFacebookLogin}>
          Đăng nhập với Facebook
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
