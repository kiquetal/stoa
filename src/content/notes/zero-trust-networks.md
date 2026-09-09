---
title: "Zero Trust Networks"
author: "Razi Rais, Christina Morillo, Evan Gilman & Doug Barth"
type: book
category: "Tech / Security"
year: 2024
status: reading
progress: 30
format: "Companion Repo (notes + diagrams)"
publisher: "O'Reilly Media"
repo: "kiquetal/book-zero-trust-netwroks"
sourcePath: "Readme.md"
repoBranch: "main"
cover: "../../assets/covers/zero-trust-networks.jpg"
coverAlt: "Zero Trust Networks, 2nd Edition cover — O'Reilly (lobster)"
summary: "Never trust, always verify. A study of the zero trust security model — eliminating the perimeter, authenticating and authorizing every flow, and making context-aware decisions from a control plane that drives enforcement in the data plane."
tags: ["zero-trust", "security", "networking", "authentication", "authorization", "control-plane", "data-plane"]
updated: 2026-09-08
anchor:
  label: "Core Principle"
  text: "Always assume breach. Never trust, but always verify — every user, device, and network flow must be authenticated, authorized, and continuously validated."
diagrams:
  - label: "Fig. 1"
    title: "Control plane vs. data plane"
    caption: "The control plane (brain) decides; the data plane (muscle) enforces. The policy engine pushes config to the enforcer, the trust engine feeds it context, and the enforcer allows/denies/routes live traffic."
    sourcePath: "chapter-iv.md"
    mermaid: |
      graph TD
          subgraph Control_Plane ["Control Plane: The #quot;Brain#quot;"]
              PolicyEngine["Policy Decision Point / Controller"]
              TrustEngine["Trust Engine"]
              DataStore[("Data Stores")]
          end

          subgraph Data_Plane ["Data Plane: The #quot;Muscle#quot;"]
              Traffic["Incoming Traffic"]
              Enforcer["Policy Enforcement Point / Proxy / Gateway"]
          end

          PolicyEngine -- "Pushes Policies & Configuration" --> Enforcer
          TrustEngine -- "Provides Context" --> PolicyEngine
          PolicyEngine -- "Queries/Updates" --> DataStore
          Traffic -- "Traffic to be Checked" --> Enforcer
          Enforcer -- "Allow/Deny/Route" --> TrafficOut[Destination]
  - label: "Fig. 2"
    title: "The four authorization components"
    caption: "The four components from chapter IV and how they talk: the Trust Engine feeds the Policy Engine and also uses the Data Stores; the Policy Engine queries/updates the Data Stores; and in the data plane, Enforcement talks with the Policy Engine."
    sourcePath: "chapter-iv.md"
    ascii: |2
      +=====================================================================+
      |                          CONTROL PLANE                              |
      |                           (the "brain")                             |
      |                                                                     |
      |   +----------------+   uses    +-------------------+                |
      |   |  Trust Engine  | --------> |    Data Stores    |                |
      |   +----------------+           +-------------------+                |
      |          |                            ^                             |
      |          | context                    | queries / updates          |
      |          v                             |                            |
      |   +-------------------------------------------+                     |
      |   |               Policy Engine               |                     |
      |   +-------------------------------------------+                     |
      +==================================|==================================+
                                         ^
                              talks with |
                              Policy Engine
                                         |
      +==================================|==================================+
      |                       DATA PLANE  |                                  |
      |                      (the "muscle")                                 |
      |                          +-------------------+                      |
      |   Incoming Traffic  ---> |    Enforcement    | ---> Allow/Deny/Route|
      |                          +-------------------+                      |
      +=====================================================================+
  - label: "Fig. 3"
    title: "Trust chain / delegation"
    caption: "Trust flows down from an offline root trust anchor through intermediate CAs to leaf certs; a verifier walks the chain back up to an anchor it trusts."
    sourcePath: "chapter-ii.md"
    ascii: |2
                       Trust Chain / Delegation
                       ------------------------

              [ Trust Anchor ]        <- Root CA (self-signed, offline)
                     |
                     | signs
                     v
              [ Intermediate CA ]     <- delegated authority
                     |
                     | signs
                     v
              [ Leaf / End-entity ]   <- server, service, workload cert
                     |
                     | presents cert
                     v
              [ Verifier / Relying party ]
              walks the chain back up to a trusted anchor
  - label: "Fig. 4"
    title: "PKI issuance flow"
    caption: "An entity generates a keypair, submits a CSR to the RA for identity verification, then the CA signs an X.509 cert the entity presents during the TLS handshake."
    sourcePath: "chapter-ii.md"
    ascii: |2
                    PKI Issuance Flow
                    -----------------

         [ Entity ] --generate keypair--> (private key stays local)
              |
              | build CSR (public key + identity)
              v
         [ Registration Authority (RA) ] --verify identity--> OK
              |
              v
         [ Certificate Authority (CA) ] --sign--> [ X.509 Certificate ]
              |
              v
         Entity installs signed cert, presents it during TLS handshake
  - label: "Fig. 5"
    title: "Kubernetes trust model"
    caption: "Kubernetes is a private PKI in action: the cluster root CA signs control-plane and node certs, and nodes join via the CSR API approved and signed by the cluster CA."
    sourcePath: "chapter-ii.md"
    ascii: |2
                       Kubernetes Trust Model
                       ----------------------

              [ cluster Root CA ]  (/etc/kubernetes/pki/ca.crt)
                       |
           +-----------+------------------------+
           | signs                              | signs
           v                                    v
       [ API server cert ]              [ kubelet client certs ]
       [ etcd peer/client certs ]       [ controller-manager ]
       [ front-proxy CA ]               [ scheduler, admin.conf ]

        Nodes join via CSR:
        kubelet -> CertificateSigningRequest -> approved -> signed by cluster CA
  - label: "Fig. 6"
    title: "Continuous trust scoring loop"
    caption: "Instead of binary decisions, Zero Trust continuously monitors actor actions to update a trust score the policy engine uses for adaptive, risk-based access."
    sourcePath: "chapter-ii.md"
    ascii: |2
              Continuous Trust Scoring Loop
              -----------------------------

         [ Actor action ] --> [ Monitor / collect signals ]
                                      |
                                      v
                           [ Update trust score ]
                                      |
                                      v
                           [ Policy engine evaluates ]
                                      |
                    +-----------------+-----------------+
                    | high trust                        | low trust
                    v                                   v
              [ Allow / full access ]        [ Step-up auth / deny / quarantine ]
  - label: "Fig. 7"
    title: "What makes an agent"
    caption: "An agent is an ephemeral, request-time combination of an authenticated user, device, and application — assembled per request and consulted for authorization only."
    sourcePath: "chapter-iii.md"
    ascii: |2
                       What Makes an Agent
                       -------------------

              [ User / Subject ]   authenticated (MFA, password + OTP...)
                       +
              [ Device / Asset ]   authenticated (X.509 device cert)
                       +
              [ Application ]      identified
                       =
              ============ AGENT ============
              (assembled per request, used for AUTHORIZATION only)
  - label: "Fig. 8"
    title: "Authentication vs. authorization"
    caption: "Each entity authenticates separately (user via MFA, device via X.509, app identified); the agent is assembled afterward and consulted per request for the authorization decision."
    sourcePath: "chapter-iii.md"
    ascii: |2
              Authentication vs Authorization
              -------------------------------

         User  --MFA----------------+
         Device --X.509 cert--------+--> [ each entity AUTHENTICATED separately ]
         App   --identified---------+
                                              |
                                              v
                                    [ assemble AGENT ]
                                              |
                                              v
                                    [ AUTHORIZATION decision ]
                                    (per request, not cached)
  - label: "Fig. 9"
    title: "Kubernetes AuthN → AuthZ pipeline"
    caption: "A request to the API server is authenticated (cert/OIDC/token), authorized by RBAC on every call (uncached), then passed through admission control before being persisted."
    sourcePath: "chapter-iii.md"
    ascii: |2
              Kubernetes AuthN -> AuthZ Pipeline
              ----------------------------------

         Request to API server
              |
              v
         [ Authentication ]   client cert (X.509) / OIDC token / service-account token
              |   identity = user + groups (or service account)
              v
         [ Authorization ]    RBAC / ABAC / Webhook  -> allow or deny
              |
              v
         [ Admission control ] -> mutate / validate -> persist
  - label: "Fig. 10"
    title: "Decision flow between the four components"
    caption: "Enforcement (PEP) asks the Policy Engine (PDP), which pulls context from the Trust Engine and reads/updates the Data Stores, then returns an allow/deny the enforcer acts on."
    sourcePath: "chapter-iv.md"
    ascii: |2
              Decision Flow Between the Four Components
              -----------------------------------------

         Request --> [ Enforcement / PEP ]
                           |  asks "may this proceed?"
                           v
                    [ Policy Engine / PDP ] --context--> [ Trust Engine ]
                           |                                   |
                           | query/update                      | reads signals
                           v                                   v
                    [ Data Stores ] <-------------------------- +
                           |
         Decision (allow/deny) returned to Enforcement, which acts on the traffic
  - label: "Fig. 11"
    title: "Kubernetes as a Zero Trust PDP/PEP"
    caption: "The API server acts as the PEP: it authenticates the request, calls the authorizer (RBAC/Webhook/OPA) as the PDP, runs admission webhooks, then persists to etcd (the data store)."
    sourcePath: "chapter-iv.md"
    ascii: |2
              Kubernetes as a Zero Trust PDP/PEP
              ----------------------------------

         kubectl / client request
              |
              v
         [ API server = Enforcement / PEP ]
              |
              +--> AuthN (cert / OIDC / token)
              |
              +--> [ Authorizer = Policy Engine / PDP ]  RBAC / Webhook / OPA Gatekeeper
              |
              +--> [ Admission webhooks ] validate / mutate  (extended policy engine)
              |
              v
         persist to [ etcd = Data Store ]
