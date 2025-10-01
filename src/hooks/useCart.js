// src/hooks/useCart.js
import { useState, useEffect } from "react";
import { fetchCart } from "../services/cartService";

export default function useCart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart()
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { cart, loading, error };
}
