---
title: "CNCF-200: Envoy Fundamentals"
author: "Tetrate Academy"
type: course
category: "Tech / Service Mesh"
year: 2026
status: reading
progress: 85
format: "Companion Repo (lab configs + notes)"
publisher: "Tetrate Academy"
repo: "kiquetal/tetrate-course-envoy"
sourcePath: "README.md"
repoBranch: "main"
cover: "../../assets/covers/tetrate-course-envoy.png"
coverAlt: "Envoy logo — CNCF graduated L4/L7 proxy (stacked color mark)"
summary: "Lifting the hood on Envoy — the L4/L7 proxy that powers modern service meshes. A hands-on lab log covering listeners, filter chains, routing, clusters, and dynamic xDS config, building toward understanding how Istio drives Envoy sidecars under the curtain."
tags: ["envoy", "service-mesh", "istio", "xds", "proxy", "networking", "observability", "cncf"]
updated: 2026-09-08
anchor:
  label: "Mental Model"
  text: "The POV is always Envoy. Downstream is whoever connects TO Envoy; Upstream is whatever Envoy connects TO. Every request flows Listener → Filter Chain → Router → Cluster → Endpoints."
diagrams:
  - label: "Fig. 1"
    title: "Envoy request pipeline"
    caption: "Every connection flows through the same L4/L7 pipeline — the POV is always Envoy."
    sourcePath: "README.md"
    mermaid: |
      graph LR
          Downstream([Downstream Client]) -->|Requests| Listener[Listener: Port/IP]
          subgraph Envoy Proxy
              Listener --> FilterChain[Filter Chain: Network & HTTP Filters]
              FilterChain --> Router[Router Filter]
          end
          Router -->|Routes to| Cluster[Cluster: Logical Service]
          Cluster --> Endpoints[Endpoints: IPs/Members]
          Endpoints -->|Upstream Request| Upstream[(Upstream Service)]
  - label: "Fig. 2"
    title: "Istio xDS config push"
    caption: "istiod recomputes Envoy config on CR changes and pushes it via xDS with zero-downtime hot reload."
    sourcePath: "05-istio-integration/README.md"
    mermaid: |
      sequenceDiagram
          autonumber
          actor User as Platform / Developer
          participant K8s as Kubernetes API
          participant Istiod as istiod (Pilot)
          participant Sidecar as istio-proxy (Envoy)
          User->>K8s: Apply VirtualService / DestinationRule
          K8s-->>Istiod: Watch event notified
          Istiod->>Istiod: Recompute Envoy configuration
          Istiod->>Sidecar: Push updates via xDS (CDS, EDS, LDS, RDS)
          Sidecar->>Sidecar: Hot-reload config with ZERO downtime
  - label: "Fig. 3"
    title: "Netfilter packet traversal"
    caption: "How a TCP packet travels the Linux Netfilter chains — the hooks iptables uses to hijack traffic into Envoy."
    sourcePath: "05-istio-integration/README.md"
    ascii: |2
                           +---------------------------------------+
                           |             Routing Decision          |
                           +---------------------------------------+
                                               |
                                               v
         +--------------+      +--------------+      +--------------+      +---------------+
         | PREROUTING   | ---> |    INPUT     | ---> | Local Process| ---> |    OUTPUT     |
         | (NIC Inbound)|      | (To socket)  |      | (Your App/Env)|     | (Outbound)    |
         +--------------+      +--------------+      +--------------+      +---------------+
                |                                                                  |
                +------------------------> [ FORWARD ] ----------------------------+
                                                   |
                                                   v
                                           +---------------+
                                           |  POSTROUTING  | ---> (Wire / NIC)
                                           +---------------+
  - label: "Fig. 4"
    title: "Inbound interception trace"
    caption: "Tracing an inbound request to app port 80: PREROUTING redirects it to Envoy on 15006, which recovers the original destination and re-delivers to the app."
    sourcePath: "05-istio-integration/README.md"
    mermaid: |
      sequenceDiagram
          autonumber
          participant Client as External Client
          participant Kernel as Linux Kernel (Netfilter)
          participant Envoy as Envoy Inbound (Port 15006)
          participant App as App Container (Port 80)

          Client->>Kernel: SYN Packet (Dest: PodIP:80)
          Note over Kernel: PREROUTING Hook triggered
          Note over Kernel: Rules match: Redirect to Local Host Port 15006
          Kernel->>Envoy: TCP Handshake (Dest changed to 127.0.0.1:15006)
          Note over Envoy: Envoy accepts connection.<br/>Asks Kernel for original destination: "PodIP:80"
          Note over Envoy: Executes Filter Chain for Port 80
          Envoy->>Kernel: New Connection (Dest: 127.0.0.1:80)
          Kernel->>App: Delivers payload to App socket on Port 80
  - label: "Fig. 5"
    title: "Listener order of operations"
    caption: "A connection climbs the stack: Listener Filters (L4/L5) → Network Filters (HCM) → HTTP Filters (L7) → Router."
    sourcePath: "02-listeners-filters/README.md"
    mermaid: |
      graph TD
          subgraph OSI_L4 [Layer 4 / Transport]
              A[TCP Connection]
              B[1. Listener Filters: e.g., TLS Inspector]
          end

          subgraph Envoy_Bridge [Network Filter Layer]
              C[2. Network Filters: e.g., HTTP Connection Manager]
          end

          subgraph OSI_L7 [Layer 7 / Application]
              D[3. HTTP Filters: e.g., JWT, CORS, Lua]
              E[Router Filter]
          end

          A --> B
          B --> C
          C -->|Promotes bytes to HTTP| D
          D --> E
  - label: "Fig. 6"
    title: "HTTP listener config hierarchy"
    caption: "Inside the HTTP Connection Manager, route_config (the routing map) and http_filters (the L7 pipeline) sit side-by-side as siblings; the Router filter bridges them and must be last."
    sourcePath: "02-listeners-filters/README.md"
    ascii: |
      Listener (Ex: Port 80)
      └── filter_chains
          └── filters (L4 Network Filters)
              └── envoy.filters.network.http_connection_manager (HCM)
                  └── typed_config
                      │
                      ├── route_config  ◄─── [ SIBLING 1: The Routing Directory / Map ]
                      │   └── virtual_hosts
                      │       └── domains (Matches ":authority" / "Host" header)
                      │       └── routes (Matches path prefix "/api")
                      │           └── route
                      │               ├── cluster (Target backend upstream)
                      │               ├── retry_policy
                      │               └── response_headers_to_add
                      │
                      └── http_filters  ◄─── [ SIBLING 2: The L7 Processing Pipeline ]
                          ├── envoy.filters.http.cors
                          ├── envoy.filters.http.jwt_authn
                          ├── envoy.filters.http.lua
                          └── envoy.filters.http.router  ◄── (The terminal filter)
