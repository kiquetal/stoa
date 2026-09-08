/** Shared display helpers for the Curator's Index UI. */

export type Status = "reading" | "completed" | "reference" | "planned";

/** Terracotta filled/outlined asterisk-style rating glyphs (per DESIGN.md). */
export function ratingGlyphs(rating?: number): string {
  if (rating == null) return "";
  const full = Math.round(rating);
  const clamped = Math.max(0, Math.min(5, full));
  return "✦".repeat(clamped) + "✧".repeat(5 - clamped);
}

export function statusLabel(status: Status): string {
  switch (status) {
    case "reading":
      return "Reading Now";
    case "completed":
      return "Finished";
    case "reference":
      return "Reference";
    case "planned":
      return "Planned";
  }
}

/** Tailwind classes for the small status badge. */
export function statusClasses(status: Status): string {
  switch (status) {
    case "reading":
      return "bg-ink text-surface";
    case "completed":
      return "bg-tertiary-fixed text-tertiary-container";
    case "reference":
      return "bg-surface-container-highest text-on-surface-variant";
    case "planned":
      return "bg-secondary-fixed text-on-secondary-fixed";
  }
}

export function sectionWord(type: "book" | "course"): string {
  return type === "course" ? "Modules" : "Chapters";
}
