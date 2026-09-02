# Domain Language: TaaS Solutions

## Purpose

This document defines the **ubiquitous language** for the TaaS Solutions platform. Use these terms consistently across:

- Code (variable names, function names, database tables)
- User interfaces (labels, buttons, headings)
- Documentation (requirements, design, specifications)
- Communication (team discussions, client conversations)

**Consistency in language prevents confusion and reduces cognitive load.**

---

## Product and Business Terms

### TaaS Solutions

**Full Name:** Talent as a Service Solutions  
**Pronunciation:** "Tahs Solutions" (rhymes with "pass")  
**Usage:** Always capitalize as "TaaS Solutions" (not "Taas" or "TAAS")

**Context:** The company and platform name.

### Talent as a Service

**Definition:** The business model of delivering ICT solutions through managed teams of verified emerging professionals.

**Context:** Describes the core value proposition.

### Turning Skills into Income

**Definition:** The company tagline.

**Context:** Marketing and brand messaging.

---

## User Roles

### Public Visitor

**Definition:** An unauthenticated user browsing the public website.

**Usage in code:**

```typescript
role: 'PUBLIC_VISITOR'; // Not: guest, anonymous, visitor
```

### Talent Applicant

**Definition:** A registered user who has submitted a talent network application but is not yet verified.

**Usage in code:**

```typescript
role: 'TALENT_APPLICANT'; // Not: applicant, candidate, prospect
```

### Verified Talent

**Definition:** An approved professional who has completed verification and is available for Talent Pod assignments.

**Usage in code:**

```typescript
role: 'VERIFIED_TALENT'; // Not: talent, contributor, worker
```

**Context:** This is the preferred term. Do not use "freelancer," "contractor," or "gig worker."

### Client Member

**Definition:** A user who belongs to a client organisation and can submit opportunities and view projects.

**Usage in code:**

```typescript
role: 'CLIENT_MEMBER'; // Not: client_user, customer
```

### Client Approver

**Definition:** A client organisation member with authority to approve proposals, accept deliverables, and authorize payments.

**Usage in code:**

```typescript
role: 'CLIENT_APPROVER'; // Not: approver, decision_maker
```

### Delivery Lead

**Definition:** The accountable person for a specific Talent Pod and project delivery.

**Usage in code:**

```typescript
role: 'DELIVERY_LEAD'; // Not: project_manager, lead, team_lead
```

**Context:** There is one Delivery Lead per Pod. They coordinate work, manage risks, and ensure quality.

### Talent Operations Administrator

**Definition:** Internal TaaS staff member responsible for talent verification, onboarding, and progression.

**Usage in code:**

```typescript
role: 'TALENT_OPS_ADMIN'; // Not: talent_admin, recruiter
```

### Project Operations Administrator

**Definition:** Internal TaaS staff member responsible for opportunity qualification, proposal creation, and project mobilization.

**Usage in code:**

```typescript
role: 'PROJECT_OPS_ADMIN'; // Not: project_admin, ops_admin
```

### Quality Reviewer

**Definition:** Internal TaaS staff member responsible for internal quality assurance before client review.

**Usage in code:**

```typescript
role: 'QUALITY_REVIEWER'; // Not: qa, reviewer, quality_lead
```

### Finance Administrator

**Definition:** Internal TaaS staff member responsible for invoices, payment tracking, and talent payouts.

**Usage in code:**

```typescript
role: 'FINANCE_ADMIN'; // Not: accountant, finance_manager
```

### Platform Administrator

**Definition:** Internal TaaS staff member with system-wide configuration and support responsibilities.

**Usage in code:**

```typescript
role: 'PLATFORM_ADMIN'; // Not: admin, super_admin, system_admin
```

### Partner / Mentor

**Definition:** External ecosystem participant who refers talent, supports projects, or provides mentorship.

**Usage in code:**

```typescript
role: 'PARTNER'; // Not: affiliate, collaborator
```

---

## Core Business Concepts

### Opportunity

**Definition:** A client's business need that may become a project.

**Lifecycle:** Draft → Submitted → Triage → Discovery → Qualified → Proposal → Contracting → Won/Lost

**Usage in code:**

```typescript
model Opportunity { } // Not: Request, Lead, Inquiry
```

