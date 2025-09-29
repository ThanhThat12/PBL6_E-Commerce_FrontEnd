import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

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
  },
  pageContainer: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  mainContent: {
    flex: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  footer: {
    marginTop: "auto",
  }
};

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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
      await loginUser({ username, password });
      navigate("/home");
    } catch (err) {
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!");
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:8081/api/authenticate/google", {
        idToken: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.data.token);
      navigate("/home");
    } catch (err) {
      console.error("Google login error:", err.response?.data || err.message);
    }
  };

  const handleGoogleError = () => setError("Đăng nhập Google thất bại!");

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
              localStorage.setItem("token", res.data.data.token);
              navigate("/home");
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
    <div style={styles.pageContainer}>
      <main style={styles.mainContent}>
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
      </main>
    </div>
  );
};

export default LoginPage;