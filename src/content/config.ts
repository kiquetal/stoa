import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * A "note" is one learning resource: a book or a course you are studying.
 * The markdown body is your synthesis / commonplace notes and is rendered
 * on the detail page. The frontmatter drives the catalog cards on the index.
 */
const notes = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/notes" }),
  schema: ({ image }) =>
    z.object({
      // --- Core identity ---
      title: z.string(),
      author: z.string().optional(),
      // book | course — controls whether sections are "chapters" or "modules"
      type: z.enum(["book", "course"]).default("book"),
      // Intellectual domain shown as the top card pill, e.g. "Tech / Storage"
      category: z.string(),
      year: z.union([z.string(), z.number()]).optional(),

      // --- Status & progress ---
      // reading | completed | reference | planned
      status: z
        .enum(["reading", "completed", "reference", "planned"])
        .default("reading"),
      // 0..100, drives the progress bar
      progress: z.number().min(0).max(100).default(0),
      rating: z.number().min(0).max(5).optional(),

      // --- Bibliographic / provenance ---
      format: z.string().optional(), // "Hardcover", "PDF / Web", "EPUB"...
      pages: z.number().optional(),
      currentPage: z.number().optional(),
      isbn: z.string().optional(),
      publisher: z.string().optional(),
      // Where the raw markdown lives, shown as an archival breadcrumb
      repoPath: z.string().optional(), // e.g. "notes/tech/ddia.md"
      repoUrl: z.string().url().optional(),

      // --- Discovery ---
      tags: z.array(z.string()).default([]),
      summary: z.string().optional(), // short synopsis on the card
      cover: image().optional(),
      coverAlt: z.string().optional(),
      order: z.number().optional(), // manual sort weight

      // --- Sections: chapters (book) or modules (course) ---
      sections: z
        .array(
          z.object({
            label: z.string().optional(), // "Ch. 9", "Module 2"
            title: z.string(),
            note: z.string().optional(), // one-line synthesis
            meta: z.string().optional(), // "1,410 words • ..."
            done: z.boolean().default(false),
          }),
        )
        .default([]),

      // --- Optional featured pull-quote / recall anchor for the detail page ---
      anchor: z
        .object({
          label: z.string().optional(), // "Recall Prompt #89-B"
          text: z.string(),
        })
        .optional(),

      updated: z.coerce.date().optional(),
    }),
});

export const collections = { notes };
