import { existsSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('Vite build', () => {
  it('produces dist/index.html', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });
});