**Context:** Use "opportunity" (not "request" or "lead"). An opportunity represents a potential project before it is won.

### Discovery

**Definition:** The process of clarifying requirements, constraints, and acceptance criteria with the client.

**Usage in code:**

```typescript
model DiscoveryRecord { } // Not: RequirementsGathering, Analysis
```

**Context:** Discovery produces a DiscoveryRecord and informs the proposal.

### Proposal

**Definition:** A formal offer to the client including scope, deliverables, timeline, and cost.

**Lifecycle:** Draft → Internal Review → Client Review → Approved/Rejected/Revision Requested

**Usage in code:**

```typescript
model Proposal { } // Not: Quote, Estimate, Offer
```

**Context:** Proposals are versioned (ProposalVersion). When a proposal is revised, a new version is created.

### Contract

**Definition:** The executed legal agreement between TaaS Solutions and the client.

**Usage in code:**

```typescript
model Contract { } // Not: Agreement, Terms
```

### Talent Pod

**Definition:** A managed, multidisciplinary team assembled to deliver a specific project.

**Usage in code:**

```typescript
model Pod { } // Not: Team, Group, Squad
```

**Context:** The term "Talent Pod" emphasizes the temporary, purpose-built nature of the team. Always use "Pod" in code and "Talent Pod" in user-facing content.

### Pod Member

**Definition:** A Verified Talent assigned to a specific Talent Pod.

**Usage in code:**

```typescript
model PodMember { } // Not: TeamMember, Contributor
```

### Project

**Definition:** A contracted engagement to deliver defined business outcomes.

**Lifecycle:** Mobilising → Active → At Risk → On Hold → Client Acceptance → Closed → Support → Cancelled

**Usage in code:**

```typescript
model Project { } // Not: Engagement, Job, Task
```

**Context:** Projects are the result of won opportunities. A project is delivered by a Talent Pod.

### Milestone

**Definition:** A significant checkpoint in project delivery with defined deliverables and acceptance criteria.

**Lifecycle:** Planned → In Progress → Awaiting Review → Completed → Blocked → Cancelled

**Usage in code:**

```typescript
model Milestone { } // Not: Phase, Stage, Checkpoint
```

### Deliverable

**Definition:** A client-facing output (document, software, design, analysis, etc.) subject to acceptance.

**Lifecycle:** Draft → Internal Review → Rework → Client Review → Accepted → Rejected → Superseded

**Usage in code:**

```typescript
model Deliverable { } // Not: Artifact, Output, Work Product
```

**Context:** Deliverables go through internal quality review before client review.

### Work Item

**Definition:** A discrete unit of work tracked within a project (for internal coordination).

**Usage in code:**

```typescript
model WorkItem { } // Not: Task, Ticket, Issue
```

**Context:** Work Items are internal. Deliverables are client-facing.

### Quality Review

**Definition:** Internal assessment of a deliverable against acceptance criteria before submitting to the client.

**Usage in code:**

```typescript
model QualityReview { } // Not: QA, Review, Inspection
```

**Context:** Quality Review is performed by a Quality Reviewer (not the Delivery Lead or Pod Members who created the deliverable).

### Acceptance

**Definition:** The client's formal approval of a deliverable or project milestone.

**Usage in code:**

```typescript
model AcceptanceRecord { } // Not: Approval, Sign-off
```

**Context:** Acceptance is a decision point that triggers invoicing.

### Change Request

**Definition:** A proposed change to project scope, timeline, or cost requiring client approval.

**Lifecycle:** Raised → Impact Assessment → Client Decision → Approved → Declined → Implemented → Closed

**Usage in code:**

```typescript
model ChangeRequest { } // Not: ChangeOrder, Variation, Amendment
```

### Invoice

**Definition:** A request for payment sent to the client.

**Lifecycle:** Draft → Issued → Partially Paid → Paid → Overdue → Disputed → Written Off → Cancelled

**Usage in code:**

```typescript
model Invoice { } // Not: Bill, Statement
```

**Context:** Invoices are created after client acceptance of deliverables or milestones.

### Talent Payout

**Definition:** A payment to Verified Talent for completed project work.

