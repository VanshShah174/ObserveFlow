// In production (Kubernetes), the frontend uses relative URLs.
// Nginx reverse proxy inside the container routes /api/* to backend services.
// In local dev (vite dev server), the Vite proxy handles the same routing.

const API_BASE = import.meta.env.VITE_API_BASE || "";

const USER_ID = "user-1"; // Hardcoded user for demo purposes

// Product APIs
export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  return res.json();
}

// Cart APIs
export async function fetchCart() {
  const res = await fetch(`${API_BASE}/api/cart/${USER_ID}`);
  return res.json();
}

export async function addToCart(product) {
  const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    }),
  });
  return res.json();
}

export async function removeFromCart(itemId) {
  const res = await fetch(`${API_BASE}/api/cart/${USER_ID}/items/${itemId}`, {
    method: "DELETE",
  });
  return res.json();
}

// Order APIs
export async function createOrder() {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID }),
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/api/orders/${USER_ID}`);
  return res.json();
}
