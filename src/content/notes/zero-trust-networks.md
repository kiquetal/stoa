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
    title: "Session- vs request-oriented"
    caption: "Authentication is session-oriented (prove once, reuse across many requests); authorization is request-oriented and uncached — every request is re-evaluated so revocation is instant."
    sourcePath: "chapter-iii.md"
    ascii: |2
         Authentication (session-oriented)      Authorization (request-oriented)
         ---------------------------------      --------------------------------
         login once ---> [ session ]            req1 -> evaluate -> allow/deny
                           |  |  |               req2 -> evaluate -> allow/deny
                         reused across           req3 -> evaluate -> allow/deny
                         many requests           (no caching; every request judged)
  - label: "Fig. 11"
    title: "Enforcement / Policy Engine separation"
    caption: "The PEP lives in the data plane and only intercepts and enforces; it invokes the PDP in the control plane, which solely focuses on decision logic — shielding the control plane from direct traffic exposure."
    sourcePath: "chapter-iv.md"
    ascii: |2
              Enforcement and Policy Engine Separation
              ----------------------------------------

              [ Data Plane ]                [ Control Plane ]
            +-----------------+           +-------------------+
            |                 |           |                   |
            |   Enforcement   |           |   Policy Engine   |
            |      (PEP)      |---------->|       (PDP)       |
            |                 |  Invoke   |                   |
            +-----------------+           +-------------------+
                     ^
                     | Intercepts
            [ User/Client Traffic ]
  - label: "Fig. 12"
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
  - label: "Fig. 13"
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
  - label: "Fig. 14"
    title: "TOTP human-in-the-loop signing"
    caption: "For static infrastructure a human supplies a TOTP that flows through the provisioning service to the signing service; only after verification is a signed certificate issued to the new device."
    sourcePath: "chapter-v.md"
    ascii: |2
             [ Human ]
                 |
                 | (1) Provides TOTP
                 v
             [ Provisioning Service ]
                 |
                 | (2) Forwards request + TOTP
                 v
             [ Signing Service ] <-----> [ Verification ]
                 |
                 | (3) Signed Certificate
                 v
             [ New Device ]
  - label: "Fig. 15"
    title: "Split-responsibility automated provisioning"
    caption: "With no human in the loop, trust is sourced from multiple disparate factors — the resource manager plus the device's TPM/image key, IP, and cert properties — so no single compromised component can grant access alone."
    sourcePath: "chapter-v.md"
    ascii: |2
             [ Resource Manager ]        [ New Device / Image ]
                      |                            |
                      | (1) Request                | (2) TPM/Image Key
                      v                            v
                 [ Signing Service ] <-------------+
                 (Checks factors: RM + TPM + IP + Cert Props)
                      |
                      | (3) Validates & Signs
                      v
                 [ Issues Cert ]
  - label: "Fig. 16"
    title: "TPM envelope encryption"
    caption: "A hybrid scheme: bulk data is encrypted with a fast symmetric AES key, and that AES key is wrapped with the TPM's Storage Root Key — binding the data to hardware whose private key never leaves the chip."
    sourcePath: "chapter-v.md"
    ascii: |2
             [ Bulk Data ]
                   |
                   | (1) Encrypt with AES Key (Symmetric)
                   v
            [ Encrypted Data ]

             [ AES Key ]
                   |
                   | (2) Wrap with TPM's SRK (Asymmetric/PKI-style)
                   v
           [ Wrapped AES Key ]
