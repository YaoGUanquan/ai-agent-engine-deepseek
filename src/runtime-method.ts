import { symbols } from '@deepseek-ai/cordis'

/** Interpose a public service method without capturing the caller's Cordis realm. */
export function wrapMethod<T extends object, K extends keyof T>(
  service: T, key: K, wrap: (original: T[K]) => T[K],
): () => void {
  const raw = (service as T & { [symbols.original]?: T })[symbols.original] ?? service
  const descriptor = Object.getOwnPropertyDescriptor(raw, key)
  const original = raw[key]
  const adapted = wrap(original)
  if (typeof original !== 'function' || typeof adapted !== 'function') throw new TypeError('Expected a service method')
  let active = true
  const replacement = function (this: T, ...args: unknown[]) {
    return Reflect.apply(active ? adapted : original, this, args)
  }
  Object.defineProperty(raw, key, { configurable: true, writable: true, value: replacement })
  return () => {
    active = false
    if (raw[key] !== replacement) return
    if (descriptor) Object.defineProperty(raw, key, descriptor)
    else Reflect.deleteProperty(raw, key)
  }
}