sections:
  - label: "Ch. 1"
    title: "Zero Trust Fundamentals"
    note: "The paradigm shift away from perimeter-based security toward 'never trust, always verify'."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 2"
    title: "Managing Trust"
    note: "Trust management as the most important component of a zero trust network."
    sourcePath: "chapter-ii.md"
    done: true
  - label: "Ch. 3"
    title: "Context-Aware Agents"
    note: "Fine-grained policy decisions based on identity, device, and resource context."
    sourcePath: "chapter-iii.md"
    done: true
  - label: "Ch. 4"
    title: "Making Authorization Decisions"
    note: "The four components — Enforcement, Policy Engine, Trust Engine, Data Stores — and control plane vs. data plane."
    sourcePath: "chapter-iv.md"
    done: true
  - label: "Ch. 5"
    title: "Trusting Devices"
    note: "Establishing and validating device identity and health."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 6"
    title: "Trusting Identities"
    note: "Identifying and trusting users separately from devices."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 7"
    title: "Trusting Applications"
    note: "Extending trust to the applications running on devices."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 8"
    title: "Trusting the Traffic"
    note: "Encryption for confidentiality and authentication for message integrity."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 9"
    title: "Realizing a Zero Trust Network"
    note: "Putting the model into practice end-to-end."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 10"
    title: "The Adversarial View"
    note: "How attackers reason about a zero trust network."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 11"
    title: "Standards, Frameworks & Guidelines"
    note: "Zero trust architecture standards and reference frameworks."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 12"
    title: "Challenges and the Road Ahead"
    note: "Open problems and the future of zero trust."
    sourcePath: "Readme.md"
    done: false