quiz:
  - question: "What is the difference between a trust anchor and a trust chain?"
    answer: "The trust anchor is the authoritative root from which all trust derives — in PKI, the self-signed root CA. The trust chain is the delegated path from that anchor down to the entity being validated, where each link vouches for (signs) the next until you reach a leaf certificate."
    hint: "One is the root; the other is the path down from it."
    sourcePath: "chapter-ii.md"
  - question: "What threat model does Zero Trust adopt, and how does that differ from perimeter security?"
    answer: "Zero Trust assumes the network is already compromised: it does not trust the local network and treats every actor as a potential attacker until proven otherwise. Perimeter security instead trusts anything inside the boundary. This is the 'always assume breach' stance."
    sourcePath: "chapter-ii.md"
  - question: "The book's rule of thumb ranks PKI options — what is the ordering, and why is private PKI preferred?"
    answer: "private PKI > public PKI > no PKI. Private PKI is preferred because you control the trust anchor, issuance policy, naming, lifetimes, and revocation; it supports short-lived certs and rapid automated rotation; and it can issue certs for private internal names. The worst option is skipping PKI and falling back to network-location trust."
    hint: "Three tiers, worst is no PKI at all."
    sourcePath: "chapter-ii.md"
  - question: "What is the biggest risk of private PKI, and what operational practice mitigates it?"
    answer: "Root-key compromise is catastrophic — whoever holds the root private key can mint trusted certs for anything. Mitigation: keep the root CA offline / air-gapped and delegate day-to-day issuance to intermediate CAs."
    sourcePath: "chapter-ii.md"
  - question: "Explain a continuous trust score as if to a new teammate — and why is it better than a binary allow/deny?"
    answer: "Instead of permanently labeling an actor 'allowed' or 'denied', the network continuously watches what the actor does and feeds signals (historical behavior, device posture, threat intelligence) into a score. Policy then reacts to the score, so access can tighten or loosen based on current risk — enabling adaptive, risk-based decisions rather than a one-time permanent grant."
    feynman: true
    sourcePath: "chapter-ii.md"
  - question: "In Zero Trust, what is an 'agent', what three things is it assembled from, and what is it used for?"
    answer: "An agent is an ephemeral, request-time combination of the user (subject), the device (asset), and the application. It is not a stored record but a view assembled per request, and it is consulted solely to make authorization decisions — never for authentication."
    hint: "user + device + application."
    sourcePath: "chapter-iii.md"
  - question: "Why is authentication session-oriented while authorization is request-oriented, and why must authorization not be cached?"
    answer: "You prove identity once and reuse it for the session's lifetime (session-oriented). Authorization is re-evaluated on every request (request-oriented) so a change in trust score or policy takes effect immediately. Caching an 'allow' would keep granting access after trust dropped or access was revoked, so caching authorization is not recommended — fresh evaluation is what makes revocation fast."
    sourcePath: "chapter-iii.md"
  - question: "If you need to cut off access fast, why is changing authorization more effective than rotating credentials?"
    answer: "Rotating credentials (rekeying, re-issuing certs) is slow and disruptive, and the old credential may stay valid until it propagates or expires. Flipping an authorization policy takes effect on the very next request because authorization is request-oriented and uncached — so revocation is near-instant. In Kubernetes this is why removing a RoleBinding beats trying to revoke a certificate."
    hint: "One takes effect next request; the other lingers until expiry."
    sourcePath: "chapter-iii.md"
  - question: "Name the four components of the Zero Trust authorization architecture and one-line each."
    answer: "Enforcement (PEP) — sits in the data path, intercepts traffic and executes the decision. Policy Engine (PDP) — compares the request to policy and returns allow/deny, where least-privilege policy lives. Trust Engine — computes the trust score from signals and provides context to the Policy Engine. Data Stores — the source-of-truth inventories (users, devices, activity) that feed the trust engine and are queried/updated by the policy engine."
    sourcePath: "chapter-iv.md"
  - question: "Why does Zero Trust put enforcement in the data plane and decision-making in the control plane?"
    answer: "It keeps a clean separation: the PEP only intercepts and enforces, while the PDP solely focuses on decision logic — which shields the control plane from direct traffic exposure. Keeping decisions in a low-volume control plane and enforcement in a high-volume data plane lets Zero Trust evaluate every request without the policy logic becoming a bottleneck."
    hint: "The 'brain' vs. the 'muscle'."
    sourcePath: "chapter-iv.md"
  - question: "Explain how the four-component model maps onto the Kubernetes API server for a single request."
    answer: "The API server is the Enforcement/PEP in the request path. It authenticates (cert/OIDC/token), then calls the authorizer (RBAC/ABAC/Webhook, with OPA/Gatekeeper and admission webhooks acting as an external Policy Engine/PDP), and finally persists to etcd — the Data Store. Vanilla k8s has no built-in Trust Engine; that role is filled by add-ons like SPIFFE/SPIRE posture or image-signing signals consumed by admission webhooks."
    feynman: true
    sourcePath: "chapter-iv.md"
  - question: "What is the single most sensitive thing to protect in a Kubernetes private PKI, and why?"
    answer: "The cluster CA key material and CSR-approval permissions. Whoever can read the cluster CA key or approve arbitrary CSRs can impersonate any component in the cluster, since every component trusts certs chaining to the cluster CA."
    sourcePath: "chapter-ii.md"
  - question: "Why can't a device be trusted to report its own security status, and what does that imply for Zero Trust?"
    answer: "Because a compromised device can lie about its own state, so its self-reported status is untrustworthy. This is why devices are the foundational battleground: Zero Trust needs hardware-backed, externally verifiable mechanisms (secure boot, TPM attestation, CA-signed certs) to establish and validate device trust rather than taking the device's word for it."
    sourcePath: "chapter-v.md"
  - question: "Where should a device's private key live, and why is a TPM/HSM the gold standard?"
    answer: "The private key should be generated and stored inside a secure cryptoprocessor (HSM or TPM), never in an unprotected file guarded only by OS permissions. In hardware the private key never leaves the chip, so even a compromised OS or a stolen disk image cannot exfiltrate it — unlike a software-based X.509 key that is vulnerable to theft."
    hint: "Keep the key in silicon, not on disk."
    sourcePath: "chapter-v.md"
  - question: "In automated provisioning, what is the 'split responsibility' model and what problem does it solve?"
    answer: "When there is no human to authorize, trust is sourced from multiple disparate components at once — the resource manager (asserting 'I turned this host on'), plus the device's TPM/image key, IP, and certificate properties. Requiring several independent factors means no single compromised component (a stolen image or an attacker-controlled resource manager) can grant access on its own."
    sourcePath: "chapter-v.md"
  - question: "When is a human-in-the-loop TOTP appropriate for signing, and what rule keeps it safe?"
    answer: "For static infrastructure where manual authorization is feasible and most secure. The key rule is that humans should only approve requests they themselves initiated — this prevents fatigue-driven rubber-stamping, and a TOTP failure is treated as a significant security event."
    sourcePath: "chapter-v.md"
  - question: "Explain TPM envelope encryption as if to a new teammate — why not just encrypt everything with the TPM key?"
    answer: "Asymmetric operations are slow, so you don't encrypt bulk data directly with the TPM key. Instead you encrypt the data with a fast symmetric AES key, then 'wrap' (encrypt) that small AES key with the TPM's Storage Root Key. To read the data the TPM unwraps the AES key using its private key, which never leaves the hardware. You get symmetric speed plus asymmetric protection, and the data is bound to that specific device."
    feynman: true
    sourcePath: "chapter-v.md"
  - question: "What are PCRs and sealing, and how does remote attestation use them?"
    answer: "Platform Configuration Registers (PCRs) store hashes of system state such as BIOS and boot records. 'Sealing' data to specific PCR values means a key only unlocks when the machine is in a known-good configuration. Remote attestation uses the TPM's Endorsement Key (EK) to sign quotes of the current PCRs, proving both host identity and software state to a remote party."
    sourcePath: "chapter-v.md"
  - question: "How does Zero Trust extend to legacy devices that can't run a modern security agent?"
    answer: "You move the Zero Trust termination point as close to the device as possible using a hardware supplicant — a dedicated TPM-equipped device that plugs directly into the legacy host (e.g. SCADA or HVAC systems) and acts as the secure Zero Trust endpoint on its behalf."
    hint: "Put the trust boundary in a plug-in box next to the old gear."
    sourcePath: "chapter-v.md"
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
    sourcePath: "chapter-v.md"
    done: true
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

