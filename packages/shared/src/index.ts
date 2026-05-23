export function createRequestId(): string {
  return crypto.randomUUID();
}

export function utcNow(): Date {
  return new Date();
}
