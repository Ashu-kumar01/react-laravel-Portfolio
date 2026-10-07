/** Joins truthy class names. Tiny alternative to clsx for this codebase. */
export function cn(...classes) {
  return classes.flat(Infinity).filter(Boolean).join(' ')
}
