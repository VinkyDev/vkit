export function parse<T = unknown>(text: string, fallback: Partial<T>): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback as Required<T>;
  }
}

export function stringify<T = unknown>(value: T) {
  return JSON.stringify(value);
}
