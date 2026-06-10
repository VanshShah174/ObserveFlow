# 🚀 ObserveFlow — Complete Setup Guide

Everything you need to get ObserveFlow running from scratch — on any machine.

---

## Prerequisites — Install Required Tools

You need 4 tools installed. Pick the command for your OS:

| Tool | Windows (choco) | Windows (winget) | macOS (brew) | Linux |
|------|----------------|-----------------|--------------|-------|
| **Docker Desktop** | `choco install docker-desktop -y` | `winget install Docker.DockerDesktop` | `brew install --cask docker` | `curl -fsSL https://get.docker.com \| sh` |
| **kubectl** | `choco install kubectl -y` | `winget install Kubernetes.kubectl` | `brew install kubectl` | `curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && chmod +x kubectl && sudo mv kubectl /usr/local/bin/` |
| **Helm** | `choco install helm -y` | `winget install Helm.Helm` | `brew install helm` | `curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 \| bash` |
| **Kind** | `choco install kind -y` | `winget install Kubernetes.kind` | `brew install kind` | `curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.25.0/kind-linux-amd64 && chmod +x ./kind && sudo mv ./kind /usr/local/bin/` |

**Verify all tools are installed:**

```bash
docker --version
kubectl version --client
helm version
kind version
```

---

## Step 1: Create a Kind Cluster

> **Why?** Kind (Kubernetes IN Docker) creates a local multi-node cluster using Docker containers.
> We use a 2-node cluster (control-plane + worker) so pods get scheduled on the worker node,
> simulating a real production setup.

Create a file called `kind-config.yaml`:

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
```

Then create the cluster:

```bash
kind create cluster --name demo --config kind-config.yaml --image kindest/node:v1.32.0
```

Verify it's running:

```bash
kubectl get nodes
# Expected output:
# NAME                 STATUS   ROLES           AGE   VERSION
# demo-control-plane   Ready    control-plane   30s   v1.32.0
# demo-worker          Ready    <none>          20s   v1.32.0
```

---

## Step 2: Add Helm Repositories

> **Why?** We need charts from 3 external sources:
> - `jetstack` — for cert-manager (TLS certificates)
> - `open-telemetry` — for the OTel Operator (auto-instrumentation)
> - `observeflow` — our published chart (the app + observability stack)

```bash
helm repo add jetstack https://charts.jetstack.io
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm repo add observeflow https://vanshshah174.github.io/ObserveFlow
helm repo update
```

**Verify repos are added:**

```bash
# List all added repositories
helm repo list

# Expected output:
# NAME              URL
# jetstack          https://charts.jetstack.io
# open-telemetry    https://open-telemetry.github.io/opentelemetry-helm-charts
# observeflow       https://vanshshah174.github.io/ObserveFlow
```

**Search for available charts in a repo:**

```bash
# See all charts in the observeflow repo
helm search repo observeflow

# See all cert-manager chart versions
helm search repo jetstack/cert-manager --versions
```

---

## Step 3: Install cert-manager

> **Why?** The OpenTelemetry Operator uses admission webhooks to inject instrumentation into pods.
> These webhooks require valid TLS certificates. cert-manager automatically provisions and
> renews those certificates. Without it, the OTel Operator will crash on startup.

```bash
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true \
  --wait
```

**Verify installation:**

```bash
# Check the release was created
helm list -A

# Expected: cert-manager release in "deployed" status
# NAME            NAMESPACE       STATUS      CHART
# cert-manager    cert-manager    deployed    cert-manager-v1.x.x

# Check pods are running
kubectl get pods -n cert-manager
# All 3 pods should be Running (cert-manager, cainjector, webhook)
```

---

## Step 4: Install OpenTelemetry Operator

> **Why?** The OTel Operator watches for `Instrumentation` CRs (Custom Resources) in your cluster.
> When it finds one, it injects an init container with the OTel SDK into every annotated pod —
> this is how we get distributed tracing without writing a single line of instrumentation code.
> It MUST be running before we install ObserveFlow, otherwise it won't see our Instrumentation CR.

```bash
helm install otel-operator open-telemetry/opentelemetry-operator \
  -n otel-system --create-namespace \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-contrib" \
  --wait
```

**Verify installation:**

```bash
# Check all releases so far
helm list -A

# Expected:
# NAME            NAMESPACE       STATUS      CHART
# cert-manager    cert-manager    deployed    cert-manager-v1.x.x
# otel-operator   otel-system     deployed    opentelemetry-operator-0.x.x

# Check operator pod is running
kubectl get pods -n otel-system
# Should show 1 running pod
```

---

## Step 5: Install ObserveFlow

> **Why?** This single chart deploys everything:
> - 7 microservices (frontend, product, cart, order, user, notification, inventory)
> - OTel Collector (central telemetry pipeline)
> - Instrumentation CR (tells the operator how to instrument pods)
> - Prometheus + Grafana (metrics + dashboards)
> - Loki (log aggregation)
> - Jaeger (distributed tracing UI)

```bash
helm install demo observeflow/observeflow \
  -n observeflow --create-namespace
```

**Verify installation:**

```bash
# All 3 releases should now be visible
helm list -A

# Check pods (wait ~60 seconds for all to start)
kubectl get pods -n observeflow

