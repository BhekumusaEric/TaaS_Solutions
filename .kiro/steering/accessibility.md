# Accessibility Steering: TaaS Solutions

## Accessibility Commitment

TaaS Solutions is committed to creating an accessible platform that enables all users, regardless of ability, to:

- Discover services
- Submit opportunities
- Apply for talent positions
- Participate in project delivery
- Access professional progression

## Accessibility Target

**Target:** WCAG 2.1 Level AA compliance

**Rationale:**

- Legal requirement in many jurisdictions
- Social responsibility
- Better usability for all users
- Future-proofing for WCAG 2.2 and beyond

## Core Principles

### 1. Perceivable

Information and user interface components must be presentable to users in ways they can perceive.

### 2. Operable

User interface components and navigation must be operable.

### 3. Understandable

Information and the operation of the user interface must be understandable.

### 4. Robust

Content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies.

## Semantic HTML

### Use Proper HTML Elements

```tsx
// GOOD: Semantic HTML
<button onClick={handleClick}>Submit</button>
<nav>...</nav>
<header>...</header>
<main>...</main>
<footer>...</footer>

// BAD: Non-semantic elements for interactive content
<div onClick={handleClick}>Submit</div>
```

### Heading Hierarchy

Maintain logical heading structure (H1 → H2 → H3, no skipping levels).

```tsx
// GOOD
<h1>Dashboard</h1>
<h2>Recent Projects</h2>
<h3>Project Alpha</h3>
<h3>Project Beta</h3>
<h2>Upcoming Deadlines</h2>

// BAD (skips H2)
<h1>Dashboard</h1>
<h3>Recent Projects</h3>
```

**Rule:** One H1 per page (page title).

### Landmark Regions

Use HTML5 landmark elements or ARIA roles:

```tsx
<header>       {/* role="banner" */}
<nav>          {/* role="navigation" */}
<main>         {/* role="main" */}
<aside>        {/* role="complementary" */}
<footer>       {/* role="contentinfo" */}
<section>      {/* role="region" with aria-label */}
```

**Benefit:** Screen reader users can navigate by landmarks.

## Keyboard Navigation

### All Interactive Elements Must Be Keyboard Accessible

- **Tab:** Move to next focusable element
- **Shift + Tab:** Move to previous focusable element
- **Enter/Space:** Activate buttons, links
- **Arrow Keys:** Navigate within components (menus, tabs, radio groups)
- **Escape:** Close modals, dropdowns

### Focus Management

```tsx
// Auto-focus first input in modal
useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);

// Return focus when modal closes
const previousFocus = useRef<HTMLElement | null>(null);

function openModal() {
  previousFocus.current = document.activeElement as HTMLElement;
  setIsOpen(true);
}

function closeModal() {
  setIsOpen(false);
  previousFocus.current?.focus();
}
```

### Focus Indicators

**Required:** Visible focus indicators on all interactive elements.

```css
/* Default browser outline is acceptable */
button:focus-visible {
  outline: 2px solid #00a7a7; /* Brand teal */
  outline-offset: 2px;
}

/* Never remove outline without replacement */
/* BAD */
button:focus {
  outline: none; /* Never do this alone */
}

/* GOOD */
button:focus-visible {
  outline: 2px solid #00a7a7;
  outline-offset: 2px;
}
```

### Tab Order

Logical tab order (left-to-right, top-to-bottom in most layouts).

**Avoid:**

- `tabindex` values greater than 0 (creates unpredictable tab order)
- Removing elements from tab order (`tabindex="-1"`) unless intentional (e.g., programmatically focused elements)

### Skip Links

Provide skip link to main content:

```tsx
// First focusable element on page
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

// Main content
<main id="main-content">
  {/* Page content */}
</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

## Screen Reader Support

### Alternative Text

**Images:**

```tsx
// Decorative image
<img src="decoration.png" alt="" />

// Informative image
<img src="logo.png" alt="TaaS Solutions" />

// Functional image (button/link)
<button>
  <img src="trash.svg" alt="Delete opportunity" />
