#!/bin/bash
# ==============================================================
# ObserveFlow — Port Forward Script
# ==============================================================
# Opens all services and dashboards for local access.
# Run after: helm install observeflow ./helm/observeflow -f values-local.yaml
#
# Usage: bash scripts/port-forward.sh
# Stop:  Ctrl+C (kills all port-forwards)
# ==============================================================

NAMESPACE="observeflow"

# Kill any existing port-forwards (works on both Linux and Windows/Git Bash)
if command -v pkill &>/dev/null; then
  pkill -f "kubectl port-forward" 2>/dev/null
else
  taskkill //F //IM kubectl.exe 2>/dev/null
fi
sleep 1

echo "🚀 Starting port-forwards for ObserveFlow..."
echo ""

# App (in observeflow namespace)
kubectl port-forward svc/frontend-service 3000:3000 -n $NAMESPACE &

# Grafana (in default namespace — helm subchart)
kubectl port-forward svc/observeflow-grafana 3001:80 -n default &

# Prometheus (in default namespace — helm subchart)
kubectl port-forward svc/observeflow-kube-prometheu-prometheus 9090:9090 -n default &

# Jaeger (in default namespace — helm subchart)
kubectl port-forward svc/observeflow-jaeger-query 16686:16686 -n default &

# Loki Gateway (in default namespace — helm subchart)
kubectl port-forward svc/observeflow-loki-gateway 3100:80 -n default &

sleep 2

echo ""
echo "✅ App:        http://localhost:3000"
echo "✅ Grafana:    http://localhost:3001  (admin/admin)"
echo "✅ Prometheus: http://localhost:9090"
echo "✅ Jaeger:     http://localhost:16686"
echo "✅ Loki:       http://localhost:3100"
echo ""
echo "─────────────────────────────────────────"
echo "All services forwarded. Press Ctrl+C to stop all."
echo "─────────────────────────────────────────"

# Wait for all background processes
wait
