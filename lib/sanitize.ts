export function sanitizeDocument(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove scripts
    .replace(/<[^>]*>/g, ' ')    // strip HTML tags
    .replace(/[<>]/g, '')        // remove angle brackets
    .replace(/\0/g, '')          // remove null bytes
    .replace(/\s{3,}/g, '\n\n') // normalize whitespace
    .trim()
    .slice(0, 50000);            // hard limit
}

export function sanitizeQuestion(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}
