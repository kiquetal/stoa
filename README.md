# Curator's Index

An [Astro](https://astro.build) + [Tailwind](https://tailwindcss.com) notes
platform for cataloging the books and courses you are studying. Each learning
resource is a single Markdown file whose frontmatter drives a catalog card on
the index page and a rich detail page with sections, figures, and
active-recall quizzes.

## What this folder is

This repository is the site itself — the Astro app plus your study notes as
content. A "note" is one learning resource (a book or a course). You write your
synthesis in the Markdown body, and the frontmatter powers the catalog UI:
progress bars, cover art, chapter/module lists, diagrams, and Q/A decks.

Source notes for each resource typically live in a **separate companion repo**
(declared via `repo` + `sourcePath` in the frontmatter); the detail page turns
those into working "View Source" deep-links back to GitHub.

## Project layout

```
src/
  content/
    config.ts        # Zod schema for the "notes" content collection
    notes/           # One Markdown file per book/course (the catalog entries)
  pages/
    index.astro      # Catalog: metrics, reading desks, client-side filtering
    notes/[slug].astro  # Detail page: sections, figures, recall deck
  components/        # BookCard and other UI pieces
  layouts/           # BaseLayout
  lib/               # display helpers
  site.config.ts     # githubUser/default branch + repoUrl/sourceUrl helpers
  assets/covers/     # cover images referenced by notes
.kiro/agents/        # qa-generator agent (writes quizzes/diagrams into notes)
_design/             # design references (screens, mockups)
```

## Authoring a note

Create `src/content/notes/<slug>.md`. The `<slug>` becomes the detail-page URL.
Frontmatter is validated by `src/content/config.ts`. Common fields:

```yaml
---
title: "Domain Modeling Made Functional"
author: "Scott Wlaschin"
type: book            # book | course (sections render as "chapters" vs "modules")
category: "Tech / Domain-Driven Design"
status: reading       # reading | completed | reference | planned
progress: 40          # 0..100, drives the progress bar
repo: "kiquetal/domain-modeling-made-functional"  # companion source repo
sourcePath: "notes/README.md"
tags: ["fsharp", "ddd"]
summary: "Short synopsis shown on the card."
sections:             # chapters (book) or modules (course)
  - label: "Note"
    title: "Bounded Contexts"
    sourcePath: "notes/bounded-context.md"  # deep-links to the companion repo
    done: true
diagrams: []          # optional ASCII / Mermaid figures
quiz: []              # optional active-recall Q/A
---

Your synthesis / commonplace notes go here (Markdown body).
```

See `src/content/config.ts` for the full schema, including `diagrams` (each
figure is exactly one of `ascii` or `mermaid`) and `quiz` items.

## Quizzes & diagrams

The `qa-generator` Kiro agent (`.kiro/agents/qa-generator.json`) reads a note
and its companion source files, then appends grounded `quiz:` and `diagrams:`
arrays to the note's frontmatter. Quizzes power the active-recall deck; diagrams
render as figures (Mermaid or verbatim ASCII box-art) on the detail page.

## Local development

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the built site
```

## Stack

- Astro 5 with content collections
- Tailwind CSS 3
- MDX
- Shiki for code highlighting
