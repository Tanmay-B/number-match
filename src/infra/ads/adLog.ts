const PREFIX = '[ads]'

/**
 * Ad failures used to be swallowed at every level — two silent `.catch`
 * handlers and a load error that was read but never reported — which left no
 * way to tell a misconfiguration from no fill from a dead network.
 *
 * Everything here goes through `console`, so on a device it surfaces in
 * `adb logcat -s ReactNativeJS:V` (Android) or the Xcode console (iOS).
 */
export function logAdEvent(message: string): void {
  console.log(`${PREFIX} ${message}`)
}

export function logAdError(message: string, cause?: unknown): void {
  console.warn(`${PREFIX} ${message}`, describe(cause))
}

/** Short, displayable reason for an ad failure. */
export function describeAdError(cause: unknown): string {
  const text = describe(cause)
  return text.length > 0 ? text : 'Unknown ad error'
}

function describe(cause: unknown): string {
  if (!cause) {
    return ''
  }

  if (typeof cause === 'string') {
    return cause
  }

  if (cause instanceof Error) {
    // The SDK puts its reason in `code` (e.g. no-fill, network-error).
    const code = (cause as Error & { code?: string }).code
    return code ? `${code}: ${cause.message}` : cause.message
  }

  try {
    return JSON.stringify(cause)
  } catch {
    return String(cause)
  }
}
