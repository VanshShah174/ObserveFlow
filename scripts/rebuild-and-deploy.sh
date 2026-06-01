#!/bin/bash
# ==============================================================
# ObserveFlow — Rebuild All Services and Deploy to Kind
# ==============================================================
# Builds all service images, loads into kind, and restarts pods.
# Usage: bash scripts/rebuild-and-deploy.sh
# ==============================================================

set -e

CLUSTER_NAME="observeflow"
NAMESPACE="observeflow"
REGISTRY="vanshshah17"

SERVICES=(
  "product-service"
  "cart-service"
  "order-service"
  "user-service"
  "notification-service"
  "inventory-service"
)

echo "🔨 Building all service images..."
echo ""

for svc in "${SERVICES[@]}"; do
  echo "  Building $svc..."
  docker build -t "$REGISTRY/observeflow-$svc:latest" "./src/$svc" --quiet
  echo "  ✅ $svc built"
done

echo ""
echo "📦 Loading images into kind cluster ($CLUSTER_NAME)..."
echo ""

for svc in "${SERVICES[@]}"; do
  echo "  Loading $svc..."
  kind load docker-image "$REGISTRY/observeflow-$svc:latest" --name "$CLUSTER_NAME" 2>/dev/null
  echo "  ✅ $svc loaded"
done

echo ""
echo "🔄 Restarting deployments..."
kubectl rollout restart deployment -n "$NAMESPACE"

echo ""
echo "⏳ Waiting for pods to be ready..."
sleep 10
kubectl get pods -n "$NAMESPACE" --no-headers | grep -v "otel-logs" | awk '{print $1, $2, $3}'

echo ""
echo "✅ All services rebuilt and deployed!"
echo "   Run: bash scripts/port-forward.sh"
echo "   Then: bash scripts/generate-load.sh 20"
echo "   Check logs: kubectl logs -n observeflow -l app=product-service --tail=3"
