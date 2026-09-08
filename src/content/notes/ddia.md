---
title: "Designing Data-Intensive Applications"
author: "Martin Kleppmann"
type: book
category: "Tech / Storage"
year: 2017
status: reading
progress: 68
rating: 5
format: "Hardcover"
pages: 560
currentPage: 384
isbn: "978-1449373320"
publisher: "O'Reilly Media"
repoPath: "notes/tech/ddia.md"
repoUrl: "https://github.com/example/reading-vault"
summary: "The definitive taxonomy of stateful computation under partial failure — reliability as an emergent contract built over unreliable networks."
tags: ["distributed-systems", "consensus", "storage", "b-trees"]
updated: 2026-09-01
anchor:
  label: "Recall Prompt #89-B"
  text: "What explicit invariant guarantees linearizable CAS register safety across an unpartitioned minority quorum?"
sections:
  - label: "Ch. 3"
    title: "Storage & Retrieval: LSM-Trees vs B-Trees"
    note: "SSTable compaction cascades, write amplification tradeoffs, Bloom filters for negative lookups."
    meta: "920 words · compared with Database Internals"
    done: true
  - label: "Ch. 7"
    title: "Transactions: Weak Isolation & Write Skew"
    note: "Why snapshot isolation fails to prevent meeting-room double-booking."
    meta: "1,410 words · includes PostgreSQL SSI notes"
    done: true
  - label: "Ch. 9"
    title: "Consistency & Consensus Under Partitions"
    note: "Linearizability vs serializability; the consensus equivalence lattice."
    meta: "in progress"
    done: false
---

DDIA is the definitive taxonomy of stateful computation under partial failure.
Kleppmann's enduring insight is that **reliability is not a property of hardware**,
but an emergent behavioral contract constructed through disciplined abstractions
over inherently unreliable network topologies.

## Consistency & Consensus Under Partitions

> Linearizability and serializability are often conflated. Linearizability is a
> recency guarantee on single-object registers (reads see the latest write in
> absolute wall-clock time). Serializability is an isolation guarantee on
> multi-object atomic transactions without any recency constraint.

**The consensus equivalence lattice.** Kleppmann constructs a mathematical bridge
showing that the following canonical problems are strictly equivalent:

- Linearizable compare-and-set (CAS) registers
- Atomic distributed transaction commit (2PC / 3PC)
- Total order broadcast (FIFO ordered append-only queue)
- Distributed lock allocation with fencing tokens / epoch numbers

A useful mental model for total order broadcast:

```text
if all nodes agree on sequence 0..N,
total order broadcast == append-only state replication.
a split-brain failure occurs only when quorum overlap is lost.
```

Cross-reference: see the concurrency notes in `notes/tech/ostep.md`.

### Why wall clocks lie

NTP clock skew, monotonic intervals, and Byzantine faults mean wall-clock
timestamps must *never* determine transaction order. Google Spanner sidesteps
this with TrueTime's bounded uncertainty interval.
