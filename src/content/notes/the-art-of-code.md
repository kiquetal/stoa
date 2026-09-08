---
title: "The Art of Code"
author: "Sandrine Banas"
type: book
category: "Tech / Craft"
year: 2025
status: reading
progress: 25
rating: 5
format: "Companion Repo"
repoPath: "book-the-art-of-code/README.md"
summary: "Master programmers think of systems as stories to be told, not programs to be written. A study of what makes code beautiful — followed with a Java-to-F# companion port."
tags: ["clean-code", "functional-programming", "domain-modeling", "fsharp", "software-craft"]
updated: 2026-08-11
anchor:
  label: "Reflection — Ch. I"
  text: "Is domain-specific exception handling the exception to purity? When a functional pipeline must fail, how do we make that failure explicit without silent nulls?"
sections:
  - label: "Ch. I"
    title: "The Aesthetics of Code"
    note: "The seven pillars of beautiful code — simplicity, clarity, expressiveness, purity, sustainability, durability, creativity."
    meta: "notes + Java/F# pricing pipeline"
    done: true
  - label: "Ch. II"
    title: "Code as Narrative"
    note: "Every program tells a story. Four narrative levels: actions, scenes, chapters, table of contents."
    meta: "in progress"
    done: false
---

> "A mathematician, like a painter or a poet, is a maker of patterns. If his
> patterns are more permanent than theirs, it is because they are made with
> ideas... the ideas, like the colors or the words, must fit together in a
> harmonious way." — G.H. Hardy

> "The art of programming is, and has always been, the art of language design.
> Master programmers think of systems as **stories to be told** rather than
> programs to be written."

This is a companion study of *The Art of Code* by Sandrine Banas. The book's
official exercises are in Java; alongside my reading notes I'm porting the ideas
to **F#** to see how functional, type-first modeling makes designs safer and
more expressive.

## Chapter I — The Aesthetics of Code

Beautiful code rests on seven foundational pillars:

- **Simplicity** — not the absence of complexity, but the discipline of refining
  complexity into its clearest, most maintainable form.
- **Clarity of Intent** — model data explicitly, name it precisely, and let
  behavior organize itself around that structure.
- **Expressiveness** — use the full power of the language to translate ideas
  directly, without twisting syntax to make things work.
- **Purity** — predictable, side-effect-free logic. Input goes in, output comes
  out, no surprises. This is where functional programming brings mathematical
  beauty into code, increasing testability and reuse.
- **Sustainability** — apply the same discipline to *resources* (computation,
  memory, network, hardware) that beautiful code applies to logic.
- **Durability** — designs that stand the test of time and adapt gracefully
  rather than break under pressure.
- **Creativity** — the dimension that turns principles into working code, usually
  emerging under real constraints (readability, performance, deadlines, legacy).

### Exception handling in functional pipelines: the exception to purity?

Chapter I's `MissingPriceException` shows how to combine the expressiveness of a
functional pipeline with a domain-specific exception, making failure explicit,
informative, and safe.

The imperative way — silent and risky:

```java
public BigDecimal getFinalPrice(Product product) {
    if (product != null && product.pricingDetails() != null) {
        if (product.pricingDetails().discountedPrice() != null) {
            return product.pricingDetails().discountedPrice().amount();
        } else if (product.pricingDetails().basePrice() != null) {
            return product.pricingDetails().basePrice().amount();
        }
    }
    // Silent failure: returns null, forcing the caller to risk an NPE
    return null;
}
```

The expressive, domain-exception way — explicit and safe:

```java
public BigDecimal getFinalPrice(Product product) throws MissingPriceException {
    return Optional.ofNullable(product)
        .map(Product::pricingDetails)
        .map(this::selectPrice)
        .map(Price::amount)
        .orElseThrow(() -> new MissingPriceException(product));
}
```

Why this reinforces the theory:

1. **Clarity of intent** — the signature declares `throws MissingPriceException`,
   so the failure mode is visible to every caller. No ambiguous `null`.
2. **Expressiveness** — the pipeline flows step to step, transforming data with no
   nesting or branching; the failure is handled at the end with `.orElseThrow()`.
3. **Purity & safety** — it either returns a fully valid computed price or fails
   explicitly, carrying the failing `product` as domain context.

### F# companion take

The F# port avoids exceptions and `null` entirely: invalid domain states are made
*unrepresentable at compile time* via records and discriminated unions, and the
workflow returns a type-safe `Result` union instead of throwing.

```fsharp
// core domain logic returns a Result rather than throwing
let getFinalPrice (product: Product) : Result<Amount, PricingError> =
    product
    |> selectPrice          // chooses discounted over base
    |> Result.map (fun p -> p.Amount)
```

## Chapter II — Code as Narrative

> Every program tells a story, and the clearer that story is, the easier it
> becomes for others to understand, maintain, and extend it.

Narrative code follows recurring plot patterns: *Delivering, Cleaning, Archiving,
Defense, Transformation.* It reads across **four narrative levels**:

- **Actions** — the simplest elements; small individual events (the basic
  building blocks of the story).
- **Scenes** — a few actions grouped into a meaningful moment with one dominant
  plot, keeping responsibilities focused.
- **Chapters** — multiple scenes advancing the larger arc; more than one plot may
  appear, but all aligned around a single coherent goal.
- **Table of Contents** — lists chapters in story-arc order, giving a high-level
  overview of the whole scope.

### The ending

Every story must end, even in code — but code has only two endings: **success or
failure**, no poetic ambiguity. In programming, **silence means success, never
failure**. Failure must always be explicit, and can be total, partial, or paired
with a recovery mechanism.
