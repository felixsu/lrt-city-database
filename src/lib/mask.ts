const MASK_CHAR = "•";

/** Masks the last 60% of characters of a single word, keeping the rest visible at the start. */
function maskWord(word: string): string {
  const maskedCount = Math.ceil(word.length * 0.6);
  const visibleCount = word.length - maskedCount;
  return word.slice(0, visibleCount) + "*".repeat(maskedCount);
}

/**
 * Masks each word of a name independently: the last 60% of each word's
 * characters are replaced with "*", keeping the first 40% visible.
 * E.g. "Ayu" -> "A**", "Felix" -> "Fe***", "Raharjo" -> "Ra*****".
 */
export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(maskWord)
    .join(" ");
}

/** Shows only the first 4 and last 4 characters of a contact number. */
export function maskContactNumber(contact: string): string {
  const trimmed = contact.trim();
  if (trimmed.length <= 8) return trimmed;
  const first = trimmed.slice(0, 4);
  const last = trimmed.slice(-4);
  return `${first}${MASK_CHAR.repeat(trimmed.length - 8)}${last}`;
}
