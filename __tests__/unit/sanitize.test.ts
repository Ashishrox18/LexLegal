import { sanitizeDocument, sanitizeQuestion } from '@/lib/sanitize';

describe('Document Sanitizer', () => {
  test('strips script tags from document text', () => {
    const input = 'Hello <script>alert("hack")</script> World';
    const output = sanitizeDocument(input);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('alert');
  });

  test('strips HTML tags but preserves text content', () => {
    const input = '<div><h1>Title</h1><p>Paragraph text</p></div>';
    const output = sanitizeDocument(input);
    expect(output).not.toContain('<div>');
    expect(output).not.toContain('<h1>');
    expect(output).toContain('Title');
    expect(output).toContain('Paragraph text');
  });

  test('removes null bytes', () => {
    const input = 'Hello\0World';
    const output = sanitizeDocument(input);
    expect(output).toBe('HelloWorld');
  });

  test('truncates text at 50000 characters', () => {
    const longInput = 'a'.repeat(60000);
    const output = sanitizeDocument(longInput);
    expect(output.length).toBe(50000);
  });

  test('trims whitespace and normalizes multiple blank lines', () => {
    const input = '   Line 1\n\n\n\nLine 2   ';
    const output = sanitizeDocument(input);
    expect(output).toBe('Line 1\n\nLine 2');
  });

  test('sanitizeQuestion strips HTML tags and quotes', () => {
    const input = 'What is <script>alert(1)</script> "clause 4"?';
    const output = sanitizeQuestion(input);
    expect(output).not.toContain('<');
    expect(output).not.toContain('"');
    expect(output).toBe('What is alert(1) clause 4?');
  });
});
