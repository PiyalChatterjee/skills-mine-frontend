import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

const focusSelector =
  'input:not([type="hidden"]):not([aria-hidden="true"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled), [role="combobox"]:not([aria-disabled="true"]), [contenteditable="true"], [tabindex]:not([tabindex="-1"]):not([aria-disabled="true"])';

export function getFirstErrorFieldPath(
  errors: unknown,
  prefix = "",
): string | null {
  if (!errors || typeof errors !== "object") return null;

  const entries: [string, unknown][] = Array.isArray(errors)
    ? [
        ...errors.map((value, index): [string, unknown] => [
          String(index),
          value,
        ]),
        ...("root" in errors
          ? [
              ["root", (errors as Record<string, unknown>).root] as [
                string,
                unknown,
              ],
            ]
          : []),
      ]
    : Object.entries(errors as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (key === "root" || !value || typeof value !== "object") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    const node = value as Record<string, unknown>;
    if (typeof node.message === "string" || typeof node.type === "string")
      return path;
    const nested = getFirstErrorFieldPath(node, path);
    if (nested) return nested;
  }

  for (const [key, value] of entries) {
    if (key === "root" && value) return prefix || null;
  }
  return null;
}

export function focusFirstErrorField(errors: unknown): boolean {
  const path = getFirstErrorFieldPath(errors);
  if (!path) return false;

  const container = document.querySelector(
    `[data-field="${path}"], [name="${path}"]`,
  );
  const focusTarget = container?.matches(focusSelector)
    ? (container as HTMLElement)
    : container?.querySelector<HTMLElement>(focusSelector);
  if (focusTarget) {
    container?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    focusTarget.focus({ preventScroll: true });
    return true;
  }

  const errorMap = errors as Record<string, unknown>;
  const error =
    errorMap[path] ??
    path
      .split(".")
      .reduce<unknown>(
        (node, key) =>
          node && typeof node === "object"
            ? (node as Record<string, unknown>)[key]
            : undefined,
        errors,
      );
  const ref = (error as { ref?: { focus?: () => void } } | undefined)?.ref;
  if (typeof ref?.focus !== "function") return false;
  ref.focus();
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.scrollIntoView?.({
      behavior: "smooth",
      block: "center",
    });
  }
  return true;
}

export async function validateAndFocusForm<TFieldValues extends FieldValues>(
  form: Pick<
    UseFormReturn<TFieldValues>,
    "trigger" | "getValues" | "getFieldState"
  >,
  fields?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[],
): Promise<boolean> {
  const isValid = await form.trigger(fields, { shouldFocus: true });
  if (isValid) return true;

  const paths =
    fields === undefined
      ? (Object.keys(form.getValues()) as FieldPath<TFieldValues>[])
      : Array.isArray(fields)
        ? fields
        : [fields];
  const errors = Object.fromEntries(
    paths.map((name) => [name, form.getFieldState(name).error]),
  );
  focusFirstErrorField(errors);
  return false;
}