## Managing trust (Ch. 2)

Trust has to start somewhere and flow outward. A single offline **trust anchor**
(the root CA) delegates down a **trust chain** so systems can scale without a
human vouching for every link. Delegation is what lets automated systems grow to
large scale while staying secure with minimal human intervention.

Zero trust starts from an explicit **threat model**: it assumes the network is
already compromised, does not trust the local network, and treats every actor as
a potential attacker until proven otherwise. The chapter catalogs the common
frameworks for reasoning about attackers — STRIDE, DREAD, PASTA, TRIKE, VAST, and
MITRE ATT&CK. Paired with this is **least privilege**: grant an entity only the
minimum permissions it needs to accomplish an action.

The mechanism that carries trust is **PKI**. An entity generates a keypair,
submits a **CSR** to a **Registration Authority** that verifies identity, and a
**Certificate Authority** signs an **X.509** certificate the entity later
presents during the TLS handshake; revocation is handled with CRLs or OCSP. The
book's practical stance is blunt: **private PKI beats public PKI, and any PKI
beats none** — falling back to network-location trust is the real failure.
Private PKI wins because you own the anchor, issuance policy, naming, lifetimes,
and rotation; the price is that root-key compromise is catastrophic, so the root
stays air-gapped and issuance is delegated to intermediates. Kubernetes is the
concept made concrete — its cluster CA and `certificates.k8s.io` CSR API are a
private PKI in action, which is why the cluster CA key and CSR-approval rights
are among the most sensitive things to protect. Trust is also not binary: a
**continuous trust score** fed by behavior, device posture, and threat
intelligence lets policy adapt to risk instead of granting permanent access.

