import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import colorPattern from "../styles/colorPattern";
import "../styles/global.css";
import Message from "../components/common/Message";
import Navbar from "../components/common/Navbar";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for remembered user
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setFormData(prev => ({
        ...prev,
        username: rememberedUser,
        rememberMe: true
      }));
    }

    // Facebook SDK setup
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
    setMessage("");
    setMessageType("");
    setIsLoading(true);
    
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
      
      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setMessage("Sign in failed. Please check your credentials!");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setMessage("");
    setMessageType("");
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8081/api/authenticate/google", {
        idToken: credentialResponse.credential,
      });
      localStorage.setItem("token", res.data.data.token);
      setMessage("Google sign in successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setMessage("Google sign in failed!");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    setMessage("");
    setMessageType("");
    setIsLoading(true);
    
    if (!window.FB) {
      window.fbAsyncInit();
      setTimeout(() => {
        if (!window.FB) {
          setMessage("Facebook SDK failed to load! Please refresh the page.");
          setMessageType("error");
          setIsLoading(false);
        }
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
              setMessage("Facebook sign in successful! Redirecting...");
              setMessageType("success");
              setTimeout(() => navigate("/home"), 1000);
            })
            .catch((err) => {
              setMessage(err.response?.data?.message || "Facebook sign in failed!");
              setMessageType("error");
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setMessage("Facebook sign in was cancelled!");
          setMessageType("error");
          setIsLoading(false);
        }
      },
      { scope: "public_profile,email" }
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colorPattern.backgroundGray }}>
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center relative py-12">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full opacity-10 animate-pulse" style={{ backgroundColor: colorPattern.secondary }} />
          <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full opacity-5" style={{ backgroundColor: colorPattern.primary }} />
          <div className="absolute -bottom-20 left-1/4 w-32 h-32 rotate-45 opacity-10" style={{ backgroundColor: colorPattern.accent }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colorPattern.gold }} />
        </div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-md mx-4">
          {/* Glass card effect with sports theme */}
          <div 
            className="rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundColor: colorPattern.background,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 25px 80px ${colorPattern.shadowDark}`,
            }}
          >
            {/* SportZone Header */}
            <div 
              className="px-8 py-8 text-white text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 100%)`,
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                  <circle cx="50" cy="30" r="1.5" fill="currentColor" />
                  <circle cx="80" cy="25" r="2.5" fill="currentColor" />
                  <circle cx="30" cy="70" r="1" fill="currentColor" />
                  <circle cx="70" cy="80" r="2" fill="currentColor" />
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="mb-4">
                  <div 
                    className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: colorPattern.background + '20' }}
                  >
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                <p className="text-lg opacity-90">Sign in to SportZone</p>
              </div>
            </div>

            {/* Form area */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: colorPattern.primary }}
                  >
                    Username
                  </label>
                  <div className="relative">
                    <span 
                      className="absolute inset-y-0 left-0 flex items-center pl-4"
                      style={{ color: colorPattern.textLight }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{
                        backgroundColor: colorPattern.inputBg,
                        borderColor: colorPattern.inputBorder,
                        color: colorPattern.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colorPattern.inputFocus;
                        e.target.style.boxShadow = `0 0 0 3px ${colorPattern.primaryLight}40`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colorPattern.inputBorder;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold mb-2"
                    style={{ color: colorPattern.primary }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <span 
                      className="absolute inset-y-0 left-0 flex items-center pl-4"
                      style={{ color: colorPattern.textLight }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border transition-all focus:outline-none"
                      style={{
                        backgroundColor: colorPattern.inputBg,
                        borderColor: colorPattern.inputBorder,
                        color: colorPattern.text,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = colorPattern.inputFocus;
                        e.target.style.boxShadow = `0 0 0 3px ${colorPattern.primaryLight}40`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = colorPattern.inputBorder;
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm" style={{ color: colorPattern.textLight }}>
                    <input
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="mr-2 h-4 w-4 rounded"
                      style={{ accentColor: colorPattern.primary }}
                    />
                    Remember me
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium transition-colors"
                    style={{ color: colorPattern.primary }}
                    onMouseEnter={(e) => {
                      e.target.style.color = colorPattern.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = colorPattern.primary;
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Message component for feedback */}
                {message && (
                  <Message type={messageType} message={message} />
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none"
                  style={{
                    background: isLoading 
                      ? colorPattern.disabled 
                      : `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 100%)`,
                    color: colorPattern.textWhite,
                  }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-grow" style={{ borderTop: `1px solid ${colorPattern.border}` }}></div>
                <span className="px-4 text-sm font-medium" style={{ color: colorPattern.textLight }}>or continue with</span>
                <div className="flex-grow" style={{ borderTop: `1px solid ${colorPattern.border}` }}></div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none"
                  style={{
                    backgroundColor: colorPattern.background,
                    border: `1px solid ${colorPattern.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colorPattern.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colorPattern.background;
                  }}
                  onClick={() => {
                    document.querySelector("[aria-labelledby='button-label']").click();
                  }}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                  </svg>
                  <span style={{ color: colorPattern.text }}>Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none"
                  style={{
                    backgroundColor: '#1877F2',
                    color: colorPattern.textWhite,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1864d2';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#1877F2';
                  }}
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#fff" d="M34.368 25H31v13h-5V25h-3v-4h3v-2.41c.002-3.508 1.459-5.59 5.592-5.59H35v4h-2.287C31.104 17 31 17.6 31 18.723V21h4l-.632 4z" />
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p style={{ color: colorPattern.textLight }}>
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="font-bold transition-colors"
                    style={{ color: colorPattern.primary }}
                    onMouseEnter={(e) => {
                      e.target.style.color = colorPattern.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = colorPattern.primary;
                    }}
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Copyright text */}
          <p className="text-center mt-8 text-lg" style={{ color: colorPattern.textLight }}>
            © 2025 SportZone. All rights reserved.
          </p>
        </div>
      </div>

      {/* Hidden GoogleLogin component */}
      <div style={{ display: "none" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => {
            setMessage("Google sign in failed!");
            setMessageType("error");
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;