</button>
```

**Icon buttons:**

```tsx
// Use aria-label for icon-only buttons
<button aria-label="Close modal">
  <XIcon />
</button>

// Or use visually-hidden text
<button>
  <XIcon />
  <span className="sr-only">Close modal</span>
</button>
```

### ARIA Labels

```tsx
// Form fields with aria-label (when visual label not possible)
<input
  type="search"
  aria-label="Search projects"
  placeholder="Search..."
/>

// Navigation with aria-label
<nav aria-label="Main navigation">
  {/* Links */}
</nav>

<nav aria-label="Breadcrumb">
  {/* Breadcrumb links */}
</nav>
```

### ARIA Descriptions

```tsx
// Additional context for form fields
<label htmlFor="password">Password</label>
<input
  id="password"
  type="password"
  aria-describedby="password-requirements"
/>
<div id="password-requirements">
  Must be at least 12 characters with uppercase, lowercase, and numbers.
</div>
```

### Live Regions

Announce dynamic content changes:

```tsx
// Status messages
<div role="status" aria-live="polite">
  Project created successfully
</div>

// Urgent alerts
<div role="alert" aria-live="assertive">
  Connection lost. Reconnecting...
</div>
```

### Visually Hidden Text

Text visible only to screen readers:

```tsx
// Utility class
<span className="sr-only">Loading...</span>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Forms

### Labels

**Every input must have an associated label.**

```tsx
// GOOD: Explicit label association
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// GOOD: Implicit label association
<label>
  Email
  <input type="email" name="email" />
</label>

// BAD: No label
<input type="email" placeholder="Email" /> {/* Placeholder is not a label */}
```

### Required Fields

```tsx
<label htmlFor="title">
  Opportunity Title
  <span aria-label="required">*</span>
</label>
<input
  id="title"
  type="text"
  required
  aria-required="true"
/>
```

### Error Messages

**Errors must be programmatically associated with fields.**

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <div id="email-error" role="alert">
    {errors.email.message}
  </div>
)}
```

### Fieldsets and Legends

Group related form fields:

```tsx
<fieldset>
  <legend>Contact Information</legend>
  <label htmlFor="email">Email</label>
  <input id="email" type="email" />

  <label htmlFor="phone">Phone</label>
  <input id="phone" type="tel" />
</fieldset>
```

### Accessible Radio/Checkbox Groups

```tsx
<fieldset>
  <legend>Select service type</legend>
  <label>
    <input type="radio" name="service" value="software" />
    Software Engineering
  </label>
  <label>
    <input type="radio" name="service" value="ai" />
    Artificial Intelligence
  </label>
</fieldset>
```

## Color and Contrast

### Contrast Ratios

**WCAG AA Requirements:**

- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- UI components and graphics: 3:1 minimum

**Check contrast:**

- Use browser DevTools (Chrome Lighthouse, Firefox Accessibility Inspector)
- Use online tools (WebAIM Contrast Checker, Contrast Ratio)

### Brand Colors Contrast Check

```css
/* Deep Navy #092B5A on White #FFFFFF */
/* Ratio: 13.24:1 ✓ (Passes AAA) */

/* Vivid Teal #00A7A7 on White #FFFFFF */
/* Ratio: 3.35:1 ✓ (Passes AA for large text) */
/* Ratio: 3.35:1 ✗ (Fails AA for normal text) */
/* Use for large headings only, or darken for body text */

/* Dark Text #1F2D3D on White #FFFFFF */
/* Ratio: 13.77:1 ✓ (Passes AAA) */
```

### Color Alone

**Do not use color as the only means of conveying information.**

```tsx
// BAD: Color only
<div className="text-red-500">Error</div>
<div className="text-green-500">Success</div>

// GOOD: Icon + Color + Text
<div className="text-red-500">
  <XCircleIcon /> Error: Invalid email format
</div>
<div className="text-green-500">
  <CheckCircleIcon /> Success: Opportunity submitted
