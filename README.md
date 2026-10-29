# Accessible Learning Format Request (SOA-S09-T17) — Group 17

A comprehensive, production-grade frontend-only Service-Oriented Architecture (SOA) business workflow simulation built for college academic project evaluation.

**Project Name:** Accessible Learning Format Request  
**Project ID:** SOA-S09-T17  
**Team:** Group 17  
**Course:** Service-Oriented Architecture & Distributed Systems

---

## 1. Project Purpose & Scope

This application simulates the end-to-end business workflow of an enterprise university accessibility transformation system. It models how students register accessibility requirements (such as EPUB 3, Tagged Accessible PDF, Screen-Reader HTML5, Audio MP3, Large Print, and Braille-Ready BRF), and how accessibility editors manage multi-stage conversion pipelines, verify WCAG 2.1 AA/AAA compliance, deliver accessible formats, and receive explicit learner acceptance.

> **CRITICAL EVALUATION NOTE:**  
> This is a **frontend-only simulation** running completely in the browser with `localStorage` (Schema v2) state persistence and an automated test suite. No Spring Boot microservices, Eureka servers, PostgreSQL databases, or Apache Kafka message brokers are instantiated or required. Conceptual architecture diagrams, simulated Kafka message payloads, and microservice topology cards are included for demonstration and evaluation purposes.

---

## 2. Key Business & Architectural Rules

### 1. Strict Conversion Lifecycle & Quality Gate
State transitions strictly adhere to the enforced sequence:
`REQUESTED → ASSIGNED → IN_CONVERSION → QUALITY_CHECK → DELIVERED → ACCEPTED`

- **Delivery is strictly forbidden directly from `IN_CONVERSION`**: A task must advance to `QUALITY_CHECK` first.
- **Delivery requires a passing Quality Check**: `recordDelivery` checks `qualityCheckStatus === 'PASSED'`. Delivery is locked if QC is `PENDING`, `NOT_STARTED`, or `FAILED`.
- **Quality Check Failure Handling**: Editors can fail a QC audit with a stated defect reason. The task automatically transitions back to `IN_CONVERSION` with `qualityCheckStatus = 'FAILED'`, and delivery remains strictly blocked until remediated and approved.
- **Revision Resets Quality Gate**: If a learner requests a revision, the task transitions to `REVISION_REQUESTED` and its `qualityCheckStatus` resets to `NOT_STARTED`. The revised content must undergo conversion and quality check approval once again before delivery can be recorded.

### 2. Critical Completion Rule
A learner's overall course workflow **must remain `INCOMPLETE`** until every required reading (all 5 readings) has a usable delivered format **and** explicit learner acceptance.
- Example: 4 of 5 readings accepted, 1 awaiting delivery → Status remains **`INCOMPLETE (4 of 5 readings accepted)`**.
- Only when all 5 readings are delivered and explicitly accepted does status transition to **`COMPLETE (5 of 5 readings accepted)`**.

### 3. Delivery vs. Acceptance Separation
When an editor marks a package as delivered, it is **never automatically accepted**. Delivery updates the reading to `deliveryStatus: 'DELIVERED'` and `acceptanceStatus: 'AWAITING_ACCEPTANCE'`. The learner must independently review the document preview and explicitly:
- **Accept**: Requires a validated integer rating between 1 and 5 stars. Duplicate acceptances are prevented.
- **Request Revision**: Requires a meaningful explanation (minimum 10 characters).

### 4. Robust Collision-Resistant ID Strategy
All entity identifiers (`REQ-*`, `TSK-*`, `DEL-*`, `REV-*`, `EVT-*`, `KFK-EVT-*`) are generated via `crypto.randomUUID()`, preventing any timestamp collision during rapid automated operations.

### 5. Storage Schema v2 with Safe Recovery
Browser persistence uses `localStorage` under schema version `v2`. Storage operations are protected with type guards and fallback recovery: corrupted or malformed stored data is gracefully discarded and replaced with initial seed data.

### 6. Role Route Guards & Strict 404 Not Found Handling
- Client-side `RoleGuard` prevents cross-persona navigation (Learners cannot access Editor queues; Editors cannot access Learner request forms without switching roles).
- Invalid reading IDs in delivery review or request routes render a clean "404 Not Found" UI rather than silently falling back to seed items.

---

## 3. 10-Step Evaluation Walkthrough

Follow this 10-step sequence to demonstrate the entire lifecycle to evaluators:

1. **Log in as Learner Maya Lin**: Access the Learner Dashboard.
2. **Select a Required Reading**: Notice `RDG-105` ("Graph Theory & Combinatorial Network Optimization") is marked *Not Requested*.
3. **Submit Format Request**: Choose *Large Print*, select technical criteria (high contrast, vector graphs), and submit.
4. **Switch to Accessibility Editor David Chen**: Use the persona toggle in the top header.
5. **Assign Task**: Claim the generated task from the Conversion Queue.
6. **Progress Conversion**: Advance status through `ASSIGNED` → `IN_CONVERSION` → `QUALITY_CHECK`.
7. **Pass QA & Record Delivery**: Certify WCAG 2.1 AA and record format delivery (triggers simulated `AccessibleFormatDelivered` Kafka event).
8. **Switch back to Learner Maya Lin**: View the delivered format notification in the Learner Dashboard.
9. **Review & Accept**: Open the interactive accessible document viewer, test font sizing, high-contrast themes, and Web Speech API audio playback, then submit an explicit 5-star acceptance.
10. **Verify Critical Completion Rule**: Confirm all 5 readings are now accepted and the overall workflow flips to **`COMPLETE (5 of 5 readings accepted)`**.