sections:
  - label: "Module 01"
    title: "Bootstrap"
    note: "Basic static configuration, the Downstream vs. Upstream point-of-view, and Envoy startup fundamentals."
    sourcePath: "01-bootstrap/README.md"
    done: true
  - label: "Module 02"
    title: "Listeners & Filters"
    note: "Network/HTTP filters, filter chains, port unification, and internal vs. external listener design."
    sourcePath: "02-listeners-filters/README.md"
    done: true
  - label: "Module 03"
    title: "Routing & Clusters"
    note: "Path routing, weighted clusters, retries, timeouts, discovery endpoints, and health checks."
    sourcePath: "03-routing-clusters/README.md"
    done: true
  - label: "Module 04"
    title: "xDS Dynamic Config"
    note: "Dynamic configuration via a control plane over gRPC — LDS, RDS, CDS, EDS."
    sourcePath: "04-xds-dynamic-config/README.md"
    done: true
  - label: "Module 05"
    title: "Istio Integration"
    note: "How istiod (Pilot) maps Custom Resources to Envoy config; sidecar injection and iptables interception."
    sourcePath: "05-istio-integration/README.md"
    done: true
  - label: "Module 06"
    title: "SNI Routing"
    note: "TLS SNI-based routing with per-service certificates and a local docker-compose test harness."
    sourcePath: "06-sni-routing/README.md"
    done: true
  - label: "Module 07"
    title: "Logging"
    note: "Process logs vs. access logs, HCM access_log configuration, log format operators and response flags."
    sourcePath: "07-logging/README.md"
    done: false
