import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/userService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import colorPattern from "../styles/colorPattern";
import "../styles/global.css";
import Message from "../components/common/Message";

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
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setFormData(prev => ({ ...prev, username: rememberedUser, rememberMe: true }));
    }

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
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setMessageType(""); setIsLoading(true);
    try {
      await loginUser({ username: formData.username, password: formData.password });
      if (formData.rememberMe) localStorage.setItem("rememberedUser", formData.username);
      else localStorage.removeItem("rememberedUser");
      setMessage("Login successful! Redirecting...");
      setMessageType("success");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setMessage("Sign in failed. Please check your credentials!");
      setMessageType("error");
    } finally { setIsLoading(false); }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setMessage(""); setMessageType(""); setIsLoading(true);
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
    } finally { setIsLoading(false); }
  };

  const handleFacebookLogin = () => {
    setMessage(""); setMessageType(""); setIsLoading(true);
    if (!window.FB) { window.fbAsyncInit(); setTimeout(() => { setMessage("Facebook SDK failed to load!"); setMessageType("error"); setIsLoading(false); }, 1000); return; }
    window.FB.login((response) => {
      if (response.authResponse) {
        const { accessToken } = response.authResponse;
        axios.post("http://localhost:8081/api/authenticate/facebook", { accessToken }, { headers: { 'Content-Type': 'application/json' } })
          .then(res => {
            localStorage.setItem("token", res.data.data.token);
            setMessage("Facebook sign in successful! Redirecting...");
            setMessageType("success");
            setTimeout(() => navigate("/home"), 1000);
          })
          .catch(err => { setMessage(err.response?.data?.message || "Facebook sign in failed!"); setMessageType("error"); })
          .finally(() => setIsLoading(false));
      } else { setMessage("Facebook sign in was cancelled!"); setMessageType("error"); setIsLoading(false); }
    }, { scope: "public_profile,email" });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colorPattern.backgroundGray }}>
      <div className="flex-1 flex items-center justify-center relative py-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full opacity-10 animate-pulse" style={{ backgroundColor: colorPattern.secondary }} />
          <div className="absolute top-1/4 -right-16 w-48 h-48 rounded-full opacity-5" style={{ backgroundColor: colorPattern.primary }} />
          <div className="absolute -bottom-16 left-1/4 w-24 h-24 rotate-45 opacity-10" style={{ backgroundColor: colorPattern.accent }} />
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 rounded-full opacity-10 animate-bounce" style={{ backgroundColor: colorPattern.gold }} />
        </div>

        {/* Login Container */}
        <div className="relative z-10 w-full max-w-sm mx-4">
          <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: colorPattern.background, backdropFilter: 'blur(15px)', boxShadow: `0 20px 60px ${colorPattern.shadowDark}` }}>
            {/* Header */}
            <div className="px-6 py-6 text-white text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 100%)` }}>
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
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: colorPattern.background + '20' }}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Welcome Back</h2>
                <p className="text-base sm:text-lg opacity-90">Sign in to SportZone</p>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold mb-1" style={{ color: colorPattern.primary }}>Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: colorPattern.textLight }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                      className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm"
                      style={{ backgroundColor: colorPattern.inputBg, borderColor: colorPattern.inputBorder, color: colorPattern.text }}
                      onFocus={e => { e.target.style.borderColor = colorPattern.inputFocus; e.target.style.boxShadow = `0 0 0 2px ${colorPattern.primaryLight}40`; }}
                      onBlur={e => { e.target.style.borderColor = colorPattern.inputBorder; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold mb-1" style={{ color: colorPattern.primary }}>Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3" style={{ color: colorPattern.textLight }}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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
                      className="w-full pl-10 pr-3 py-2 rounded-lg border text-sm"
                      style={{ backgroundColor: colorPattern.inputBg, borderColor: colorPattern.inputBorder, color: colorPattern.text }}
                      onFocus={e => { e.target.style.borderColor = colorPattern.inputFocus; e.target.style.boxShadow = `0 0 0 2px ${colorPattern.primaryLight}40`; }}
                      onBlur={e => { e.target.style.borderColor = colorPattern.inputBorder; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center" style={{ color: colorPattern.textLight }}>
                    <input type="checkbox" id="rememberMe" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="mr-2 h-3 w-3 rounded" style={{ accentColor: colorPattern.primary }} />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="font-medium transition-colors" style={{ color: colorPattern.primary }}
                    onMouseEnter={e => e.target.style.color = colorPattern.secondary}
                    onMouseLeave={e => e.target.style.color = colorPattern.primary}
                  >Forgot password?</Link>
                </div>

                {/* Message */}
                {message && <Message type={messageType} message={message} />}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-3 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none"
                  style={{ background: isLoading ? colorPattern.disabled : `linear-gradient(135deg, ${colorPattern.primary} 0%, ${colorPattern.primaryLight} 100%)`, color: colorPattern.textWhite }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : "Sign In"}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center my-4">
                <div className="flex-grow" style={{ borderTop: `1px solid ${colorPattern.border}` }}></div>
                <span className="px-2 text-sm font-medium" style={{ color: colorPattern.textLight }}>or continue with</span>
                <div className="flex-grow" style={{ borderTop: `1px solid ${colorPattern.border}` }}></div>
              </div>

              {/* Social login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg shadow-md hover:shadow-lg text-sm transition-all focus:outline-none"
                  style={{ backgroundColor: colorPattern.background, border: `1px solid ${colorPattern.border}` }}
                  onClick={() => document.querySelector("[aria-labelledby='button-label']").click()}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    {/* Google logo path */}
                  </svg>
                  <span style={{ color: colorPattern.text }}>Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg shadow-md hover:shadow-lg text-sm transition-all focus:outline-none"
                  style={{ backgroundColor: '#1877F2', color: colorPattern.textWhite }}
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    {/* Facebook logo path */}
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Sign up */}
              <div className="mt-4 text-center text-sm" style={{ color: colorPattern.textLight }}>
                Don't have an account?{" "}
                <Link to="/register" className="font-bold transition-colors" style={{ color: colorPattern.primary }}
                  onMouseEnter={e => e.target.style.color = colorPattern.secondary}
                  onMouseLeave={e => e.target.style.color = colorPattern.primary}
                >Sign up now</Link>
              </div>
            </div>
          </div>

          <p className="text-center mt-4 text-sm" style={{ color: colorPattern.textLight }}>
            © 2025 SportZone. All rights reserved.
          </p>
        </div>
      </div>

      {/* Hidden GoogleLogin */}
      <div style={{ display: "none" }}>
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => { setMessage("Google sign in failed!"); setMessageType("error"); }}
        />
      </div>
    </div>
  );
};

export default LoginPage;