**Lifecycle:** Pending → Approved → Processing → Paid → Failed → Disputed → Cancelled

**Usage in code:**

```typescript
model TalentPayout { } // Not: Payment, Compensation, Remuneration
```

**Context:** Talent Payouts are recorded but processed manually in MVP (not automated).

### Experience Record

**Definition:** A verifiable record of a Talent's contribution to a completed project.

**Usage in code:**

```typescript
model ExperienceRecord { } // Not: Credential, Certificate, Reference
```

**Context:** Experience Records support talent progression and portfolio building.

### Progression Event

**Definition:** A change in a Talent's career stage (e.g., Verified Talent → Associate Professional).

**Usage in code:**

```typescript
model ProgressionEvent { } // Not: Promotion, Advancement, LevelUp
```

**Context:** Progression is evidence-based and approved by Talent Operations.

---

## Project Governance Terms

### RAID Register

**Definition:** A project management tool tracking **Risks, Assumptions, Issues, Dependencies**.

**Usage in code:**

```typescript
model Risk { }
model Assumption { }
model Issue { }
model Dependency { }
// Not: RAID (as a single entity)
```

**Context:** Each RAID component is a separate entity.

### Risk

**Definition:** A potential future problem that could negatively affect project delivery.

**Usage in code:**

```typescript
model Risk { } // Not: Threat, Problem
```

### Assumption

**Definition:** A condition believed to be true without proof, documented to avoid misunderstanding.

**Usage in code:**

```typescript
model Assumption { } // Not: Premise, Hypothesis
```

### Issue

**Definition:** An actual problem currently affecting project delivery.

**Usage in code:**

```typescript
model Issue { } // Not: Problem, Blocker, Impediment
```

### Dependency

**Definition:** A project constraint where progress depends on an external factor.

**Usage in code:**

```typescript
model Dependency { } // Not: Blocker, Constraint, Requirement
```

### Decision

**Definition:** A significant project decision and its rationale.

**Usage in code:**

```typescript
model Decision { } // Not: Choice, Resolution
```

---

## Organisation Terms

### Organisation

**Definition:** A client or partner entity (company, NGO, government department, etc.).

**Usage in code:**

```typescript
model Organisation { } // Not: Company, Business, Client, Agency
```

**Context:** Use "Organisation" (British spelling) consistently. Do not use "Organization" (American spelling).

### Organisation Member

**Definition:** A user who belongs to an organisation.

**Usage in code:**

```typescript
model OrganisationMember { } // Not: Member, OrgUser
```

**Context:** A user can belong to multiple organisations.

---

## Talent Development Terms

### Skill

**Definition:** A specific technical or professional capability.

**Usage in code:**

```typescript
model Skill { } // Not: Capability, Competency
```

### Skill Category

**Definition:** A grouping of related skills (e.g., "Frontend Development," "Data Analysis").

**Usage in code:**

```typescript
model SkillCategory { } // Not: SkillGroup, Category
```

### Talent Skill

**Definition:** A Talent's proficiency in a specific skill.

**Usage in code:**

```typescript
model TalentSkill { } // Not: UserSkill, Proficiency
```

**Context:** Includes proficiency level (Beginner, Intermediate, Advanced, Expert).

### Certification

**Definition:** A formal credential earned by a Talent (e.g., AWS Certified, Google Analytics Certified).

**Usage in code:**

```typescript
model Certification { } // Not: Cert, Credential, Badge
```

### Portfolio Item

**Definition:** A work sample demonstrating a Talent's capabilities.

**Usage in code:**

```typescript
model PortfolioItem { } // Not: PortfolioProject, Sample, WorkSample
```

### Verification Record

**Definition:** A record of identity verification, background checks, or reference checks.

**Usage in code:**

```typescript
model VerificationRecord { } // Not: BackgroundCheck, IDCheck
```

---

## Service Catalogue Terms

### Service Category

**Definition:** A high-level grouping of services TaaS Solutions offers.

**Examples:**

- Software Engineering
- Artificial Intelligence
- Data and Analytics
- Cloud and DevOps
- Business Analysis and Digital Delivery
- Automation and Productivity

**Usage in code:**

