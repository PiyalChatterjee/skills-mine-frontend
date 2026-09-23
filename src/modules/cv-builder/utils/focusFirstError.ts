// Walks a react-hook-form errors object and returns the dot/index path of the
// first concrete field error (e.g. "careerHistory.0.companyName"), preferring
// specific field errors over an array/object's own root-level message.
export function getFirstErrorFieldPath(
  errors: unknown,
  prefix = "",
): string | null {
  if (!errors || typeof errors !== "object") return null;

  const entries: [string, unknown][] = Array.isArray(errors)
    ? [
        ...errors.map((value, index): [string, unknown] => [String(index), value]),
        ...("root" in errors ? [["root", (errors as Record<string, unknown>).root] as [string, unknown]] : []),
      ]
    : Object.entries(errors as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (key === "root" || !value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const node = value as Record<string, unknown>;
    if (typeof node.message === "string" || typeof node.type === "string") {
      return path;
    }
    const nested = getFirstErrorFieldPath(node, path);
    if (nested) return nested;
  }

  // No concrete field found; fall back to a root-level (array/object) message.
  for (const [key, value] of entries) {
    if (key === "root" && value) return prefix || null;
  }

  return null;
}

// Scrolls to and focuses the first invalid field, matched via its `data-field`
// attribute on the field's wrapping element. Returns true if a target was found.
export function focusFirstErrorField(errors: unknown): boolean {
  const path = getFirstErrorFieldPath(errors);
  if (!path) return false;

  const container = document.querySelector(`[data-field="${path}"]`);
  if (!container) return false;

  container.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusTarget = container.matches("input, textarea, select, button, [tabindex]")
    ? (container as HTMLElement)
    : container.querySelector<HTMLElement>("input, textarea, select, [tabindex]");
  focusTarget?.focus({ preventScroll: true });

  return true;
}
