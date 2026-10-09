// Standard UK postcode pattern (covers GIR 0AA plus all standard formats).
const UK_POSTCODE_RE =
  /^(GIR ?0AA|[A-PR-UWYZ]([0-9]{1,2}|[A-HK-Y][0-9]([0-9ABEHMNPRV-Y])?|[0-9][A-HJKPS-UW]) ?[0-9][ABD-HJLNP-UW-Z]{2})$/i;

export function isValidUKPostcode(value) {
  if (!value) return false;
  return UK_POSTCODE_RE.test(value.trim());
}

// Uppercases and inserts a single space before the last 3 characters, the
// conventional UK postcode layout (e.g. "ol69rb" -> "OL6 9RB").
export function normalisePostcode(value) {
  const compact = (value || "").replace(/\s+/g, "").toUpperCase();
  if (compact.length < 5) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`;
}
