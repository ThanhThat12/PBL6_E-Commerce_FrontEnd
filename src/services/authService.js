import { getCurrentUser } from "./userService";

export async function login(username, password) {
  const res = await fetch('http://localhost:8081/api/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  let userInfo = null;
  if (data.data && data.data.token) {
    localStorage.setItem('token', data.data.token);
    // Gọi API lấy user info từ token
    try {
      const userRes = await getCurrentUser();
      userInfo = userRes.data;
    } catch (e) {
      userInfo = null;
    }
  }
  return { ...data, user: userInfo };
}
