#!/bin/bash
# ==============================================================
# ObserveFlow — One-Command Setup
# ==============================================================
# Installs everything from scratch on any Kubernetes cluster:
#   - cert-manager (TLS for OTel Operator webhook)
#   - OpenTelemetry Operator (auto-instrumentation)
#   - ObserveFlow chart (7 services + Prometheus + Grafana + Loki + Jaeger)
#   - Auto-instrumentation injection
#
# Usage:
#   bash scripts/setup.sh [namespace]
#
# Example:
#   bash scripts/setup.sh              → installs in "observeflow" namespace
#   bash scripts/setup.sh production   → installs in "production" namespace
#
# Prerequisites:
#   - kubectl connected to a cluster (Kind, Minikube, EKS, etc.)
#   - helm v3 installed
# ==============================================================

set -e

NAMESPACE=${1:-observeflow}
RELEASE_NAME="observeflow"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 ObserveFlow Setup — namespace: $NAMESPACE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── Step 1: Add Helm repos ───────────────────────────────────
echo "📦 Step 1/6: Adding Helm repositories..."
helm repo add jetstack https://charts.jetstack.io 2>/dev/null || true
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts 2>/dev/null || true
helm repo add observeflow https://vanshshah174.github.io/ObserveFlow 2>/dev/null || true
helm repo update
echo "  ✅ Repos added"
echo ""

# ─── Step 2: Install cert-manager ─────────────────────────────
echo "🔐 Step 2/6: Installing cert-manager..."
if helm status cert-manager -n cert-manager >/dev/null 2>&1; then
  echo "  ⏭️  cert-manager already installed, skipping"
else
  helm install cert-manager jetstack/cert-manager \
    -n cert-manager --create-namespace \
    --set crds.enabled=true \
    --wait --timeout 3m
  echo "  ✅ cert-manager installed"
fi
echo ""

# ─── Step 3: Install OTel Operator ────────────────────────────
echo "📡 Step 3/6: Installing OpenTelemetry Operator..."
if helm status otel-operator -n otel-system >/dev/null 2>&1; then
  echo "  ⏭️  OTel Operator already installed, skipping"
else
  helm install otel-operator open-telemetry/opentelemetry-operator \
    -n otel-system --create-namespace \
    --set "manager.collectorImage.repository=otel/opentelemetry-collector-contrib" \
    --wait --timeout 3m
  echo "  ✅ OTel Operator installed"
fi
echo ""

# ─── Step 4: Install ObserveFlow ──────────────────────────────
echo "🎯 Step 4/6: Installing ObserveFlow..."
if helm status $RELEASE_NAME -n $NAMESPACE >/dev/null 2>&1; then
  echo "  ⏭️  ObserveFlow already installed, upgrading..."
  helm upgrade $RELEASE_NAME observeflow/observeflow -n $NAMESPACE
else
  helm install $RELEASE_NAME observeflow/observeflow \
    -n $NAMESPACE --create-namespace
fi
echo "  ✅ ObserveFlow deployed"
echo ""

# ─── Step 5: Wait for pods ────────────────────────────────────
echo "⏳ Step 5/6: Waiting for pods to be ready (~60s)..."
sleep 30
kubectl wait --for=condition=ready pod -l app=cart-service -n $NAMESPACE --timeout=120s 2>/dev/null || true
echo "  ✅ Pods ready"
echo ""

# ─── Step 6: Restart to inject instrumentation ────────────────
echo "🔄 Step 6/6: Injecting auto-instrumentation..."
kubectl rollout restart deployment -n $NAMESPACE -l "app.kubernetes.io/managed-by=Helm" 2>/dev/null || \
  kubectl rollout restart deployment cart-service product-service order-service \
    user-service notification-service inventory-service frontend-service -n $NAMESPACE
sleep 15
echo "  ✅ Auto-instrumentation injected"
echo ""

# ─── Done! ────────────────────────────────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ ObserveFlow is ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📊 Access dashboards:"
echo ""
echo "  # Grafana (metrics + logs)"
echo "  kubectl port-forward svc/${RELEASE_NAME}-grafana 3001:80 -n $NAMESPACE"
echo "  → http://localhost:3001 (admin / admin)"
echo ""
echo "  # Jaeger (distributed traces)"
echo "  kubectl port-forward svc/${RELEASE_NAME}-jaeger-query 16686:16686 -n $NAMESPACE"
echo "  → http://localhost:16686"
echo ""
echo "  # Frontend (e-commerce UI)"
echo "  kubectl port-forward svc/frontend-service 3000:3000 -n $NAMESPACE"
echo "  → http://localhost:3000"
echo ""
echo "  🔥 Generate traffic:"
echo "  bash scripts/generate-load.sh 30"
echo ""
