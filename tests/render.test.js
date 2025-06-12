import { describe, it, expect, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import Papa from 'papaparse';

describe('App render', () => {
  it('initializes without console warnings or errors', async () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const dom = new JSDOM(html, { url: 'http://localhost/' });
    global.window = dom.window;
    global.document = dom.window.document;
    global.Papa = Papa;
    const stubNode = {
      data: () => '',
      popperRef: () => ({ getBoundingClientRect: () => ({}) }),
      renderedPosition: () => ({ x: 0, y: 0 }),
      on: () => {}
    };
    const stubCy = {
      nodes: () => [stubNode],
      fit: () => {}
    };
    global.cytoscape = vi.fn(() => stubCy);
    global.tippy = () => ({ show: () => {}, hide: () => {} });
    global.fetch = vi.fn(async () => ({
      text: async () => fs.readFileSync('public/llw_system_analysis.csv', 'utf8')
    }));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await import('../app.js');
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
    await new Promise(r => setTimeout(r, 10));

    expect(errorSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