---

Personal lab log and configuration playground for **Tetrate Academy's CNCF-200
Envoy Fundamentals** course. The goal is to lift the hood on modern service
meshes and understand exactly how **Istio** drives **Envoy** sidecars under the
curtain — starting from static bootstrap configs and building up to dynamic
`xDS`-driven meshes.

## Core Envoy architecture at a glance

Envoy is a high-performance, small-footprint **L4/L7 proxy**. Every connection
flows through the same pipeline:

```text
Downstream Client → Listener (port/IP) → Filter Chain → Router → Cluster → Endpoints → Upstream Service
```

- **Downstream** — any client that *initiates a connection to* Envoy (browsers,
  ALBs, mesh peers). The POV is always Envoy.
- **Upstream** — the backend Envoy *initiates a connection to* (a local app on
  `127.0.0.1:8080`, a database, a third-party API).
- **Listener** — a named network location (IP + port) that requests arrive on.
- **Filters** — pluggable modules in a filter chain handling protocol parsing,
  rate limiting, logging, RBAC, etc.
- **Routes** — decide which **Cluster** receives a request based on headers, URI
  paths, or hostnames.
- **Clusters** — a logical group of upstream hosts that Envoy load-balances over.
- **Endpoints** — the actual network-addressable instances (IP + port) in a
  cluster.

## Behind the curtain: how Istio really works

Istio is a **Control Plane** (`istiod`) that configures a **Data Plane** of
**Envoy** proxies (`istio-proxy`) running as sidecars.

- **Sidecar injection & interception** — a mutating webhook injects an
  `istio-init` and an `istio-proxy` container. `istio-init` sets up `iptables`
  rules that transparently redirect all inbound traffic to Envoy's `15006`
  listener and outbound traffic to `15001`. The app is completely unaware.
- **xDS protocol (dynamic config)** — because pod IPs are ephemeral, Envoy
  connects to `istiod` over gRPC and receives config through the discovery
  services:
  - **LDS** (Listeners) — what ports to listen on and which filter chains to run.
  - **RDS** (Routes) — routing rules mapped from Istio `VirtualService`.
  - **CDS** (Clusters) — backends mapped from K8s `Service` / `DestinationRule`.
  - **EDS** (Endpoints) — the live pod IPs of backends, continuously updated.

## Cheat sheet

Run Envoy locally with Docker:

```bash
docker run --name local-envoy -d \
  -v $(pwd)/bootstrap.yaml:/etc/envoy/envoy.yaml \
  -p 10000:10000 -p 9901:9901 \
  envoyproxy/envoy:v1.30.0
```

Inspect via the admin interface (port `9901`, or `15000` in Istio):

```bash
curl http://localhost:9901/server_info    # version & build info
curl http://localhost:9901/config_dump    # full active config
curl http://localhost:9901/clusters       # active clusters
```

Inspect Envoy inside Istio with `istioctl`:

```bash
istioctl proxy-config listeners <pod>.<namespace>
istioctl proxy-config routes    <pod>.<namespace>
istioctl proxy-config clusters  <pod>.<namespace>
istioctl proxy-config endpoints <pod>.<namespace>
istioctl proxy-status
```
