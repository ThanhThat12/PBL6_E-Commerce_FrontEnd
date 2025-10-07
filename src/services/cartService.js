// src/services/cartService.js

export async function fetchCart() {
  const response = await fetch(`http://localhost:8081/api/carts`);
  if (!response.ok) throw new Error("Failed to fetch cart");
  return response.json();
}
