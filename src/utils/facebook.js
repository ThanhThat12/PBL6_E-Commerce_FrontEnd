// Lightweight helper to dynamically load Facebook SDK and initialize it
export function loadFacebookSdk(appId, locale = 'vi_VN') {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('window is undefined'));

    if (window.FB) {
      // If already initialized, resolve immediately
      return resolve(window.FB);
    }

    // Create fbAsyncInit to initialize SDK when it loads
    window.fbAsyncInit = function () {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: 'v17.0',
        });
        resolve(window.FB);
      } catch (err) {
        reject(err);
      }
    };

    // Prevent multiple script inserts
    if (document.getElementById('facebook-jssdk')) {
      // If script exists but FB not ready yet, rely on fbAsyncInit
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = `https://connect.facebook.net/${locale}/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
}

// Convenience helper to request login and return the authResponse
export function facebookLogin(FB, options = { scope: 'public_profile,email' }) {
  return new Promise((resolve, reject) => {
    if (!FB) return reject(new Error('FB SDK not loaded'));

    FB.login((response) => {
      if (response && response.authResponse) {
        resolve(response.authResponse);
      } else {
        reject(response);
      }
    }, options);
  });
}
