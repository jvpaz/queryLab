export function handleQuote(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}