</div>
```

## Interactive Components

### Buttons

```tsx
// Accessible button
<button
  type="button"
  onClick={handleClick}
  disabled={isLoading}
  aria-busy={isLoading}
  aria-label={isLoading ? 'Submitting...' : 'Submit opportunity'}
>
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

### Links

```tsx
// Link purpose clear from text
<a href="/projects/123">View Project Details</a>

// Link purpose requires context
<a href="/projects/123" aria-label="View Project Alpha details">
  View Details
</a>
```

### Modals/Dialogs

```tsx
<Dialog
  open={isOpen}
  onOpenChange={setIsOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <DialogTitle id="dialog-title">Delete Opportunity</DialogTitle>
  <DialogDescription id="dialog-description">
    Are you sure you want to delete this opportunity? This action cannot be undone.
  </DialogDescription>

  <DialogClose>
    <button>Cancel</button>
    <button>Delete</button>
  </DialogClose>
</Dialog>
```

**Requirements:**

- Focus trap (Tab cycles within modal)
- Focus first element on open
- Return focus on close
- Close on Escape
- Prevent background scrolling

### Dropdowns/Menus

Use ARIA menu pattern or accessible component library (Radix UI, Headless UI).

```tsx
<DropdownMenu>
  <DropdownMenuTrigger aria-haspopup="true" aria-expanded={isOpen}>
    Options
  </DropdownMenuTrigger>
  <DropdownMenuContent role="menu">
    <DropdownMenuItem role="menuitem">Edit</DropdownMenuItem>
    <DropdownMenuItem role="menuitem">Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tabs

```tsx
<Tabs defaultValue="details">
  <TabsList role="tablist">
    <TabsTrigger value="details" role="tab" aria-selected>
      Details
    </TabsTrigger>
    <TabsTrigger value="team" role="tab">
      Team
    </TabsTrigger>
  </TabsList>

  <TabsContent value="details" role="tabpanel">
    {/* Details content */}
  </TabsContent>
  <TabsContent value="team" role="tabpanel">
    {/* Team content */}
  </TabsContent>
</Tabs>
```

### Tooltips

```tsx
// Tooltip must not contain essential information
// (keyboard users may not be able to access it)

<Tooltip>
  <TooltipTrigger aria-describedby="tooltip-content">
    <InfoIcon />
  </TooltipTrigger>
  <TooltipContent id="tooltip-content" role="tooltip">
    Additional information about this field
  </TooltipContent>
</Tooltip>
```

## Tables

### Data Tables

```tsx
<table>
  <caption>Active Projects</caption>
  <thead>
    <tr>
      <th scope="col">Project Name</th>
      <th scope="col">Client</th>
      <th scope="col">Status</th>
      <th scope="col">Due Date</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Project Alpha</th>
      <td>Client A</td>
      <td>In Progress</td>
      <td>2026-10-01</td>
    </tr>
  </tbody>
</table>
```

**Requirements:**

- Use `<caption>` to describe table
- Use `<th scope="col">` for column headers
- Use `<th scope="row">` for row headers
- Complex tables may need `headers` attribute

## Motion and Animation

### Respect Reduced Motion

```css
/* Animations by default */
.fade-in {
  animation: fadeIn 300ms ease-in;
}

/* Disable animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .fade-in {
    animation: none;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Auto-Playing Content

**Avoid:**

- Auto-playing video with sound
- Infinite auto-advancing carousels

**If unavoidable:**

- Provide pause/stop control
- Maximum 5 seconds before pausing
- User can resume

## Loading States

### Loading Indicators

```tsx
// Visible loading indicator with screen reader text
<div role="status" aria-live="polite">
  <Spinner />
  <span className="sr-only">Loading projects...</span>
</div>
```

### Skeleton Screens

Provide visual feedback during loading:

```tsx
// Mark as aria-hidden (presentational)
<div aria-hidden="true">
  <SkeletonCard />
  <SkeletonCard />
</div>
<div role="status" aria-live="polite">
  <span className="sr-only">Loading projects...</span>
</div>
```

## Empty States

### Helpful Empty States

```tsx
<div role="status">
  <EmptyIcon aria-hidden="true" />
  <h2>No projects yet</h2>
  <p>Projects will appear here once you've been assigned to a Talent Pod.</p>
  <a href="/opportunities">Browse available opportunities</a>
</div>
```

## Responsive Design

### Mobile Accessibility

- **Touch targets:** Minimum 44×44 pixels (iOS) or 48×48 pixels (Android)
- **Text size:** Readable without zooming (minimum 16px)
- **Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1">`
- **Orientation:** Support both portrait and landscape

### Responsive Text

```css
/* Base size */
body {
  font-size: 16px;
}

