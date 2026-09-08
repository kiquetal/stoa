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
      |   +----------------+    context    +-------------------+            |
      |   |  Trust Engine  | ------------> |   Policy Engine   |            |
      |   +----------------+               +-------------------+            |
      |          |                            |          ^                  |
      |          | uses          queries /    |          |                  |
      |          |                updates     v          |                  |
      |          |                    +-------------------+                 |
      |          +------------------> |    Data Stores    |                 |
      |                               +-------------------+                 |
      +====================================================|================+
                                                           |
                                        talks with         |
                                        Policy Engine       |
                                              ^             |
      +=======================================|=============|===============+
      |                       DATA PLANE      |             v               |
      |                      (the "muscle")   |     +----------------+      |
      |                                       +-----|   Enforcement  |      |
      |   Incoming Traffic  ---------------------->  |                | -->  |
      |                                             +----------------+ Allow/|
      |                                                               Deny/  |
      |                                                               Route  |
      +=====================================================================+
sections:
  - label: "Ch. 1"
    title: "Zero Trust Fundamentals"
    note: "The paradigm shift away from perimeter-based security toward 'never trust, always verify'."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 2"
    title: "Managing Trust"
    note: "Trust management as the most important component of a zero trust network."
    sourcePath: "Readme.md"
    done: false
  - label: "Ch. 3"
    title: "Context-Aware Agents"
    note: "Fine-grained policy decisions based on identity, device, and resource context."
    sourcePath: "Readme.md"
    done: false
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
