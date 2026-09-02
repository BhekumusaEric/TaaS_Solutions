import { describe, it, expect } from 'vitest';

// Import the Tailwind config directly
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindConfig = require('../../tailwind.config.js');

describe('Brand Colors Configuration', () => {
  const colors = tailwindConfig.theme.extend.colors;

  describe('Primary Brand Colors', () => {
    it('should have Deep Navy (#092B5A) configured as navy', () => {
      expect(colors.navy).toBeDefined();
      expect(colors.navy.DEFAULT).toBe('#092B5A');
      expect(colors.navy['500']).toBe('#092B5A');
    });

    it('should have Vivid Teal (#00A7A7) configured as teal', () => {
      expect(colors.teal).toBeDefined();
      expect(colors.teal.DEFAULT).toBe('#00A7A7');
      expect(colors.teal['500']).toBe('#00A7A7');
    });

    it('should have Warm Gold (#E2A72E) configured as gold', () => {
      expect(colors.gold).toBeDefined();
      expect(colors.gold.DEFAULT).toBe('#E2A72E');
      expect(colors.gold['500']).toBe('#E2A72E');
    });
  });

  describe('Supporting Brand Colors', () => {
    it('should have Soft Teal (#EAF5F5) configured', () => {
      expect(colors['soft-teal']).toBe('#EAF5F5');
    });

    it('should have Light Grey (#F3F5F7) configured', () => {
      expect(colors['light-grey']).toBe('#F3F5F7');
    });

    it('should have Dark Text (#1F2D3D) configured', () => {
      expect(colors['dark-text']).toBe('#1F2D3D');
    });
  });

  describe('Color Shades', () => {
    it('should have navy color shades (50-900)', () => {
      expect(colors.navy['50']).toBe('#E8ECF2');
      expect(colors.navy['100']).toBe('#D1D9E5');
      expect(colors.navy['900']).toBe('#020912');
    });

    it('should have teal color shades (50-900)', () => {
      expect(colors.teal['50']).toBe('#E6F7F7');
      expect(colors.teal['100']).toBe('#CCEFEF');
      expect(colors.teal['900']).toBe('#002121');
    });

    it('should have gold color shades (50-900)', () => {
      expect(colors.gold['50']).toBe('#FDF6E9');
      expect(colors.gold['100']).toBe('#FBEDD3');
      expect(colors.gold['900']).toBe('#2E2109');
    });
  });

  describe('Tailwind Utility Classes Availability', () => {
    it('should make colors accessible via Tailwind utility classes', () => {
      // The colors should be accessible as:
      // - bg-navy, text-navy, border-navy
      // - bg-teal, text-teal, border-teal
      // - bg-gold, text-gold, border-gold
      // - bg-navy-500, text-navy-500 (etc. for shades)

      expect(colors.navy.DEFAULT).toBeDefined();
      expect(colors.teal.DEFAULT).toBeDefined();
      expect(colors.gold.DEFAULT).toBeDefined();
    });
  });

  describe('Brand Color Purpose (Documentation)', () => {
    it('should document Deep Navy purpose: Trust, governance, enterprise readiness', () => {
      // Deep Navy (#092B5A): Used for headers, primary buttons, key navigation, serious content
      expect(colors.navy.DEFAULT).toBe('#092B5A');
    });

    it('should document Vivid Teal purpose: Technology, youth, momentum', () => {
      // Vivid Teal (#00A7A7): Used for accent elements, links, highlights, call-to-action
      expect(colors.teal.DEFAULT).toBe('#00A7A7');
    });

    it('should document Warm Gold purpose: Opportunity, value, optimism', () => {
      // Warm Gold (#E2A72E): Used for success states, highlights, premium features, impact metrics
      expect(colors.gold.DEFAULT).toBe('#E2A72E');
    });
  });
});
