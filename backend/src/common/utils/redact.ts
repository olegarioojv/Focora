const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'creditcard',
  'cardnumber',
  'cvv',
];

// Shallow+recursive redaction of anything that looks like a credential,
// so error payloads can be stored for debugging without ever writing a
// password/token to the database in plain text.
export function redactPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactPayload);

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = SENSITIVE_KEYS.includes(key.toLowerCase())
        ? '[REDACTED]'
        : redactPayload(val);
    }
    return result;
  }

  return value;
}
