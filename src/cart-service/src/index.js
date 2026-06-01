const express = require("express");
const cors = require("cors");
const { trace } = require("@opentelemetry/api");
const { itemsAddedCounter, currentItemsGauge, operationDuration } = require("./metrics");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

// Structured JSON logging middleware (with trace correlation)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    const log = {
      timestamp: new Date().toISOString(),
      service: "cart-service",
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
      traceId: spanContext?.traceId || "",
      spanId: spanContext?.spanId || "",
    };
    console.log(JSON.stringify(log));
  });
  next();
});

// In-memory cart storage
const carts = {};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "cart-service" });
});

// Get cart for user
app.get("/cart/:userId", (req, res) => {
  const start = performance.now();

  const { userId } = req.params;
  const cart = carts[userId] || { userId, items: [] };

  // Record histogram — how long this operation took
  const duration = (performance.now() - start) / 1000;
  operationDuration.record(duration, { operation: "get_cart" });

  res.json(cart);
});

// Add item to cart
app.post("/cart/:userId/items", (req, res) => {
  const start = performance.now();

  const { userId } = req.params;
  const { productId, name, price, quantity } = req.body;

  if (!productId || !name || !price) {
    return res.status(400).json({ error: "productId, name, and price are required" });
  }

  if (!carts[userId]) {
    carts[userId] = { userId, items: [] };
  }

  const existingItem = carts[userId].items.find((item) => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += quantity || 1;
  } else {
    carts[userId].items.push({
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      name,
      price,
      quantity: quantity || 1,
    });
  }

  // Record COUNTER — item was added
  itemsAddedCounter.add(1, { product_id: productId, user_id: userId });

  // Record GAUGE — current items increased
  currentItemsGauge.add(quantity || 1);

  // Record HISTOGRAM — operation duration
  const duration = (performance.now() - start) / 1000;
  operationDuration.record(duration, { operation: "add_item" });

  res.status(201).json(carts[userId]);
});

// Remove item from cart
app.delete("/cart/:userId/items/:itemId", (req, res) => {
  const start = performance.now();

  const { userId, itemId } = req.params;

  if (!carts[userId]) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const itemIndex = carts[userId].items.findIndex((item) => item.id === itemId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Item not found in cart" });
  }

  const removedItem = carts[userId].items[itemIndex];

  // Record GAUGE — current items decreased
  currentItemsGauge.add(-(removedItem.quantity || 1));

  carts[userId].items.splice(itemIndex, 1);

  // Record HISTOGRAM — operation duration
  const duration = (performance.now() - start) / 1000;
  operationDuration.record(duration, { operation: "remove_item" });

  res.json(carts[userId]);
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "cart-service",
    message: `Cart service running on port ${PORT}`,
  }));
});
