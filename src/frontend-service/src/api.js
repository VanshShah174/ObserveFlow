const PRODUCT_SERVICE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || "http://localhost:4000";
const CART_SERVICE_URL = import.meta.env.VITE_CART_SERVICE_URL || "http://localhost:4001";
const ORDER_SERVICE_URL = import.meta.env.VITE_ORDER_SERVICE_URL || "http://localhost:4002";

const USER_ID = "user-1"; // Hardcoded user for demo purposes

// Product APIs
export async function fetchProducts() {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products`);
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products/${id}`);
  return res.json();
}

// Cart APIs
export async function fetchCart() {
  const res = await fetch(`${CART_SERVICE_URL}/cart/${USER_ID}`);
  return res.json();
}

export async function addToCart(product) {
  const res = await fetch(`${CART_SERVICE_URL}/cart/${USER_ID}/items`, {
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
  const res = await fetch(`${CART_SERVICE_URL}/cart/${USER_ID}/items/${itemId}`, {
    method: "DELETE",
  });
  return res.json();
}

// Order APIs
export async function createOrder() {
  const res = await fetch(`${ORDER_SERVICE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: USER_ID }),
  });
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${ORDER_SERVICE_URL}/orders/${USER_ID}`);
  return res.json();
}
