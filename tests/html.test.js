import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('HTML setup', () => {
  const html = readFileSync('index.html', 'utf8');

  it('loads app.js as module', () => {
    expect(html).toMatch('<script type="module" src="/app.js"></script>');
  });
});
