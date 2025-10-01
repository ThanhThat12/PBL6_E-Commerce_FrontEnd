export const categories = [
  { name: "Gloves", count: 10 },
  { name: "Equipment", count: 5 },
  { name: "Gear", count: 7 },
  { name: "Accessories", count: 8 },
];

export const locations = ["Hanoi", "Ho Chi Minh", "Da Nang"];
export const conditions = ["New", "Used"];
export const ratings = [4, 3, 2, 1];
// Example image URLs (replace with your own or use a service)
const productImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=150&q=80", // Vegetables
  "https://images.unsplash.com/photo-1464306076886-2550bca6a166?auto=format&fit=crop&w=150&q=80", // Fruits
  "https://images.unsplash.com/photo-1519864600265-abb23843b6c1?auto=format&fit=crop&w=150&q=80", // Dairy
  "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=150&q=80", // Bakery
];

export const products = Array.from({ length: 42 }).map((_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: (Math.random() * 1000000 + 10000).toFixed(0), // VND
  rating: (Math.random() * 2 + 3).toFixed(1),
  sold: Math.floor(Math.random() * 1000) + 1,
  image: productImages[i % productImages.length],
  stock: Math.floor(Math.random() * 50), // Number of products in stock (0 means out of stock)
    category: categories[i % categories.length].name,
}));