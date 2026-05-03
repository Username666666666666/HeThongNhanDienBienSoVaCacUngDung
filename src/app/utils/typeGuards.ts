export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isLPRResult(value: unknown): value is { data: [Record<string, unknown>, string] } {
  if (!isObject(value)) {
    return false;
  }

  const data = (value as { data?: unknown }).data;
  if (!isArray(data) || data.length !== 2) {
    return false;
  }

  return isObject(data[0]) && isString(data[1]);
}
