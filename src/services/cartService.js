// src/services/cartService.js
import axios from "axios";

export async function fetchCart() {
  // Lấy token từ localStorage
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  const response = await fetch(`http://localhost:8081/api/carts`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error("Failed to fetch cart");
  const data = await response.json();
  console.log("[Cart API Response]", data);
  return data;
}

export const addToCart = (productId, quantity) => {
  console.log("[cartService.js] addToCart START", { productId, quantity });
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not logged in");
  console.log("Gọi addToCart API", { productId, quantity, token });
  const result = axios.post(
    "http://localhost:8081/api/carts",
    { productId, quantity },
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  console.log("[cartService.js] addToCart END (promise returned)", result);
  return result;
};
