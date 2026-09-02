# Structure Steering: TaaS Solutions

## Project Folder Structure

```
TaaS_Solutions/
├── .git/                              # Version control
├── .github/                           # GitHub Actions
│   └── workflows/
│       ├── ci.yml                     # Continuous integration
│       └── deploy.yml                 # Deployment pipeline
├── .kiro/                             # Kiro configuration
│   ├── hooks/                         # Agent hooks
│   ├── specs/                         # Specifications
│   │   ├── 01-platform-foundation/
│   │   ├── 02-public-experience/
│   │   └── ...
│   └── steering/                      # Steering files
│       ├── product.md
│       ├── brand.md
│       ├── tech.md
│       ├── structure.md
│       ├── security.md
│       ├── accessibility.md
│       ├── testing.md
│       └── domain-language.md
├── docs/                              # Documentation
│   ├── architecture/                  # ADRs, diagrams
│   │   ├── decisions/                 # Architecture Decision Records
│   │   └── diagrams/                  # Mermaid or image files
│   ├── business/                      # Business documentation
│   ├── design/                        # Design specifications
│   ├── operations/                    # Runbooks, procedures
│   └── legal/                         # Legal templates
├── prisma/                            # Database
│   ├── schema.prisma                  # Schema definition
│   ├── migrations/                    # Database migrations
│   └── seed.ts                        # Demo data seed script
├── public/                            # Static assets
│   ├── branding/                      # Logo, brand assets
│   │   └── logo.svg
│   ├── icons/                         # Favicons, PWA icons
│   │   ├── favicon.ico
│   │   └── icon-*.png
│   └── images/                        # Public images
├── src/                               # Source code
│   ├── app/                           # Next.js App Router
│   │   ├── (public)/                  # Public routes (no auth)
│   │   │   ├── page.tsx               # Homepage
│   │   │   ├── services/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (authenticated)/           # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── opportunities/
│   │   │   └── settings/
│   │   ├── (auth)/                    # Auth routes
│   │   │   ├── sign-in/
│   │   │   ├── sign-up/
│   │   │   └── reset-password/
│   │   ├── api/                       # API routes (if not using Server Actions)
│   │   ├── layout.tsx                 # Root layout
│   │   ├── error.tsx                  # Error boundary
│   │   └── not-found.tsx              # 404 page
│   ├── components/                    # React components
│   │   ├── ui/                        # Design system primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── forms/                     # Form components
│   │   │   ├── form-field.tsx
│   │   │   ├── form-error.tsx
│   │   │   └── ...
│   │   ├── tables/                    # Table components
│   │   │   ├── data-table.tsx
│   │   │   └── ...
│   │   ├── layouts/                   # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── footer.tsx
│   │   │   └── ...
│   │   └── shared/                    # Shared components
│   │       ├── loading.tsx
│   │       ├── empty-state.tsx
│   │       └── ...
│   ├── modules/                       # Bounded modules
│   │   ├── identity/                  # Identity & access module
│   │   │   ├── types.ts
│   │   │   ├── schema.ts
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   ├── permissions.ts
│   │   │   ├── utils.ts
│   │   │   └── tests/
│   │   ├── organisations/             # Organisations module
│   │   │   └── ...
│   │   ├── talent/                    # Talent profiles module
│   │   │   └── ...
│   │   ├── opportunities/             # Opportunities module
│   │   │   └── ...
│   │   ├── proposals/                 # Proposals module
│   │   │   └── ...
│   │   ├── projects/                  # Projects module
│   │   │   └── ...
│   │   ├── quality/                   # Quality module
│   │   │   └── ...
│   │   ├── commercial/                # Commercial module
│   │   │   └── ...
│   │   ├── experience/                # Experience module
│   │   │   └── ...
│   │   ├── audit/                     # Audit module
│   │   │   └── ...
│   │   └── notifications/             # Notifications module
│   │       └── ...
│   ├── lib/                           # Shared utilities
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── auth.ts                    # Auth utilities
│   │   ├── storage.ts                 # File storage utilities
│   │   ├── email.ts                   # Email utilities
│   │   ├── validation.ts              # Shared validation schemas
│   │   ├── errors.ts                  # Error classes
│   │   ├── logger.ts                  # Logging utility
│   │   └── utils.ts                   # General utilities
│   ├── types/                         # Shared TypeScript types
│   │   ├── index.ts                   # Exported types
│   │   └── api.ts                     # API types
│   ├── styles/                        # Global styles
│   │   └── globals.css                # Tailwind + custom CSS
│   └── tests/                         # Test utilities
│       ├── setup.ts                   # Test setup
│       ├── factories.ts               # Test data factories
│       └── helpers.ts                 # Test helpers
├── .env.example                       # Environment template
├── .env.local                         # Local environment (gitignored)
├── .eslintrc.json                     # ESLint configuration
├── .gitignore                         # Git ignore rules
├── .prettierrc                        # Prettier configuration
├── next.config.js                     # Next.js configuration
├── package.json                       # Dependencies
├── postcss.config.js                  # PostCSS configuration
├── tailwind.config.js                 # Tailwind configuration
├── tsconfig.json                      # TypeScript configuration
├── vitest.config.ts                   # Vitest configuration
└── README.md                          # Project documentation
```

