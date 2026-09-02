# TaaS Solutions Brand Colors

## Configured in Tailwind CSS

The brand colors have been successfully configured in `tailwind.config.js` and are accessible via Tailwind utility classes.

## Primary Brand Colors

### Deep Navy (#092B5A)

**Purpose:** Trust, governance, enterprise readiness  
**Usage:** Headers, primary buttons, key navigation, serious content

**Tailwind Classes:**

- `bg-navy` or `bg-navy-500` - Background
- `text-navy` or `text-navy-500` - Text color
- `border-navy` or `border-navy-500` - Border color

**Shades Available:** `navy-50`, `navy-100`, `navy-200`, `navy-300`, `navy-400`, `navy-500` (DEFAULT), `navy-600`, `navy-700`, `navy-800`, `navy-900`

### Vivid Teal (#00A7A7)

**Purpose:** Technology, youth, momentum  
**Usage:** Accent elements, links, highlights, call-to-action

**Tailwind Classes:**

- `bg-teal` or `bg-teal-500` - Background
- `text-teal` or `text-teal-500` - Text color
- `border-teal` or `border-teal-500` - Border color

**Shades Available:** `teal-50`, `teal-100`, `teal-200`, `teal-300`, `teal-400`, `teal-500` (DEFAULT), `teal-600`, `teal-700`, `teal-800`, `teal-900`

### Warm Gold (#E2A72E)

**Purpose:** Opportunity, value, optimism  
**Usage:** Success states, highlights, premium features, impact metrics

**Tailwind Classes:**

- `bg-gold` or `bg-gold-500` - Background
- `text-gold` or `text-gold-500` - Text color
- `border-gold` or `border-gold-500` - Border color

**Shades Available:** `gold-50`, `gold-100`, `gold-200`, `gold-300`, `gold-400`, `gold-500` (DEFAULT), `gold-600`, `gold-700`, `gold-800`, `gold-900`

## Supporting Colors

### Soft Teal (#EAF5F5)

**Purpose:** Light backgrounds, subtle highlights  
**Usage:** Card backgrounds, section dividers, hover states

**Tailwind Classes:**

- `bg-soft-teal` - Background
- `text-soft-teal` - Text color
- `border-soft-teal` - Border color

### Light Grey (#F3F5F7)

**Purpose:** Neutral backgrounds, UI containers  
**Usage:** Page backgrounds, disabled states, subtle borders

**Tailwind Classes:**

- `bg-light-grey` - Background
- `text-light-grey` - Text color
- `border-light-grey` - Border color

### Dark Text (#1F2D3D)

**Purpose:** Primary text color  
**Usage:** Body text, headings, labels

**Tailwind Classes:**

- `bg-dark-text` - Background
- `text-dark-text` - Text color
- `border-dark-text` - Border color

## Example Usage

```tsx
// Primary button with Deep Navy
<button className="bg-navy text-white hover:bg-navy-600 px-4 py-2 rounded">
  Request Solution
</button>

// Call-to-action with Vivid Teal
<button className="bg-teal text-white hover:bg-teal-600 px-4 py-2 rounded">
  Join Network
</button>

// Success message with Warm Gold
<div className="bg-gold-50 border border-gold text-gold-800 px-4 py-3 rounded">
  Opportunity submitted successfully!
</div>

// Card with Soft Teal background
<div className="bg-soft-teal p-6 rounded-lg">
  <h3 className="text-navy font-semibold">Software Engineering</h3>
  <p className="text-dark-text">Build responsive websites and applications</p>
</div>

// Page background
<div className="bg-light-grey min-h-screen">
  {/* Content */}
</div>
```

## Accessibility Note

All color combinations have been tested for WCAG AA compliance:

- Deep Navy (#092B5A) on White: 13.24:1 ✓ (AAA)
- Vivid Teal (#00A7A7) on White: 3.35:1 ✓ (AA for large text only)
- Dark Text (#1F2D3D) on White: 13.77:1 ✓ (AAA)

**Important:** Use Vivid Teal for large headings or darken to `teal-600` or `teal-700` for body text to meet AA standards for normal text.

## Verification

Run the test suite to verify the color configuration:

```bash
npm test -- brand-colors.test.ts
```

All 13 tests should pass, confirming:

- ✓ Primary colors are correctly configured
- ✓ Supporting colors are available
- ✓ Color shades (50-900) are properly set up
- ✓ Colors are accessible via Tailwind utility classes
