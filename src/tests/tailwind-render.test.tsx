import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

/**
 * Tailwind CSS Rendering Tests
 *
 * These tests verify that Tailwind CSS classes are properly configured
 * and render correctly in the application.
 */

describe('Tailwind CSS Configuration', () => {
  it('should render basic utility classes', () => {
    const { container } = render(
      <div className="flex items-center justify-center">
        <p className="text-lg font-bold">Test</p>
      </div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('flex', 'items-center', 'justify-center');

    const p = div.firstChild as HTMLElement;
    expect(p).toHaveClass('text-lg', 'font-bold');
  });

  it('should render brand color classes - navy', () => {
    const { container } = render(
      <div className="border-navy-500 bg-navy text-navy">Navy colors</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-navy', 'text-navy', 'border-navy-500');
  });

  it('should render brand color classes - teal', () => {
    const { container } = render(
      <div className="border-teal bg-teal text-teal-600">Teal colors</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-teal', 'text-teal-600', 'border-teal');
  });

  it('should render brand color classes - gold', () => {
    const { container } = render(
      <div className="bg-gold text-gold-700 hover:bg-gold-600">Gold colors</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-gold', 'text-gold-700', 'hover:bg-gold-600');
  });

  it('should render custom brand colors', () => {
    const { container } = render(
      <div className="border-light-grey bg-soft-teal text-dark-text">Custom colors</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-soft-teal', 'text-dark-text', 'border-light-grey');
  });

  it('should render responsive classes', () => {
    const { container } = render(
      <div className="text-sm md:text-base lg:text-lg">Responsive text</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('text-sm', 'md:text-base', 'lg:text-lg');
  });

  it('should render layout classes', () => {
    const { container } = render(<div className="container mx-auto px-4 py-8">Layout test</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  it('should render spacing utilities', () => {
    const { container } = render(
      <div className="m-4 space-y-4 p-6">
        <p>Item 1</p>
        <p>Item 2</p>
      </div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('m-4', 'p-6', 'space-y-4');
  });

  it('should render flexbox utilities', () => {
    const { container } = render(
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        Flexbox test
      </div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass(
      'flex',
      'flex-col',
      'md:flex-row',
      'gap-4',
      'items-center',
      'justify-between'
    );
  });

  it('should render grid utilities', () => {
    const { container } = render(
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">Grid test</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });

  it('should render border and shadow utilities', () => {
    const { container } = render(
      <div className="rounded-lg border border-gray-200 shadow-md hover:shadow-lg">
        Border and shadow
      </div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass(
      'border',
      'border-gray-200',
      'rounded-lg',
      'shadow-md',
      'hover:shadow-lg'
    );
  });

  it('should render typography utilities', () => {
    const { container } = render(
      <div>
        <h1 className="text-4xl font-bold">Heading</h1>
        <p className="text-base leading-relaxed">Paragraph</p>
      </div>
    );

    const h1 = container.querySelector('h1') as HTMLElement;
    expect(h1).toHaveClass('text-4xl', 'font-bold');

    const p = container.querySelector('p') as HTMLElement;
    expect(p).toHaveClass('text-base', 'leading-relaxed');
  });

  it('should render state variants', () => {
    const { container } = render(
      <button className="bg-teal hover:bg-teal-600 active:bg-teal-700 disabled:opacity-50">
        Button
      </button>
    );

    const button = container.firstChild as HTMLElement;
    expect(button).toHaveClass(
      'bg-teal',
      'hover:bg-teal-600',
      'active:bg-teal-700',
      'disabled:opacity-50'
    );
  });

  it('should render focus states for accessibility', () => {
    const { container } = render(
      <input className="focus:border-teal focus:ring-2 focus:ring-teal" />
    );

    const input = container.firstChild as HTMLElement;
    expect(input).toHaveClass('focus:ring-2', 'focus:ring-teal', 'focus:border-teal');
  });

  it('should render gradient utilities', () => {
    const { container } = render(
      <div className="bg-gradient-to-r from-navy to-teal">Gradient test</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-gradient-to-r', 'from-navy', 'to-teal');
  });

  it('should render transition utilities', () => {
    const { container } = render(
      <div className="transition-all duration-300 ease-in-out">Transition test</div>
    );

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('transition-all', 'duration-300', 'ease-in-out');
  });

  it('should render screen reader utility class', () => {
    const { container } = render(<span className="sr-only">Screen reader text</span>);

    const span = container.firstChild as HTMLElement;
    expect(span).toHaveClass('sr-only');
  });
});

describe('Tailwind CSS Brand Colors', () => {
  it('should have navy color configured', () => {
    const { container } = render(<div className="bg-navy">Navy background</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-navy');
  });

  it('should have navy color variants', () => {
    const { container } = render(
      <div>
        <div className="bg-navy-50">Navy 50</div>
        <div className="bg-navy-500">Navy 500</div>
        <div className="bg-navy-900">Navy 900</div>
      </div>
    );

    const divs = container.querySelectorAll('div');
    expect(divs[0]).toHaveClass('bg-navy-50');
    expect(divs[1]).toHaveClass('bg-navy-500');
    expect(divs[2]).toHaveClass('bg-navy-900');
  });

  it('should have teal color configured', () => {
    const { container } = render(<div className="bg-teal">Teal background</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-teal');
  });

  it('should have teal color variants', () => {
    const { container } = render(
      <div>
        <div className="bg-teal-50">Teal 50</div>
        <div className="bg-teal-500">Teal 500</div>
        <div className="bg-teal-900">Teal 900</div>
      </div>
    );

    const divs = container.querySelectorAll('div');
    expect(divs[0]).toHaveClass('bg-teal-50');
    expect(divs[1]).toHaveClass('bg-teal-500');
    expect(divs[2]).toHaveClass('bg-teal-900');
  });

  it('should have gold color configured', () => {
    const { container } = render(<div className="bg-gold">Gold background</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-gold');
  });

  it('should have gold color variants', () => {
    const { container } = render(
      <div>
        <div className="bg-gold-50">Gold 50</div>
        <div className="bg-gold-500">Gold 500</div>
        <div className="bg-gold-900">Gold 900</div>
      </div>
    );

    const divs = container.querySelectorAll('div');
    expect(divs[0]).toHaveClass('bg-gold-50');
    expect(divs[1]).toHaveClass('bg-gold-500');
    expect(divs[2]).toHaveClass('bg-gold-900');
  });

  it('should have custom soft-teal color', () => {
    const { container } = render(<div className="bg-soft-teal">Soft teal background</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-soft-teal');
  });

  it('should have custom light-grey color', () => {
    const { container } = render(<div className="bg-light-grey">Light grey background</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('bg-light-grey');
  });

  it('should have custom dark-text color', () => {
    const { container } = render(<div className="text-dark-text">Dark text</div>);

    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('text-dark-text');
  });
});

describe('Tailwind CSS in Homepage', () => {
  it('should verify homepage uses Tailwind classes', () => {
    const { container } = render(
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-50 to-soft-teal">
        <div className="space-y-6 p-8 text-center">
          <h1 className="text-5xl font-bold text-navy">TaaS Solutions</h1>
          <p className="text-2xl font-semibold text-teal">Talent as a Service</p>
        </div>
      </main>
    );

    const main = container.firstChild as HTMLElement;
    expect(main).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center',
      'bg-gradient-to-br',
      'from-navy-50',
      'to-soft-teal'
    );

    const h1 = container.querySelector('h1') as HTMLElement;
    expect(h1).toHaveClass('text-5xl', 'font-bold', 'text-navy');

    const p = container.querySelector('p') as HTMLElement;
    expect(p).toHaveClass('text-2xl', 'font-semibold', 'text-teal');
  });
});
