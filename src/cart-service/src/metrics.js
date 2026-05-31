// ==============================================================
// Custom Business Metrics — Cart Service
// ==============================================================
// Demonstrates all 3 OTel metric types:
//   Counter   — things that only go up (total items added)
//   Gauge     — things that go up AND down (current cart size)
//   Histogram — distribution of values (operation duration)
//
// These metrics are exported via the OTel SDK (auto-injected)
// → OTel Collector → Prometheus → Grafana
// ==============================================================

const { metrics } = require("@opentelemetry/api");

const meter = metrics.getMeter("cart-service", "1.0.0");

// COUNTER — Total items added to cart (monotonically increasing)
// Use case: "How many items have been added since the service started?"
const itemsAddedCounter = meter.createCounter("cart_items_added_total", {
  description: "Total number of items added to cart",
  unit: "items",
});

// GAUGE (UpDownCounter) — Current items across all carts
// Use case: "How many items are in carts RIGHT NOW?"
const currentItemsGauge = meter.createUpDownCounter("cart_items_current", {
  description: "Current number of items across all active carts",
  unit: "items",
});

// HISTOGRAM — Duration of cart operations
// Use case: "What's the p95 latency of add-to-cart operations?"
const operationDuration = meter.createHistogram("cart_operation_duration_seconds", {
  description: "Duration of cart operations",
  unit: "s",
});

module.exports = {
  itemsAddedCounter,
  currentItemsGauge,
  operationDuration,
};
