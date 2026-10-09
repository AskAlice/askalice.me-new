/**
 * Reduce a GLSL compiler info log to one short, human-readable line for the
 * editor status chip, e.g. "ERROR: 0:12: 'x' : undeclared identifier" →
 * "line 12: 'x' : undeclared identifier".
 */
export function shortErr(log: string): string {
  const line = log.split('\n').map((s) => s.trim()).filter(Boolean)[0] || 'compile error'
  return line.replace(/^ERROR:\s*\d+:/, 'line ').slice(0, 52)
}