*(Evaluators can also use the "Auto-Run Step" feature in the top Guided Demo drawer to test any step in one click!)*

---

## 4. Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (Lavender & Deep Navy accessibility palette)
- **Routing**: React Router (`react-router-dom` v7)
- **Icons**: Lucide React
- **Speech Synthesis**: Browser Web Speech API (`window.speechSynthesis`) with rate control and lifecycle cleanup
- **Testing**: Vitest (`vitest run`)
- **Persistence**: Browser `localStorage` Schema v2 with seed recovery

---

## 5. Local Setup & Running Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
# Server starts at http://localhost:3000

# 3. Run automated test suite
npm test

# 4. Type check / lint
npm run lint

# 5. Production build
npm run build
```

---

## 6. Automated Test Suite

The project includes a comprehensive, production-grade test suite powered by Vitest (`src/test/workflow.test.ts`), verifying the actual production workflow engine (`src/context/workflowEngine.ts`):

- **Unique ID Collision Resistance (2 tests)**:
  - Generates IDs with requested prefixes (`REQ-`, `TSK-`, `DEL-`, `REV-`, `EVT-`).
  - 1,000 generated IDs verified 100% collision-free.
- **State Machine Transitions & Strict QA Gates (4 tests)**:
  - Strict rejection of delivery directly from `IN_CONVERSION`.
  - Rejection of delivery when task is in `QUALITY_CHECK` but `qualityCheckStatus` is `PENDING`.
  - Rejection of delivery when task has `FAILED` quality check.
  - Proper transition on `failQualityCheckAction` back to `IN_CONVERSION` with `FAILED` status.
- **Hardened Delivery & Duplicate Prevention (3 tests)**:
  - Rejection of duplicate delivery when task status is already `DELIVERED`.
  - Rejection of duplicate delivery when a delivery record already exists for the task.
  - Rejection of delivery if target reading or associated request relationship is broken.
- **Learner Acceptance & Rating Validation (4 tests)**:
  - Rejection of acceptance for undelivered readings.
  - Rejection of duplicate acceptance for already accepted readings.
  - Successful acceptance for delivered readings awaiting acceptance (`RDG-104`).
  - Strict rating validation (rejects non-integers, decimals, <1, >5; accepts 1–5).
- **Learner Revision Eligibility (Requirement 1) (4 tests)**:
  - Permitted **only** for an existing delivery awaiting learner acceptance (`deliveryStatus: 'DELIVERED'`, `acceptanceStatus: 'AWAITING_ACCEPTANCE'`).
  - Rejection of revision requests for undelivered readings.
  - Rejection of revision requests for already accepted readings.
  - Minimum 10-character meaningful revision reason enforcement.
  - Reset of task `status` to `REVISION_REQUESTED` and `qualityCheckStatus` to `NOT_STARTED`.
- **Critical Completion Calculation (2 tests)**:
  - Course status remains strictly `INCOMPLETE` when 3/5 or 4/5 readings are accepted.
  - Flips to `COMPLETE` only when all 5 readings are accepted (100%).
  - Confirms deliveries awaiting acceptance do not prematurely count toward accepted total.
- **End-to-End Integration Workflow (1 comprehensive test)**:
  - Complete lifecycle execution: Learner request → Editor assignment → Conversion → Quality check → Failed QA scenario → Remediation → Second QA pass → Delivery recording → Learner revision request → Recovery re-conversion & re-QC → Re-delivery → 5-star acceptance → Overall 5/5 course completion!
- **Structural Storage Validation & Recovery (5 tests)**:
  - Validates clean baseline simulation state.
  - Rejects state where a reading has an invalid workflow status.
  - Rejects state where a task references a non-existent reading ID (orphaned task).
  - Rejects state where a delivery references a non-existent task ID (orphaned delivery).
  - Verifies simulation reset restores initial seed data and resets state consistently.

Run the tests at any time with:
```bash
npm test
```

---

## 7. Deployment Configuration

The application includes single-page application (SPA) fallback configuration for cloud hosting:

- **Netlify / Cloudflare Pages**: Configured via `public/_redirects` (`/* /index.html 200`).
- **Vercel**: Configured via `vercel.json` rewrite rule to route all paths to `/index.html`.

---

## 8. Simulated Microservice Topology

| Service | Intended Technology | Simulated Role |
| :--- | :--- | :--- |
| **Eureka Discovery Server** | Spring Cloud Netflix | Service registry & health monitoring |
| **API Gateway** | Spring Cloud Gateway | Edge reverse proxy & JWT claims routing |
| **Authentication Service** | Spring Security JWT | Role-based identity (Learner vs Editor) |
| **Reading List Service** | Spring Data JPA | Course catalog & critical completion status |
| **Format Need Service** | Spring Boot REST | Accessibility requirements intake |
| **Conversion Service** | Spring Boot + Kafka Producer | State machine pipeline & format delivery |
| **Acceptance Service** | Spring Boot + PostgreSQL | Explicit learner review & rating feedback |
| **Event Broker** | Apache Kafka | Topic: `soa.s09.t17.events` |

---

Developed by Group 17 for SOA-S09-T17.