---

A companion study of *Zero Trust Networks, 2nd Edition* (Razi Rais, Christina
Morillo, Evan Gilman & Doug Barth). Zero trust is a security paradigm shift that
eliminates traditional perimeter-based security and instead requires you to
**always assume breach** and **never trust but always verify**.

## Core benefits of zero trust

- **No implicit trust** — every user, device, and network flow must be
  authenticated, authorized, and continuously validated.
- **Reduced attack surface** — micro-segmentation and strict access controls
  minimize the blast radius of a breach.
- **Context-aware decisions** — policies are evaluated dynamically using
  real-time attributes like device health, location, and identity.
- **Improved visibility** — comprehensive insight into network activity makes
  threat detection and compliance auditing more efficient.

## Making authorization decisions

The zero trust architecture comprises four main components:

- **Enforcement** — sits in the data plane and applies decisions to live traffic.
- **Policy Engine** — the decision point; evaluates policies against context.
- **Trust Engine** — computes a dynamic trust/risk score (often ML-based) from
  behavior and activity logs.
- **Data Stores** — hold user data, device data, and activity logs.

## Control plane vs. data plane

The **control plane** (the "brain") makes security decisions based on policies
and inputs from the trust engine, while the **data plane** (the "muscle")
enforces those decisions on live traffic. The policy engine pushes policies and
configuration down to the enforcement point; the trust engine feeds context to
the policy engine; and the policy engine reads and updates the data stores.
