// src/hooks/useProducts.js
import { useState, useEffect } from "react";
import { fetchAllProducts } from "../services/productService";

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[useProducts] Fetching products from API...");
    fetchAllProducts()
      .then((data) => {
        setProducts(data);
        console.log("[useProducts] Data from API:", data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}
