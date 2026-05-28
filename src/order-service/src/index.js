const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4002;
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || "http://localhost:4001";

app.use(cors());
app.use(express.json());

// Structured JSON logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const log = {
      timestamp: new Date().toISOString(),
      service: "order-service",
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    };
    console.log(JSON.stringify(log));
  });
  next();
});

// In-memory order storage
const orders = {};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "order-service" });
});

// Create order from cart
app.post("/orders", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    // Fetch cart from cart-service
    const cartResponse = await fetch(`${CART_SERVICE_URL}/cart/${userId}`);
    const cart = await cartResponse.json();

    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      items: cart.items,
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    if (!orders[userId]) {
      orders[userId] = [];
    }
    orders[userId].push(order);

    // Clear the cart after order is placed
    for (const item of cart.items) {
      await fetch(`${CART_SERVICE_URL}/cart/${userId}/items/${item.id}`, {
        method: "DELETE",
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      service: "order-service",
      level: "error",
      message: "Failed to create order",
      error: error.message,
    }));
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Get orders for user
app.get("/orders/:userId", (req, res) => {
  const { userId } = req.params;
  const userOrders = orders[userId] || [];
  res.json(userOrders);
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "order-service",
    message: `Order service running on port ${PORT}`,
  }));
});