## Context-aware agents (Ch. 3)

Zero trust's key move is refusing to treat identity as one thing. It assembles an
**agent** per request from three separately authenticated pieces — the user, the
device, and the application. Crucially, the agent exists only to make
**authorization** decisions; authentication happens independently (MFA for users,
X.509 for devices). That split explains the book's timing rule: authentication is
**session-oriented** (prove once, reuse), but authorization is
**request-oriented** and must never be cached — every request is re-judged. The
payoff is fast revocation: flipping an authorization policy takes effect on the
next request, whereas rotating credentials is slow, which is why cutting a
Kubernetes RoleBinding beats trying to revoke a certificate.

## Making authorization decisions (Ch. 4)

The zero trust architecture comprises four main components:

- **Enforcement** — the Policy Enforcement Point (PEP); sits in the data plane,
  intercepts the request, and applies the decision to live traffic.
- **Policy Engine** — the Policy Decision Point (PDP); evaluates policies against
  context and returns allow/deny. This is where least-privilege policy lives.
- **Trust Engine** — computes a dynamic trust/risk score from behavior, device
  posture, and threat-intelligence signals, feeding context to the Policy Engine.
- **Data Stores** — the source-of-truth inventories of users, devices, and their
  observed activity that feed the trust engine and are read/updated by the PDP.

A deliberate separation keeps the PEP doing nothing but intercepting and
enforcing while the PDP focuses solely on decision logic — which shields the
control plane from direct traffic exposure.

## Control plane vs. data plane

The **control plane** (the "brain") makes security decisions based on policies
and inputs from the trust engine, while the **data plane** (the "muscle")
enforces those decisions on live traffic. The policy engine pushes policies and
configuration down to the enforcement point; the trust engine feeds context to
the policy engine; and the policy engine reads and updates the data stores.
