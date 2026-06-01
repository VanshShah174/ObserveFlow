const express = require("express");
const cors = require("cors");
const { trace } = require("@opentelemetry/api");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Structured JSON logging middleware (with trace correlation)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    // Extract trace context from the active span (injected by OTel auto-instrumentation)
    const span = trace.getActiveSpan();
    const spanContext = span?.spanContext();

    const log = {
      timestamp: new Date().toISOString(),
      service: "product-service",
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

// Sample products
const products = [
  { id: "1", name: "Wireless Headphones", price: 79.99, description: "Premium noise-cancelling wireless headphones with 30hr battery life.", image: "https://picsum.photos/seed/headphones/300/300", stock: 25 },
  { id: "2", name: "Mechanical Keyboard", price: 129.99, description: "RGB mechanical keyboard with Cherry MX switches.", image: "https://picsum.photos/seed/keyboard/300/300", stock: 15 },
  { id: "3", name: "Ultra-Wide Monitor", price: 499.99, description: "34-inch curved ultra-wide monitor, 144Hz refresh rate.", image: "https://picsum.photos/seed/monitor/300/300", stock: 8 },
  { id: "4", name: "Ergonomic Mouse", price: 59.99, description: "Vertical ergonomic mouse designed for all-day comfort.", image: "https://picsum.photos/seed/mouse/300/300", stock: 40 },
  { id: "5", name: "USB-C Hub", price: 45.99, description: "7-in-1 USB-C hub with HDMI, USB 3.0, and SD card reader.", image: "https://picsum.photos/seed/usbhub/300/300", stock: 60 },
  { id: "6", name: "Laptop Stand", price: 34.99, description: "Adjustable aluminum laptop stand for better posture.", image: "https://picsum.photos/seed/stand/300/300", stock: 30 },
  { id: "7", name: "Webcam HD", price: 89.99, description: "1080p HD webcam with built-in microphone and auto-focus.", image: "https://picsum.photos/seed/webcam/300/300", stock: 20 },
  { id: "8", name: "Desk Lamp", price: 42.99, description: "LED desk lamp with adjustable brightness and color temperature.", image: "https://picsum.photos/seed/lamp/300/300", stock: 35 },
  { id: "9", name: "Portable SSD", price: 109.99, description: "1TB portable SSD with USB 3.2 Gen 2 speeds.", image: "https://picsum.photos/seed/ssd/300/300", stock: 18 },
  { id: "10", name: "Bluetooth Speaker", price: 64.99, description: "Waterproof portable Bluetooth speaker with 12hr battery.", image: "https://picsum.photos/seed/speaker/300/300", stock: 22 },
];

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "product-service" });
});

// Get all products
app.get("/products", (req, res) => {
  res.json(products);
});

// Get single product
app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

app.listen(PORT, () => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "product-service",
    message: `Product service running on port ${PORT}`,
  }));
});