## Module Structure

Each module in `src/modules/` follows a consistent internal structure:

```
module-name/
├── types.ts                           # TypeScript interfaces and types
├── schema.ts                          # Zod validation schemas
├── queries.ts                         # Database read operations
├── mutations.ts                       # Database write operations
├── permissions.ts                     # Authorization logic
├── utils.ts                           # Module-specific utilities
└── tests/                             # Module tests
    ├── queries.test.ts
    ├── mutations.test.ts
    └── permissions.test.ts
```

### Module Responsibilities

**identity/** – Authentication, users, roles, permissions, audit events
**organisations/** – Organisation management, membership
**talent/** – Talent profiles, skills, verification, progression
**opportunities/** – Client opportunities, discovery, triage
**proposals/** – Proposals, estimates, contracts
**projects/** – Projects, pods, milestones, deliverables
**quality/** – Quality reviews, acceptance records
**commercial/** – Invoices, payments, talent payouts
**experience/** – Experience records, competency evidence, impact
**audit/** – Audit event querying, compliance reporting
**notifications/** – Notification templates, email sending

## Naming Conventions

### Files and Folders

- **Folders:** kebab-case (`user-profile/`)
- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Types:** PascalCase (`UserProfile.ts`)
- **Tests:** Match source file + `.test.ts` (`queries.test.ts`)

### Code

- **Components:** PascalCase (`function UserCard() {}`)
- **Functions:** camelCase (`function getUserById() {}`)
- **Constants:** SCREAMING_SNAKE_CASE (`const MAX_FILE_SIZE = 10_000_000`)
- **Types/Interfaces:** PascalCase (`interface User {}`, `type Role = ...`)
- **Enums:** PascalCase with SCREAMING_SNAKE_CASE values
  ```typescript
  enum OpportunityStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
  }
  ```

### Database

- **Tables:** PascalCase singular (`User`, `Organisation`)
- **Columns:** camelCase (`firstName`, `createdAt`)
- **Relationships:** camelCase (`organisation`, `createdBy`)
- **Enums:** PascalCase (`OpportunityStatus`)

### Routes

- **Public routes:** lowercase with hyphens (`/request-solution`)
- **Authenticated routes:** lowercase with hyphens (`/my-projects`)
- **API routes:** lowercase with hyphens (`/api/opportunities`)
- **Dynamic segments:** `[id]` or `[slug]`

## Component Organization

### Component Structure

```typescript
// 1. Imports
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

// 3. Component
export function UserCard({ user, onEdit }: UserCardProps) {
  // Logic
  // JSX
}

// 4. Sub-components (if small and only used here)
function UserCardHeader() {
  // ...
}
```

### Component Categories

**UI Components (`components/ui/`):**

- Pure presentational components
- No business logic
- Reusable across modules
- Examples: Button, Card, Input, Modal

**Form Components (`components/forms/`):**

- Form-specific components
- Validation display
- Examples: FormField, FormError, FormLabel

**Layout Components (`components/layouts/`):**

- Page structure components
- Navigation
- Examples: Header, Sidebar, Footer, AppShell

**Shared Components (`components/shared/`):**

- Cross-cutting UI components
- Examples: LoadingSpinner, EmptyState, ErrorMessage

**Module Components:**

- Within module folders or in app routes
- Business logic specific to that domain
- Examples: OpportunityCard, ProjectTimeline

## Import Rules

### Import Order

1. External libraries (React, Next.js, etc.)
2. Internal modules (`@/modules/...`)
3. Components (`@/components/...`)
4. Utilities (`@/lib/...`)
5. Types (`@/types/...`)
6. Styles (if any)
7. Relative imports (`./`, `../`)

### Import Aliases

Use TypeScript path aliases defined in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/modules/*": ["./src/modules/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

### Import Examples

```typescript
// Good
import { Button } from '@/components/ui/button';
import { getUserById } from '@/modules/identity/queries';
import { db } from '@/lib/db';

// Avoid
import { Button } from '../../../components/ui/button';
```

## Module Boundaries

### Dependency Rules

**Allowed:**

- Module can import from `lib/` (shared utilities)
- Module can import from `types/` (shared types)
- Module can import specific exports from other modules (via public API)

**Not Allowed:**

- Module cannot import internal implementation from another module
- Module cannot create circular dependencies
- UI components cannot import from modules (use props/callbacks)

### Module Public API

Each module exports its public API through `index.ts`:

```typescript
// modules/identity/index.ts
export { getUserById, getUsersByRole } from './queries';
export { createUser, updateUser } from './mutations';
export { canViewUser, canEditUser } from './permissions';
export type { User, Role, Permission } from './types';
```

Other modules import from the public API:

```typescript
// Good
import { getUserById } from '@/modules/identity';

// Bad (bypassing public API)
import { getUserById } from '@/modules/identity/queries';
```

## Server/Client Boundaries

### Server Components (default in App Router)

- Fetch data directly
- Access database
- Use environment secrets
- Cannot use hooks or browser APIs

### Client Components (`'use client'`)

- Use React hooks (useState, useEffect, etc.)
- Access browser APIs
- Handle user interactions
- Cannot directly access database or secrets

### Server Actions

- Marked with `'use server'`
- Can be called from client components
- Server-side validation and authorization
- Return serializable data only

```typescript
// app/actions/create-opportunity.ts
'use server';

export async function createOpportunity(data: unknown) {
  // Validate
  const validated = schema.parse(data);

  // Authorize
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  // Create
  const opportunity = await db.opportunity.create({
    data: validated,
  });

  return opportunity;
}
```

## Configuration Files

### TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration (`.eslintrc.json`)

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### Prettier Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Test Organization

### Test Location

Tests live alongside the code they test:

```
modules/identity/
├── queries.ts
├── queries.test.ts           # Unit tests
├── mutations.ts
├── mutations.test.ts
└── permissions.test.ts
```

Integration tests for full workflows:

```
src/tests/
├── integration/
│   ├── opportunity-workflow.test.ts
│   └── talent-onboarding.test.ts
└── e2e/
    ├── client-journey.spec.ts
    └── talent-journey.spec.ts
```

### Test Naming

```typescript
// Describe the function/component being tested
describe('getUserById', () => {
  // Describe the scenario
  it('should return user when user exists', async () => {
    // Test implementation
  });

  it('should return null when user does not exist', async () => {
    // Test implementation
  });

  it('should throw when user lacks permission', async () => {
    // Test implementation
  });
});
```

## Documentation Placement

### Code Documentation

- **Inline comments:** Explain complex logic
- **JSDoc:** For public APIs (not mandatory for MVP)
- **Type annotations:** Self-documenting code

### Architecture Documentation

**Location:** `docs/architecture/`

- **ADRs:** `docs/architecture/decisions/`
- **Diagrams:** `docs/architecture/diagrams/`
- **Overview:** `docs/architecture/README.md`

### Business Documentation

**Location:** `docs/business/`

- Vision, mission, value proposition
- User personas
- Business rules
- BRS, FRS

### Operations Documentation

**Location:** `docs/operations/`

- Deployment procedures
- Runbooks
- Incident response
- Backup/recovery procedures

## Environment Files

### .env.example (committed)

Template with placeholder values:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/taas_dev
AUTH_SECRET=your-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### .env.local (gitignored)

Actual local values (never commit):

```bash
DATABASE_URL=postgresql://...real-connection-string
AUTH_SECRET=...real-secret
```

### .env.production (secure storage)

Production values (never in git):

```bash
DATABASE_URL=...production-db
AUTH_SECRET=...production-secret
```

## Build Artifacts

### Gitignored Folders

```
node_modules/
.next/
.vercel/
dist/
build/
.env.local
.env.*.local
```

### Build Output

- **Next.js:** `.next/` folder
- **TypeScript:** Type declarations in `.next/types/`
- **Tests:** Coverage reports in `coverage/`

## Code Style Guidelines

### TypeScript

- Use `const` over `let` where possible
- Avoid `any` (use `unknown` if truly dynamic)
- Prefer interfaces for object shapes
- Prefer type for unions/intersections
- Use optional chaining (`user?.name`)
- Use nullish coalescing (`value ?? default`)

### React

- Prefer function components
- Use hooks (not class components)
- Extract complex logic to custom hooks
- Keep components small and focused
- Avoid prop drilling (use context for deep trees)

### Async/Await

- Prefer async/await over .then()
- Use try/catch for error handling
- Avoid unhandled promise rejections

### Formatting

- Prettier handles formatting
- Run on save or pre-commit
- Consistent across team

## Folder Constraints

### Do Not Create

- `utils/` at root (use `lib/`)
- `helpers/` (use `lib/` or module-specific)
- `common/` (be specific: `shared/`, `lib/`)
- Deep nesting (keep hierarchy shallow where possible)

### Keep Flat Where Possible

- `components/ui/` – All UI components here (not nested folders)
- `modules/` – One level of modules (not sub-modules)

## Shared Utilities

### lib/ Contents

**db.ts** – Prisma client singleton
**auth.ts** – Authentication helpers (getSession, requireAuth)
**storage.ts** – File upload/download utilities
**email.ts** – Email sending utilities
**validation.ts** – Shared Zod schemas
**errors.ts** – Custom error classes
**logger.ts** – Structured logging
**utils.ts** – General utilities (formatDate, generateId, etc.)

### When to Create a New lib/ File

- When utility is used across multiple modules
- When utility has no business logic (pure function)
- When utility abstracts third-party library (db, storage, email)

### When to Keep in Module

- When utility is specific to one module
- When utility contains business logic

## Migration Strategy

When restructuring existing code:

1. Create new structure
2. Move files incrementally
3. Update imports
4. Run tests after each move
5. Commit after successful move
6. Delete old structure when empty

## Review Checklist

Before committing code:

- [ ] Files follow naming conventions
- [ ] Imports use aliases (`@/...`)
- [ ] No circular dependencies
- [ ] Module boundaries respected
- [ ] Server/client boundaries clear
- [ ] Tests in correct location
- [ ] Linting passes
- [ ] Type checking passes
- [ ] No secrets committed
- [ ] Documentation updated if needed