```typescript
enum ServiceCategory {
  SOFTWARE_ENGINEERING
  ARTIFICIAL_INTELLIGENCE
  DATA_AND_ANALYTICS
  CLOUD_AND_DEVOPS
  BUSINESS_ANALYSIS
  AUTOMATION_AND_PRODUCTIVITY
}
// Not: ServiceType, Category
```

---

## Audit and Compliance Terms

### Audit Event

**Definition:** An immutable record of a sensitive action for compliance and security monitoring.

**Usage in code:**

```typescript
model AuditEvent { } // Not: Log, Activity, Action
```

**Context:** Audit Events are append-only (no updates or deletes).

### Consent Record

**Definition:** A record of a user's consent for data processing (POPIA compliance).

**Usage in code:**

```typescript
model ConsentRecord { } // Not: Consent, Agreement
```

---

## State Terminology

### Status vs. State

**Preferred:** Use "status" in user-facing contexts and "state" in code/architecture discussions.

```typescript
// Code
enum OpportunityStatus { DRAFT, SUBMITTED, TRIAGE }

// UI
<span>Status: Submitted</span>

// Architecture doc
"The opportunity transitions from SUBMITTED state to TRIAGE state."
```

---

## Action Verbs

Use consistent verbs for user actions:

### Create

For new entities.

```typescript
createOpportunity(); // Not: addOpportunity, newOpportunity
```

### Update

For modifications.

```typescript
updateProject(); // Not: editProject, modifyProject
```

### Delete

For removal.

```typescript
deleteUser(); // Not: removeUser, destroyUser
```

### Submit

For workflow progression (Draft → Submitted).

```typescript
submitOpportunity(); // Not: sendOpportunity, postOpportunity
```

### Approve

For positive authorization decisions.

```typescript
approveProposal(); // Not: acceptProposal (accept is for deliverables)
```

### Reject

For negative authorization decisions.

```typescript
rejectProposal(); // Not: declineProposal
```

### Accept

For deliverable or milestone acceptance.

```typescript
acceptDeliverable(); // Not: approveDeliverable (approval is for proposals)
```

### Assign

For assigning users to roles or resources.

```typescript
assignTalentToPod(); // Not: addTalentToPod
```

### Mobilise

For starting a project.

```typescript
mobiliseProject(); // Not: startProject, launchProject
```

**Context:** "Mobilise" (British spelling) reflects preparation and activation of resources.

### Close

For completing a project or opportunity.

```typescript
closeProject(); // Not: finishProject, completeProject
```

---

## Terminology to Avoid

### Do Not Use

- **Freelancer** → Use "Verified Talent"
- **Contractor** → Use "Verified Talent" or "Pod Member"
- **Gig** → Use "Project" or "Engagement"
- **Bid** → Use "Proposal"
- **Job** → Use "Project" or "Opportunity"
- **Task** → Use "Work Item" (internal) or "Deliverable" (client-facing)
- **Candidate** → Use "Talent Applicant"
- **Employee** → Use "Talent Operations Administrator" or specific role
- **Manager** → Use "Delivery Lead" or "Administrator" (be specific)
- **Team** → Use "Talent Pod" or "Pod"
- **Squad** → Use "Talent Pod" or "Pod"
- **Worker** → Use "Verified Talent" or "Pod Member"
- **Resource** → Use "Talent" (people are not resources)

---

## Pluralization

Follow standard English pluralization:

```typescript
// Correct
opportunities (not opportunity_list)
projects (not project_collection)
skills (not skillSet)
```

---

## Abbreviations

### Allowed in Code

- **ID** (identifier) – `userId`, `projectId`
- **URL** – `profileUrl`, `logoUrl`
- **API** – `apiKey`, `apiRoute`

### Spell Out in User-Facing Content

- **Identifier** (not ID)
- **Web address** or **Link** (not URL)

### Prohibited Abbreviations

- **Auth** → Use "Authentication" or "Authorization" (be specific)
- **Org** → Use "Organisation"
- **Repo** → Use "Repository"
- **Docs** → Use "Documents" or "Documentation"
- **Ops** → Use "Operations" (except in role names where established: `TALENT_OPS_ADMIN`)

---

## Casing Conventions

### Code

