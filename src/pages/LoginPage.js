import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "../styles/login.css";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginUser({ 
        username: formData.username, 
        password: formData.password 
      });
      if (formData.rememberMe) {
        localStorage.setItem("rememberedUser", formData.username);
      } else {
        localStorage.removeItem("rememberedUser");
      }
      navigate("/home");
    } catch (err) {
      setError("Sign in failed. Please check your credentials!");
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
      setError("Google sign in failed!");
    }
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      window.fbAsyncInit();
      setTimeout(() => {
        if (!window.FB) setError("Facebook SDK failed to load! Please refresh the page.");
      }, 1000);
      return;
    }
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const { accessToken } = response.authResponse;
          axios.post("http://localhost:8081/api/authenticate/facebook", 
            { accessToken }, 
            { headers: { 'Content-Type': 'application/json' } }
          )
            .then((res) => {
              localStorage.setItem("token", res.data.data.token);
              navigate("/home");
            })
            .catch((err) => {
              setError(err.response?.data?.message || "Facebook sign in failed!");
            });
        } else {
          setError("Facebook sign in was cancelled!");
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={require("../assets/your-background.jpg")}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
      </div>

      {/* Login form */}
      <div className="relative z-10 w-full max-w-md mx-auto rounded-2xl bg-white/80 backdrop-blur-md shadow-xl p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full  flex items-center justify-center ">
            <img
              src={require("../assets/art78.jpg")}
              alt="Shiftwave Logo"
              className="w-12 h-12 object-contain rounded-full"
            />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Sign In</h2>
        <p className="text-gray-500 text-center mb-6">Welcome back! Please enter your details</p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="mr-2"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-purple-700 hover:underline text-sm">
              Forgot password?
            </Link>
          </div>
          {error && <div className="text-red-600 text-center mb-3 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-md transition mb-4"
          >
            Sign in
          </button>
        </form>

        <div className="flex items-center w-full my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-400 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition font-medium text-gray-700"
            onClick={() => {
              document.querySelector("[aria-labelledby='button-label']").click();
            }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition font-medium"
            onClick={handleFacebookLogin}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
              <path fill="#3F51B5" d="M42 37a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v26z" />
              <path fill="#FFF" d="M34.368 25H31v13h-5V25h-3v-4h3v-2.41c.002-3.508 1.459-5.59 5.592-5.59H35v4h-2.287C31.104 17 31 17.6 31 18.723V21h4l-.632 4z" />
            </svg>
            Continue with Facebook
          </button>
        </div>
      </div>

      {/* Hidden GoogleLogin component */}
      <div style={{ display: "none" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setError("Google sign in failed!")}
        />
      </div>
    </div>
  );
};

export default LoginPage;