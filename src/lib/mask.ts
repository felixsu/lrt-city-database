const MASK_CHAR = "•";

/** Shows only the last 3 characters of a name; everything before is masked. */
export function maskName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length <= 3) return trimmed;
  const visible = trimmed.slice(-3);
  return MASK_CHAR.repeat(trimmed.length - 3) + visible;
}

/** Shows only the first 4 and last 4 characters of a contact number. */
export function maskContactNumber(contact: string): string {
  const trimmed = contact.trim();
  if (trimmed.length <= 8) return trimmed;
  const first = trimmed.slice(0, 4);
  const last = trimmed.slice(-4);
  return `${first}${MASK_CHAR.repeat(trimmed.length - 8)}${last}`;
}