# You should see ~15-20 pods (7 services + observability stack)
```

---

## Step 6: Restart Deployments (Inject Instrumentation)

> **Why?** The OTel Operator injects auto-instrumentation via a mutating webhook that fires
> when pods are CREATED. Since our pods were created in Step 5 (at the same time as the
> Instrumentation CR), some pods may have started before the operator processed the CR.
> Restarting forces new pods to be created — this time the webhook catches them and injects
> the OTel SDK.

```bash
kubectl rollout restart deployment \
  cart-service product-service order-service \
  user-service notification-service inventory-service \
  frontend-service -n observeflow
```

Wait for rollout to complete:

```bash
kubectl rollout status deployment frontend-service -n observeflow --timeout=90s
```

**Verify instrumentation was injected:**

```bash
# Check if the OTel init container exists in a pod
kubectl get pod -l app=cart-service -n observeflow -o jsonpath="{.items[0].spec.initContainers[*].name}"
# Expected: opentelemetry-auto-instrumentation-nodejs
```

---

## Step 7: Port-Forward Dashboards

> **Why?** Kind clusters don't expose services externally. Port-forwarding maps cluster
> services to your localhost so you can access them in your browser.

```bash
# Frontend (e-commerce app)
kubectl port-forward svc/frontend-service 3000:3000 -n observeflow &

# Grafana (metrics + logs + dashboards)
kubectl port-forward svc/demo-grafana 3001:80 -n observeflow &

# Jaeger (distributed traces)
kubectl port-forward svc/demo-jaeger-query 16686:16686 -n observeflow &
```

**Access:**
- Frontend → http://localhost:3000
- Grafana → http://localhost:3001 (username: `admin`, password: `admin`)
- Jaeger → http://localhost:16686

---

## Step 8: Generate Traffic

> **Why?** The observability stack needs actual requests flowing through the system to
> generate traces, metrics, and logs. The load generator sends realistic e-commerce traffic
> (browse products → add to cart → checkout) across all services.

**Open Git Bash** (or any bash-compatible terminal) and run:

```bash
bash scripts/generate-load.sh 60
```

This generates traffic for 60 seconds across all services. You'll see output like:

```
🔥 Generating load for 60s...
── Request batch #1 ──
  → GET /api/products
  → POST /api/cart/user-1/items
  → POST /api/orders (checkout!)
...
✅ Load generation complete! 30 batches sent.
```

> **Note:** If you're on Windows PowerShell and don't have Git Bash,
> install [Git for Windows](https://git-scm.com/download/win) — it includes Git Bash.

---

## Step 9: Explore Observability

After generating traffic, open these in your browser:

| Dashboard | URL | What to look for |
|-----------|-----|-----------------|
| **Jaeger** | http://localhost:16686 | Select `cart-service` or `order-service` → Find Traces → see distributed traces spanning multiple services |
| **Grafana** | http://localhost:3001 | Go to Dashboards → "ObserveFlow — Service Overview" → see request rates, error rates, custom cart metrics |
| **Loki (via Grafana)** | http://localhost:3001 → Explore → Loki | Query: `{k8s_container_name="cart-service"} | json | path!="/health"` |

---

## Teardown

```bash
helm uninstall demo -n observeflow
helm uninstall otel-operator -n otel-system
helm uninstall cert-manager -n cert-manager
kind delete cluster --name demo
```

---

## Troubleshooting

### Kubernetes Commands

```bash
# Check all pods and their status
kubectl get pods -n observeflow

# Describe a failing pod (shows events, errors)
kubectl describe pod <pod-name> -n observeflow

# View logs of a specific pod
kubectl logs <pod-name> -n observeflow

# View logs of a specific container in a pod
kubectl logs <pod-name> -c <container-name> -n observeflow

# Check events (useful for scheduling/image pull issues)
kubectl get events -n observeflow --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n observeflow

# Exec into a pod for debugging
kubectl exec -it <pod-name> -n observeflow -- sh
```

### Helm Commands

```bash
# List all releases across all namespaces
helm list -A

# Check release history (see if install/upgrade failed)
helm history demo -n observeflow

# Get the values used for a release
helm get values demo -n observeflow

# Get all manifests generated by a release
helm get manifest demo -n observeflow

# Dry-run an install (see what would be deployed without deploying)
helm install demo observeflow/observeflow -n observeflow --dry-run

# Uninstall and reinstall cleanly
helm uninstall demo -n observeflow
helm install demo observeflow/observeflow -n observeflow --create-namespace
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Pods stuck in `Pending` | Not enough resources on the node | Check: `kubectl describe pod <name> -n observeflow` |
| Pods in `ImagePullBackOff` | Docker Hub rate limit or network issue | Wait and retry, or check: `kubectl describe pod <name>` |
| Products not showing on frontend | Frontend pod using old image | `kubectl rollout restart deployment frontend-service -n observeflow` |
| No traces in Jaeger | Instrumentation not injected | Run Step 6 again (restart deployments) |
| Grafana login fails | Wrong credentials | Username: `admin`, Password: `demo` |
| Port-forward disconnects | Pod restarted or terminal closed | Re-run the port-forward command from Step 7 |
| `helm install` fails with timeout | Cluster resources low or image pulls slow | Retry with `--timeout 10m` |
| OTel Operator crash | cert-manager not ready | Check: `kubectl get pods -n cert-manager` — all must be Running |
