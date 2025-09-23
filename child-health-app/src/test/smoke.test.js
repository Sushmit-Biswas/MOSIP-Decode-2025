import { describe, it, expect } from 'vitest';

describe('Application smoke tests', () => {
  it('should have basic math working', () => {
    expect(2 + 2).toBe(4);
  });

  it('should import React without errors', async () => {
    const React = await import('react');
    expect(React).toBeDefined();
    expect(React.createElement).toBeDefined();
  });

  it('should have environment variables available', () => {
    expect(import.meta.env).toBeDefined();
  });
});