/* Scale up on larger screens */
@media (min-width: 768px) {
  body {
    font-size: 18px;
  }
}

/* Never use fixed font sizes for body text */
```

## Language and Content

### Clear Language

- Use plain language
- Avoid jargon
- Expand acronyms on first use
- Short sentences and paragraphs

### Language Attribute

```html
<html lang="en"></html>
```

```tsx
// If content is in different language
<blockquote lang="af">Content in Afrikaans</blockquote>
```

### Page Titles

```tsx
// Unique, descriptive page titles
<title>Dashboard - TaaS Solutions</title>
<title>Project Alpha - TaaS Solutions</title>
<title>Submit Opportunity - TaaS Solutions</title>
```

## PDF and Document Accessibility

**For uploaded documents:**

- Encourage clients/talent to upload accessible PDFs
- Provide guidelines for accessible documents

**For generated documents:**

- Use semantic structure
- Include alt text for images
- Proper reading order
- Tagged PDFs

## Testing

### Automated Testing

**Tools:**

- Lighthouse (Chrome DevTools)
- axe DevTools (browser extension)
- Pa11y (CI integration)
- jest-axe (unit tests)

```tsx
// Example: jest-axe
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('Button has no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Manual Testing

**Required:**

- Keyboard navigation (no mouse)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Zoom to 200% (no content loss)
- Color contrast verification
- Reduced motion testing

### Screen Reader Testing

**Test with:**

- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (macOS, built-in)
- TalkBack (Android, built-in)
- VoiceOver (iOS, built-in)

**Minimum:** Test with one screen reader (NVDA or VoiceOver recommended).

### Browser Testing

Test in:

- Chrome
- Firefox
- Safari
- Edge

### Accessibility Checklist

Before shipping:

- [ ] Semantic HTML used
- [ ] Heading hierarchy logical (H1 → H2 → H3)
- [ ] All images have alt text (or alt="")
- [ ] All form fields have labels
- [ ] Required fields indicated
- [ ] Error messages associated with fields
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works (no mouse)
- [ ] No keyboard traps
- [ ] Skip link to main content
- [ ] Page has unique title
- [ ] Language attribute set
- [ ] Tables have captions and headers
- [ ] Modals trap focus and return focus on close
- [ ] Dropdowns/menus use ARIA correctly
- [ ] Live regions for dynamic content
- [ ] Loading states announced to screen readers
- [ ] Reduced motion respected
- [ ] Touch targets minimum 44×44px
- [ ] Automated tests pass (Lighthouse, axe)
- [ ] Manual screen reader test completed

## Resources

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- WebAIM: https://webaim.org/
- The A11Y Project: https://www.a11yproject.com/
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- Radix UI (accessible components): https://www.radix-ui.com/
- React ARIA (accessible hooks): https://react-spectrum.adobe.com/react-aria/

## Accessibility Statement

**Publish an accessibility statement:**

> TaaS Solutions is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
>
> **Conformance Status:** WCAG 2.1 Level AA (target)
>
> **Feedback:** If you encounter accessibility barriers, please contact us at [email].
>
> We aim to respond to accessibility feedback within 5 business days.

## When in Doubt

If you're unsure whether something is accessible:

1. Test with keyboard only
2. Test with screen reader
3. Check WCAG guidelines
4. Consult accessibility documentation (WebAIM, MDN)
5. Ask for review from accessibility expert
