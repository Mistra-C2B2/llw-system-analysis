import { readFileSync } from 'fs';
import Papa from 'papaparse';
import { describe, it, expect } from 'vitest';

describe('CSV data', () => {
  const csv = readFileSync('public/llw_system_analysis.csv', 'utf8');
  const rows = Papa.parse(csv, { header: true, skipEmptyLines: true }).data;

  it('parses at least one node', () => {
    const nodes = rows.filter(r => !r.source && !r.target);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('parses at least one edge', () => {
    const edges = rows.filter(r => r.source && r.target);
    expect(edges.length).toBeGreaterThan(0);
  });

  it('detects hierarchical nodes', () => {
    const child = rows.find(r => r.id && r.id.includes('.') && !r.source && !r.target);
    expect(child).toBeTruthy();
    const parentId = child.id.substring(0, child.id.lastIndexOf('.'));
    const parent = rows.find(r => r.id === parentId && !r.source && !r.target);
    expect(parent).toBeTruthy();
  });
});
