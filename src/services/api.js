export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

// Ví dụ gọi API lấy wishlist
export async function getWishlist() {
  const res = await fetchWithAuth('/api/wishlist');
  return res.json();
}