- **Variables/Functions:** camelCase (`getUserById`, `opportunityStatus`)
- **Constants:** SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE`)
- **Types/Classes:** PascalCase (`User`, `OpportunityStatus`)
- **Enums:** PascalCase with SCREAMING_SNAKE_CASE values
  ```typescript
  enum OpportunityStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
  }
  ```

### Database

- **Tables:** PascalCase singular (`User`, `Opportunity`)
- **Columns:** camelCase (`firstName`, `createdAt`)

### URLs/Routes

- **Lowercase with hyphens:** `/request-solution`, `/my-projects`

---

## Glossary (Alphabetical)

| Term                                 | Definition                                           | Usage             |
| ------------------------------------ | ---------------------------------------------------- | ----------------- |
| **Acceptance**                       | Client's formal approval of deliverable or milestone | AcceptanceRecord  |
| **Audit Event**                      | Immutable record of sensitive action                 | AuditEvent        |
| **Change Request**                   | Proposed scope, timeline, or cost change             | ChangeRequest     |
| **Client Approver**                  | User with proposal/acceptance authority              | CLIENT_APPROVER   |
| **Client Member**                    | User belonging to client organisation                | CLIENT_MEMBER     |
| **Contract**                         | Executed legal agreement                             | Contract          |
| **Decision**                         | Significant project decision and rationale           | Decision          |
| **Deliverable**                      | Client-facing output subject to acceptance           | Deliverable       |
| **Delivery Lead**                    | Accountable person for pod and project               | DELIVERY_LEAD     |
| **Dependency**                       | External factor project depends on                   | Dependency        |
| **Discovery**                        | Requirements clarification process                   | DiscoveryRecord   |
| **Experience Record**                | Verifiable record of talent contribution             | ExperienceRecord  |
| **Finance Administrator**            | Staff managing invoices and payouts                  | FINANCE_ADMIN     |
| **Invoice**                          | Request for payment to client                        | Invoice           |
| **Issue**                            | Actual problem affecting delivery                    | Issue             |
| **Milestone**                        | Significant project checkpoint                       | Milestone         |
| **Opportunity**                      | Client business need (potential project)             | Opportunity       |
| **Organisation**                     | Client or partner entity                             | Organisation      |
| **Platform Administrator**           | Staff with system-wide access                        | PLATFORM_ADMIN    |
| **Pod**                              | Managed multidisciplinary team                       | Pod               |
| **Pod Member**                       | Verified Talent assigned to pod                      | PodMember         |
| **Progression Event**                | Career stage advancement                             | ProgressionEvent  |
| **Project**                          | Contracted engagement to deliver outcomes            | Project           |
| **Project Operations Administrator** | Staff managing pipeline and projects                 | PROJECT_OPS_ADMIN |
| **Proposal**                         | Formal offer to client                               | Proposal          |
| **Quality Review**                   | Internal deliverable assessment                      | QualityReview     |
| **Quality Reviewer**                 | Staff performing internal QA                         | QUALITY_REVIEWER  |
| **Risk**                             | Potential future problem                             | Risk              |
| **Skill**                            | Specific technical or professional capability        | Skill             |
| **TaaS Solutions**                   | Company and platform name                            | n/a               |
| **Talent Applicant**                 | Registered user awaiting verification                | TALENT_APPLICANT  |
| **Talent Operations Administrator**  | Staff managing talent lifecycle                      | TALENT_OPS_ADMIN  |
| **Talent Payout**                    | Payment to talent for completed work                 | TalentPayout      |
| **Talent Pod**                       | (see Pod)                                            | n/a               |
| **Verified Talent**                  | Approved professional available for assignment       | VERIFIED_TALENT   |
| **Work Item**                        | Discrete unit of internal work                       | WorkItem          |

---

## Consistency Check

Before submitting code or documentation:

- [ ] Terminology matches this glossary
- [ ] No prohibited terms used (freelancer, gig, etc.)
- [ ] Casing conventions followed
- [ ] Action verbs consistent (create, update, submit, etc.)
- [ ] British spellings used (Organisation, Mobilise)
- [ ] Role names match exactly (VERIFIED_TALENT not Verified_Talent)

---

## Questions or Clarifications

If terminology is ambiguous or missing from this document, ask before inventing new terms. Maintain consistency across the platform.
