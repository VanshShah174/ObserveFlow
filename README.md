# 🔭 ObserveFlow

**A polyglot microservices e-commerce application with end-to-end observability — distributed tracing, metrics, and log aggregation — powered by OpenTelemetry, AWS ADOT, and a full cloud-native stack.**

> **Try it →** `helm repo add observeflow https://vanshshah174.github.io/ObserveFlow && helm install demo observeflow/observeflow`

[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh/)
[![AWS EKS](https://img.shields.io/badge/AWS_EKS-FF9900?style=for-the-badge&logo=amazoneks&logoColor=white)](https://aws.amazon.com/eks/)
[![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![OpenTelemetry](https://img.shields.io/badge/OpenTelemetry-000000?style=for-the-badge&logo=opentelemetry&logoColor=white)](https://opentelemetry.io/)
[![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)](https://prometheus.io/)
[![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)](https://grafana.com/)
[![Jaeger](https://img.shields.io/badge/Jaeger-66CFE3?style=for-the-badge&logo=jaeger&logoColor=black)](https://www.jaegertracing.io/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![ArgoCD](https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white)](https://argoproj.github.io/cd/)
[![AWS X-Ray](https://img.shields.io/badge/AWS_X--Ray-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](https://aws.amazon.com/xray/)
[![AWS CloudWatch](https://img.shields.io/badge/CloudWatch-FF4F8B?style=for-the-badge&logo=amazoncloudwatch&logoColor=white)](https://aws.amazon.com/cloudwatch/)

ObserveFlow deploys 7 microservices written in 4 languages (Node.js, Python, Go, Java) as a functional e-commerce app. The real focus is the **observability layer**: OpenTelemetry auto-instrumentation injects tracing into every service with zero code changes, an OTel Collector pipelines telemetry to Jaeger, Prometheus, and Loki for local clusters — or to **AWS ADOT → X-Ray, Amazon Managed Prometheus (AMP), and CloudWatch Logs** on EKS. The entire infrastructure (VPC, EKS, ECR, Karpenter, IAM, KMS) is provisioned via Terraform, with CI/CD through GitHub Actions (OIDC → ECR) and GitOps via ArgoCD.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          KUBERNETES CLUSTER                              │
│                                                                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Frontend │───▶│Product Service│    │ User Service │                  │
│  │  (React) │    │  (Node.js)   │    │   (Python)   │                  │
│  └────┬─────┘    └──────────────┘    └──────────────┘                  │
│       │                                                                 │
│       ├──────────┐                                                      │
│       ▼          ▼                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐                │
│  │Cart Svc  │◀─│ Order Service │─▶│Notification Service│                │
│  │(Node.js) │  │  (Node.js)   │  │       (Go)         │                │
│  └──────────┘  └──────┬───────┘  └───────────────────┘                │
│                        │                                                │
│                        ▼                                                │
│               ┌─────────────────┐                                       │
│               │Inventory Service│                                       │
│               │     (Java)      │                                       │
│               └─────────────────┘                                       │
│                                                                         │
│  ═══════════════════ OBSERVABILITY LAYER ═══════════════════════════    │
│                                                                         │
│  ┌────────────────────┐                                                │
│  │  OTel Operator      │ ← Auto-injects instrumentation into pods      │
│  │  (Instrumentation)  │                                                │
│  └────────┬───────────┘                                                │
│           ▼                                                             │
│  ┌────────────────────┐    ┌──────────┐  ┌──────┐  ┌──────┐          │
│  │  OTel Collector     │───▶│  Jaeger  │  │ Prom │  │ Loki │          │
│  │  (traces/metrics/   │───▶│ (traces) │  │(met.)│  │(logs)│          │
│  │   logs pipeline)    │───▶│          │  │      │  │      │          │
│  └────────────────────┘    └──────────┘  └──┬───┘  └──┬───┘          │
│                                              │         │               │
│                                        ┌─────▼─────────▼────┐         │
│                                        │      Grafana        │         │
│                                        │  (unified UI)       │         │
│                                        └─────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📸 Live Demo

![Grafana Overview Dashboard](images/Grafana_Overview.png)

![AWS X-Ray Distributed Traces](images/X-Ray.png)

![CloudWatch Logs with Trace Correlation](images/Cloudwatch_Logs.png)

---

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (Kind, Minikube, EKS, or any k8s)
- Helm v3
- kubectl

### One-Command Install

```bash
bash scripts/setup.sh my-namespace
```

This script installs everything in order:
1. cert-manager (TLS for OTel Operator webhooks)
2. OpenTelemetry Operator (auto-instrumentation injection)
3. ObserveFlow chart (7 services + Prometheus + Grafana + Loki + Jaeger)
4. Triggers pod restart to inject instrumentation

### Manual Install (Helm Repo)

```bash
# Add the ObserveFlow Helm repository
helm repo add observeflow https://vanshshah174.github.io/ObserveFlow
helm repo update

# Install prerequisites
helm install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace \
  --set crds.enabled=true --wait

helm install otel-operator open-telemetry/opentelemetry-operator \
  -n otel-system --create-namespace \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-contrib" \
  --wait

# Install ObserveFlow
helm install demo observeflow/observeflow \
  -n observeflow --create-namespace

# Restart pods to inject auto-instrumentation
kubectl rollout restart deployment -n observeflow
```

### Access Dashboards

```bash
# Frontend (e-commerce app)
kubectl port-forward svc/frontend-service 3000:3000 -n observeflow

# Grafana (metrics + logs)
kubectl port-forward svc/demo-grafana 3001:80 -n observeflow
# → http://localhost:3001 (admin / admin)

# Jaeger (distributed traces)
kubectl port-forward svc/demo-jaeger-query 16686:16686 -n observeflow
# → http://localhost:16686
```

### Generate Traffic

```bash
bash scripts/generate-load.sh 60
```

📖 **New here?** Check out the [Complete Setup Guide](scripts/setup-guide.md) for detailed step-by-step instructions with explanations.

---

## ☁️ Dual-Mode Observability (Local + AWS)

ObserveFlow supports **two deployment modes** with different observability backends:

| | **Local Mode** (Kind/Minikube) | **AWS Mode** (EKS) |
|--|------|------|
| Traces | Jaeger (in-cluster) | AWS X-Ray |
| Metrics | Prometheus + Grafana (in-cluster) | Amazon Managed Prometheus (AMP) |
| Logs | Loki + Grafana (in-cluster) | CloudWatch Logs (KMS-encrypted) |
| Collector | OTel Collector | ADOT Collector (DaemonSet) |
| Auth | — | Pod Identity (no keys) |
| Autoscaling | — | Karpenter (spot instances) |

Switch between modes with a single flag:

```yaml
# values.yaml
observability:
  aws:
    enabled: true   # ← switches to ADOT → X-Ray/AMP/CloudWatch
```

---

## 🎯 What This Project Demonstrates

| Concept | Implementation |
|---------|---------------|
| **Distributed Tracing** | Auto-instrumented traces across 7 services → OTel Collector → Jaeger / X-Ray |
| **Metrics Collection** | Custom business metrics (Counter, Gauge, Histogram) → Prometheus / AMP |
| **Log Aggregation** | Structured JSON logs with trace correlation → Loki / CloudWatch Logs |
| **Trace-Log Correlation** | Every log line includes `traceId` + `spanId` for direct jump from log → trace |
| **Auto-Instrumentation** | Zero-code OTel injection via Kubernetes Operator (no SDK changes needed) |
| **Dual-Mode Observability** | Same app, two backends: local (Jaeger/Prom/Loki) or AWS (X-Ray/AMP/CloudWatch) |
| **Helm-based Deployment** | One `helm install` deploys everything: 7 services + full observability stack |

---

## 📦 Services

| Service | Language | Port | Responsibility |
|---------|----------|------|----------------|
| **frontend-service** | React + Nginx | 3000 | E-commerce UI with product browsing, cart, and checkout |
| **product-service** | Node.js (Express) | 4000 | Product catalog (10 items with images, pricing) |
| **cart-service** | Node.js (Express) | 4001 | Shopping cart CRUD + custom OTel metrics |
| **order-service** | Node.js (Express) | 4002 | Order creation (calls cart → inventory → notification) |
| **user-service** | Python (Flask) | 4003 | User profiles and membership tiers |
| **notification-service** | Go (net/http) | 4004 | Event notifications with W3C traceparent parsing |
| **inventory-service** | Java (Spring Boot) | 4005 | Stock management with reserve/release/restock |

---

## 🔍 Observability Stack

### Traces (Jaeger / AWS X-Ray)

Every HTTP request generates a distributed trace that spans multiple services:

```
Frontend → Product Service → (user browses)
Frontend → Cart Service → (adds item)
Frontend → Order Service → Cart Service → Inventory Service → Notification Service (checkout)
```

Each trace shows:
- Full request lifecycle across services
- Individual span durations (middleware, handlers, downstream calls)
- Service metadata (pod name, namespace, container)

### Metrics (Prometheus + Grafana)

![Custom Prometheus Metrics](images/Custom-Prometheus-Chart.jpeg)
![Prometheus Alert Rules](images/Alert_Rules_Prometheus.png)

**Custom business metrics** (cart-service):
```
cart_items_added_total    → Counter: total items added to carts
cart_items_current        → UpDownCounter: items currently in active carts
cart_operation_duration_seconds → Histogram: p50/p95/p99 of cart operations
```

**PromQL examples:**
```promql
# Request rate per service
sum(rate(observeflow_http_server_duration_milliseconds_count[5m])) by (job)

# Cart items added by product
sum(observeflow_cart_items_added_total) by (product_id)

# P95 latency
histogram_quantile(0.95, sum(rate(observeflow_http_server_duration_milliseconds_bucket[5m])) by (le, job))
```

### Logs (Loki + Grafana / CloudWatch)

All services emit structured JSON logs with trace correlation:

```json
{
  "timestamp": "2026-06-04T12:00:01.234Z",
  "service": "cart-service",
  "method": "POST",
  "path": "/cart/user-1/items",
  "statusCode": 201,
  "durationMs": 5,
  "traceId": "2ebad82367f07b870f4c3a8c44ff8058",
  "spanId": "0234e0930ce83e94"
}
```

**LogQL examples:**
```logql
# All cart service logs (excluding health checks)
{k8s_container_name="cart-service"} | json | path!="/health"

# Filter by trace ID (jump from Jaeger → Loki)
{k8s_container_name=~".+"} | json | traceId="2ebad82367f07b870f4c3a8c44ff8058"
```

---

## 🔗 Trace-Log-Metric Correlation

The key power of this setup is **correlation across all three signals**:

1. **See a spike in Grafana** (metric) → click to see which traces were slow
2. **Open a trace in Jaeger** → copy the `traceId` → search in Loki logs
3. **Find an error in logs** (Loki) → use `traceId` to see the full distributed trace

This is possible because:
- Auto-instrumentation injects trace context into every request
- Each service's logging middleware captures `traceId` + `spanId`
- OTel Collector routes all signals through a single pipeline

---

## ⚙️ Telemetry Pipeline

### Local Mode (OTel Collector)

```
Services → OTLP HTTP/protobuf → OTel Collector → Jaeger (traces) + Prometheus (metrics) + Loki (logs)
```

### AWS Mode (ADOT Collector)

```
Services → OTLP → ADOT DaemonSet → X-Ray (traces) + AMP (metrics) + CloudWatch (logs)
Auth: Pod Identity → IAM Role (zero credentials in code)
```

---

## 🏗️ AWS Infrastructure (Terraform)

The entire AWS stack is provisioned via Terraform (75 resources):

![AWS EKS Cluster](images/AWS-EKS.png)
![AWS EKS Workloads](images/AWS-EKS-2.png)

<details>
<summary>🏗️ AWS Architecture Diagram</summary>

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            AWS ACCOUNT                                   │
│                                                                         │
│  ┌────────────────── VPC (10.0.0.0/16) ───────────────────────────┐    │
│  │                                                                 │    │
│  │  ┌─── Public Subnets ───┐    ┌─── Private Subnets ───┐        │    │
│  │  │  • NAT Gateway       │    │  • EKS Node Group      │        │    │
│  │  │  • Internet Gateway  │    │  • Karpenter Nodes     │        │    │
│  │  │  • Load Balancers    │    │  • Application Pods    │        │    │
│  │  └──────────────────────┘    └────────────────────────┘        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌──── EKS Cluster ─────────────────────────────────────────────────┐  │
│  │  K8s v1.35 │ API + Config Map auth │ Pod Identity Agent          │  │
│  │  Addons: VPC-CNI, CoreDNS, kube-proxy, ADOT, Pod Identity       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──── ECR ─────────┐  ┌── Observability ────────────────────────┐    │
│  │  7 repositories   │  │  • Amazon Managed Prometheus (AMP)      │    │
│  │  Immutable tags   │  │  • CloudWatch Logs (365d retention)     │    │
│  │  Scan on push     │  │  • AWS X-Ray (distributed tracing)     │    │
│  │  Auto-cleanup     │  │  • KMS encryption for logs             │    │
│  └───────────────────┘  └────────────────────────────────────────┘    │
│                                                                         │
│  ┌──── Karpenter ────────────────────────────────────────────────┐    │
│  │  • Pod Identity for EC2 management                             │    │
│  │  • Spot interruption handling (SQS + EventBridge)              │    │
│  │  • Auto-discovery via subnet/SG tags                           │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

</details>

| File | What it provisions |
|------|-------------------|
| `vpc.tf` | VPC, 2 public + 2 private subnets, IGW, NAT, route tables |
| `eks.tf` | EKS cluster, managed node group, addons (VPC-CNI, CoreDNS, Pod Identity) |
| `ecr.tf` | 7 ECR repos with immutable tags, scan-on-push, lifecycle cleanup |
| `observability.tf` | AMP workspace, CloudWatch log group (KMS), ADOT IAM role + Pod Identity |
| `karpenter.tf` | Controller IAM role, node role + instance profile, SQS interruption queue, EventBridge rules |
| `github-oidc.tf` | OIDC provider, IAM role for GitHub Actions (ECR push) |

```bash
cd terraform
terraform init && terraform apply
aws eks update-kubeconfig --name observeflow-eks --region us-east-1
```

---

## 🛠️ CI/CD

### CI Pipeline (`.github/workflows/ci.yaml`)

```
Detect Changes → Lint (ESLint) → SCA (npm audit) → Hadolint → Build + Trivy → Push (ECR + Docker Hub) → Update Helm
```

- Dynamic service detection — only builds changed services
- Trivy CVE scan (blocks CRITICAL/HIGH)
- Multi-registry push via GitHub OIDC (no stored credentials)
- Auto-updates `values-dev.yaml` → triggers ArgoCD

### GitOps (ArgoCD)

![ArgoCD Sync](images/Argo-CD.png)

ArgoCD watches `values-dev.yaml` — when CI updates an image tag, ArgoCD auto-deploys with prune + self-heal enabled.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js, Python (Flask), Go, Java (Spring Boot) |
| Reverse Proxy | Nginx |
| Orchestration | Kubernetes (EKS / Kind) + Helm v3 |
| Tracing | OpenTelemetry → Jaeger (local) / AWS X-Ray (prod) |
| Metrics | Prometheus + Grafana (local) / Amazon Managed Prometheus (prod) |
| Logs | Loki + Grafana (local) / CloudWatch Logs (prod) |
| Collector | OpenTelemetry Collector (local) / ADOT Collector (AWS) |
| Auto-Instrumentation | OpenTelemetry Operator (K8s CRD) |
| Infrastructure | Terraform (VPC, EKS, ECR, IAM, KMS, AMP, Karpenter) |
| Autoscaling | Karpenter (spot instances + interruption handling) |
| Container Registry | ECR (AWS) + Docker Hub (public multi-arch) |
| CI/CD | GitHub Actions (OIDC → ECR) + ArgoCD (GitOps) |
| Security | Pod Identity, KMS encryption, Trivy, Hadolint, OIDC |

<details>
<summary>📂 Project Structure</summary>

```
ObserveFlow/
├── src/
│   ├── frontend-service/     # React + Vite + Nginx reverse proxy
│   ├── product-service/      # Node.js — product catalog
│   ├── cart-service/         # Node.js — cart + custom OTel metrics
│   ├── order-service/        # Node.js — order processing (multi-service calls)
│   ├── user-service/         # Python Flask — user profiles
│   ├── notification-service/ # Go — event notifications
│   └── inventory-service/    # Java Spring Boot — stock management
├── helm/observeflow/         # Helm chart (single installable package)
├── terraform/                # AWS infrastructure (EKS, ECR, AMP, Karpenter)
├── argocd/                   # GitOps manifest
├── scripts/                  # setup.sh, generate-load.sh, port-forward.sh
├── .github/workflows/        # CI + Helm release pipelines
└── docs/                     # Architecture decisions and journey docs
```

</details>

<details>
<summary>⚙️ Helm Configuration Options</summary>

```yaml
# Enable/disable the observability stack
observability:
  enabled: true   # Set false to deploy only microservices

# Per-service image override
cartService:
  image:
    repository: vanshshah17/observeflow-cart-service
    tag: "latest"
  replicas: 1

# AWS mode (for EKS with ADOT)
observability:
  aws:
    enabled: true
    region: "us-east-1"
    ampEndpoint: "https://aps-workspaces.us-east-1..."
```

The chart is **namespace-agnostic** — install into any namespace and all internal service references resolve automatically.

</details>

---

## 🖥️ Multi-Platform Support

All Docker images are built for both `linux/amd64` and `linux/arm64`:

- ✅ Intel/AMD machines (Windows, Linux)
- ✅ Apple Silicon Macs (M1/M2/M3)
- ✅ AWS Graviton instances

---

## 👤 Author

**Vansh Shah** — [GitHub](https://github.com/VanshShah174) · [LinkedIn](https://linkedin.com/in/vanshshah174)
