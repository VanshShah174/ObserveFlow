#!/bin/bash
# ==============================================================
# ObserveFlow — Load Generator
# ==============================================================
# Sends continuous traffic to all services to generate
# traces, metrics, and logs for the observability demo.
#
# Run after port-forward.sh is active.
# Usage: bash scripts/generate-load.sh [duration_in_seconds]
# ==============================================================

BASE_URL="http://localhost:3000"
DURATION=${1:-60}
INTERVAL=1

# Use curl.exe on Windows (Git Bash), curl on Linux/Mac
if command -v curl.exe &>/dev/null; then
  CURL="curl.exe"
else
  CURL="curl"
fi

echo "🔥 Generating load for ${DURATION}s..."
echo "   Target: $BASE_URL"
echo "   Interval: ${INTERVAL}s between requests"
echo ""

END_TIME=$((SECONDS + DURATION))
COUNT=0

while [ $SECONDS -lt $END_TIME ]; do
  COUNT=$((COUNT + 1))
  echo "── Request batch #$COUNT ──"

  # Browse products
  $CURL -s "$BASE_URL/api/products" > /dev/null
  echo "  → GET /api/products"

  # Get single product
  PRODUCT_ID=$(( (RANDOM % 10) + 1 ))
  $CURL -s "$BASE_URL/api/products/$PRODUCT_ID" > /dev/null
  echo "  → GET /api/products/$PRODUCT_ID"

  # Add to cart
  $CURL -s -X POST "$BASE_URL/api/cart/user-1/items" \
    -H "Content-Type: application/json" \
    -d "{\"productId\":\"$PRODUCT_ID\",\"name\":\"Product $PRODUCT_ID\",\"price\":29.99,\"quantity\":1}" > /dev/null
  echo "  → POST /api/cart/user-1/items"

  # Get cart
  $CURL -s "$BASE_URL/api/cart/user-1" > /dev/null
  echo "  → GET /api/cart/user-1"

  # Create order (every 3rd iteration)
  if [ $((COUNT % 3)) -eq 0 ]; then
    $CURL -s -X POST "$BASE_URL/api/orders" \
      -H "Content-Type: application/json" \
      -d '{"userId":"user-1"}' > /dev/null
    echo "  → POST /api/orders (checkout!)"
  fi

  # Get orders
  $CURL -s "$BASE_URL/api/orders/user-1" > /dev/null
  echo "  → GET /api/orders/user-1"

  sleep $INTERVAL
done

echo ""
echo "✅ Load generation complete! $COUNT batches sent."
echo "   Check Grafana (localhost:3001) for metrics"
echo "   Check Jaeger (localhost:16686) for traces"
