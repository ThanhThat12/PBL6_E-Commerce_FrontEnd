// src/services/productService.js
// Service for product-related API calls

export async function fetchAllProducts() {
  const response = await fetch("http://localhost:8081/api/products/all");
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}
