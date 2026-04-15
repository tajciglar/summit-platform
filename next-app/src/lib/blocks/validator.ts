// stub — real impl in Task 7.
export type ValidationResult = { ok: true } | { ok: false; error: string };
export function validateJsx(_jsx: string): ValidationResult {
  return { ok: true };
}
