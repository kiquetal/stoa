---
title: "Domain Modeling Made Functional"
author: "Scott Wlaschin"
type: book
category: "Tech / Domain-Driven Design"
year: 2018
status: reading
progress: 40
format: "Companion Repo (F# + Java 21)"
publisher: "Pragmatic Bookshelf"
repo: "kiquetal/domain-modeling-made-functional"
sourcePath: "notes/README.md"
repoBranch: "main"
cover: "../../assets/covers/domain-modeling-made-functional.jpg"
coverAlt: "Domain Modeling Made Functional cover — Scott Wlaschin, Pragmatic Bookshelf"
summary: "Bridging business requirements directly into type-safe functional code. An executable Order-Taking bounded context where illegal states are unrepresentable — modeled in F# and mapped to Java 21."
tags: ["domain-driven-design", "functional-programming", "fsharp", "java21", "railway-oriented-programming", "type-safety", "hexagonal-architecture"]
updated: 2026-06-25
anchor:
  label: "Design Mantra"
  text: "Make illegal states unrepresentable. If it compiles, it's valid — business rules are baked directly into the type system."
quiz:
  - question: "How do bounded contexts communicate with each other, and why?"
    answer: "Asynchronously via domain events. This gives loose coupling (no knowledge of internals), temporal decoupling (the receiver can be offline), and autonomy (each context owns its storage and evolves independently)."
    hint: "Think about what a service publishes, not what it calls."
    sourcePath: "notes/bounded-context.md"
  - question: "What is the difference between a Domain Type and a DTO, and where does the translation live?"
    answer: "Domain types enforce invariants and encapsulate behavior; DTOs are flat, primitive, public-only structures built for serialization. Translation happens strictly at the system edges (ports & adapters) via an Anti-Corruption Layer, keeping the core domain free of JSON/ORM/web dependencies."
    sourcePath: "notes/bounded-context.md"
  - question: "What is the difference between a product type and a sum type in F#?"
    answer: "A product type (record, 'AND') holds several named values that all exist at once. A sum type / discriminated union ('OR') is exactly one of several tagged cases."
    hint: "AND vs. OR."
    sourcePath: "notes/modeling-domain.md"
  - question: "Why does F#'s Result.map put the Result container as its LAST argument?"
    answer: "Because functions are curried and arrows associate right, partially applying map with just the mapper yields a Result<'T> -> Result<'U> transformer. Putting the container last lets the pipeline operator |> feed it directly."
    sourcePath: "notes/modeling-domain.md"
  - question: "Explain a smart constructor as if to a new teammate."
    answer: "Make the type's real constructor private and expose a `create` function that validates the input and returns a Result — Ok wrapping a guaranteed-valid value, or Error describing why it failed. Because nothing else can build the type, an invalid instance can never exist."
    feynman: true
    sourcePath: "notes/modeling-domain.md"
  - question: "Fail-fast vs. error accumulation: when do you use each?"
    answer: "Monadic Result.bind is fail-fast — it stops at the first error, good for dependent steps. An applicative Validation accumulates all errors (concatenating error lists), good for independent field validations where you want every problem reported at once."
    sourcePath: "notes/modeling-optional-errors-collections.md"
sections:
  - label: "Note"
    title: "Bounded Contexts"
    note: "Semantic boundaries, ubiquitous language, context maps, DTOs & the anti-corruption layer."
    sourcePath: "notes/bounded-context.md"
    done: true
  - label: "Note"
    title: "Modeling the Domain"
    note: "Product vs. sum types, records, construction/deconstruction, smart constructors, currying."
    sourcePath: "notes/modeling-domain.md"
    done: true
  - label: "Note"
    title: "Domain Modeling with Types"
    note: "Algebraic data types to make illegal states unrepresentable."
    sourcePath: "notes/modeling-domains-with-types.md"
    done: true
  - label: "Note"
    title: "Optional Values, Errors & Collections"
    note: "Option, Result monads, unit, list cons pattern matching; fail-fast vs. error accumulation."
    sourcePath: "notes/modeling-optional-errors-collections.md"
    done: true
  - label: "Note"
    title: "Code Structure Within a Context"
    note: "Folder layout, grouping by workflow, F# compilation-order as an architectural constraint."
    sourcePath: "notes/code-structure-within-a-bounded-context.md"
    done: true
  - label: "Note"
    title: "Functional Architecture"
    note: "Input-Process-Output, pure vs. impure, Railway-Oriented Programming."
    sourcePath: "notes/functional-architecture.md"
    done: true
  - label: "Note"
    title: "Workflows Within a Context"
    note: "Business actions as mathematical functional signatures producing domain events."
    sourcePath: "notes/worklows-within-a-bounded.context.md"
    done: true
  - label: "Note"
    title: "Organizing Types in Files & Projects"
    note: "Declaration order and full functional pipelines."
    sourcePath: "notes/organizing-types-in-files-and-projects.md"
    done: false
---

A study of Scott Wlaschin's *Domain Modeling Made Functional*, built as both a
set of deep-dive notes and a **fully executable Order-Taking bounded context**.
The goal is to align strategic DDD with tactical FP so the code represents the
business with no impedance mismatch, illegal states are compile-time impossible,
and the core domain stays pure and testable — modeled first in **F#**, then
mapped to **Java 21**.

## Key design philosophies

- **Make illegal states unrepresentable** — business rules baked into the type
  system via constrained simple types (value objects) with private constructors.
  *If it compiles, it's valid.*
- **Workflows as pipelines** — use cases modeled as small, pure, composable
  functions chained with monadic binding (`Result.bind`).
- **Pure & decoupled domain** — `Domain.fs` / `Types.fs` have zero dependencies on
  databases, ORMs, serialization, or network boundaries.
- **Event-driven outputs** — workflows ingest raw data, validate, transform, and
  emit **domain events** (`OrderPlaced`, `BillCreated`) rather than mutating a DB.

## Bounded contexts & communicating across boundaries

A bounded context defines a boundary within which domain terms have unique,
unambiguous meaning. Contexts communicate **asynchronously via domain events**,
which buys loose coupling, temporal decoupling, and autonomy (each context owns
its own storage and can evolve independently).

Data crossing a boundary is **not** a domain type — it's a **DTO**: flat,
primitive, public-only, built for serialization. Domain types enforce
invariants; DTOs move bytes.

```text
[Raw JSON] -> [Inbound DTO] -> [Translation Layer] -> [Pure Domain Type]
[Pure Domain Outcome] -> [Boundary Translation] -> [Outbound DTO] -> [JSON]
```

The translation (parse + validate) lives strictly **at the edges** (ports &
adapters / hexagonal). The core library never depends on Jackson, an ORM, or a
web framework — this is the **Anti-Corruption Layer** that stops external
schemas from polluting the domain.

## Composing types: AND vs. OR

```fsharp
// "AND" — a product type (all fields present at once)
type FruitSalad = { Apple: AppleVariety; Banana: BananaVariety }

// "OR" — a sum type / discriminated union (exactly one case)
type FruitSnack =
    | Apple of AppleVariety
    | Banana of BananaVariety
```

Records are **immutable** with **structural equality** — ideal DDD value
objects. Update them non-destructively with `with`, and reach for anonymous
records (`{| ... |}`) for transient payloads:

```fsharp
let deactivated = { customer with IsActive = false }
let payload = {| TransactionId = "TX-987"; Amount = 45.99M |}
```

## Smart constructors — invariants at compile time

A constrained single-case union with a **private constructor** forces creation
through a validating smart constructor that returns a `Result`:

```fsharp
type EmailAddress = private EmailAddress of string

module EmailAddress =
    let create fieldName (input: string) : Result<EmailAddress, string> =
        if String.IsNullOrWhiteSpace input then Error $"{fieldName} cannot be empty"
        elif not (emailRegex.IsMatch input) then Error $"{fieldName}: '{input}' is invalid"
        else Ok (EmailAddress input)

    let value (EmailAddress str) = str
```

### Currying, partial application & reading `Result.map`

F# functions are **curried**: `create` has type
`string -> string -> Result<...>`, which associates right as
`string -> (string -> Result<...>)`. Supplying one argument yields a new
function (**partial application**):

```fsharp
let validateCustomerEmail = EmailAddress.create "Customer Email"
// validateCustomerEmail : string -> Result<EmailAddress, string>
```

This is *why* `Result.map` puts the container last —
`('T -> 'U) -> Result<'T,'E> -> Result<'U,'E>` — so partially applying the
mapper produces a `Result -> Result` transformer the pipeline `|>` can feed:

```fsharp
EmailAddress.create "Customer Email" rawEmail
|> Result.map (fun validEmail -> { Name = name; Email = validEmail })
```

## Modeling optional values, errors & collections

Optional fields use `Option` instead of `null` (the compiler forces handling
both `Some` and `None`). Expected failures are first-class values via `Result`
plus a domain error union, enabling exhaustive matching and Railway-Oriented
Programming:

```fsharp
type PaymentError = CardTypeNotRecognized | PaymentRejected | PaymentProviderOffline

let processPayment payment =
    payment |> validateCard |> Result.bind chargeCard
```

"No value" is `unit` (`()`), never `void`. Collections favor the immutable
`list` with cons pattern matching (`head :: tail`) for recursion.

## Mapping to Java 21

Sum types become **sealed interfaces + records** with exhaustive `switch`
record patterns:

```java
public sealed interface ProductCode permits Widget, Gizmo {}
public record Widget(String code) implements ProductCode {}
public record Gizmo(String code) implements ProductCode {}

String value(ProductCode pc) {
    return switch (pc) {
        case Widget(String code) -> code;
        case Gizmo(String code)  -> code;
    };
}
```

**Fail-fast (monad) vs. error accumulation (applicative).** `Result.bind` stops
at the first error. To collect *all* validation errors, an applicative
`Validation` type concatenates error lists, giving flat pipelines:

```java
Validation<Customer, String> result = Validation.combine(
    validateName(rawName),
    validateEmail(rawEmail),
    validateAge(rawAge),
    Customer::new
);
```

## The executable bounded context

The runner exercises four scenarios proving the type system blocks bad data
*before* any business logic runs:

1. **Valid order** → emits `OrderPlaced` + `BillCreated`.
2. **Invalid email** → rejected at validation.
3. **Invalid product code** → only `W`/`G` + 4 digits may enter the domain.
4. **Out-of-range quantity** → enforces the `1..1000` invariant.

## Study roadmap

- **Phase 1 — Strategic Foundations (Ch. 1–4):** ✅ bounded contexts, ubiquitous
  language, context maps, workflows as signatures.
- **Phase 2 — F# Tactical Modeling (Ch. 5–8):** 🔄 algebraic types, smart
  constructors, ROP, parse/domain separation (Model B).
- **Phase 3 — Advanced Pipelines (Ch. 9–12):** ⏳ external effects, persistence
  ignorance, serialization & API boundaries.
- **Phase 4 — Java 21 Polyglot Port:** ⏳ sealed interfaces, record patterns,
  record-based flatMaps.
