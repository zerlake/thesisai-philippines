# Feature: AI-Powered Academic Document Creation and Management

## 1. Overview

This document specifies the features and architecture for "ThesisAI Philippines," a comprehensive, AI-powered academic writing platform. The system is a web application built with Next.js, TypeScript, and a Supabase backend.

The primary goal is to streamline the entire academic writing process for students, from initial topic ideation to final review and submission. The platform provides a suite of AI-powered tools, collaboration features to connect students with advisors and critics, and administrative oversight capabilities.

## 2. Clarifications

### Session 2025-10-18
- Q: How should the AI-powered features (e.g., outline generation, grammar check) be implemented? → A: Through an internal abstraction layer or gateway that manages calls to one or more external LLM providers.
- Q: What initial criteria should define a student as "at-risk" on the advisor dashboard? → A: A combination of inactivity (e.g., >14 days) and missed milestones.
- Q: What is the primary status progression (lifecycle) for a student's document? → A: `Draft` -> `In Review` -> `Revisions Requested` -> `Approved`
- Q: How should critic billing be calculated? → A: A flat fee per document review.

## 3. User Roles & Actors

The system defines four primary user roles with distinct permissions and workflows:

| Role      | Description                                                                                                                              |
| :-------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **Student** | The primary user of the platform. They create and manage documents, utilize AI writing tools, and submit their work for review.         |
| **Advisor** | A mentor assigned to students. They review student drafts, provide feedback, and monitor progress through a dedicated dashboard.        |
| **Critic**  | An expert who provides in-depth review services. They manage a queue of student work and handle their own billing.                     |
| **Admin**   | A superuser with full system oversight. They manage user roles, approve institution requests, manage testimonials, and process payouts. |

## 4. Functional Requirements

### 4.1. Student-Facing Features

- **Workspace:**
  - A central dashboard (`/dashboard`) to view progress, milestones, and recent activity.
  - A drafts management page (`/drafts`) to create, view, and edit documents.
- **AI Writing Tools:**
  - Topic Idea Generation (`/topic-ideas`)
  - Thesis Title Generator (`/title-generator`)
  - Outline Generation (`/outline`)
  - Research Assistance (`/research`)
  - Methodology Helper (`/methodology`)
  - Results & Conclusion Generators (`/results`, `/conclusion`)
  - PDF & Document Analysis (`/document-analyzer`)
- **Review & Submission Tools:**
  - Paraphrasing Tool (`/paraphraser`)
  - Grammar & Originality Checkers (`/grammar-check`, `/originality-check`)
  - Presentation & Flashcard Generators (`/presentation`, `/flashcards`)
  - Q&A Simulator for defense preparation (`/qa-simulator`)
  - Title Page Formatter (`/title-page`)
- **Collaboration & Settings:**
  - Management of assigned Advisor and Critic.
  - Billing history and management (`/settings/billing`).
  - Referral tracking and management (`/settings/referrals`).
- **Resources:**
  - Access to general resources and university-specific guides.

### 4.2. Advisor-Facing Features

- **Advisor Workspace:**
  - A dedicated dashboard (`/advisor`) to track student progress and identify "at-risk" students.
    - **At-Risk Criteria:** A student is flagged as "at-risk" based on a combination of document inactivity (e.g., no edits for more than 14 days) and missed project milestones.
  - Access to view and comment on student drafts.
  - A competency self-assessment tool (`/advisor/competency`).
- **Student Management:**
  - A data management view to oversee student data privacy and access.
- **Resources:**
  - Access to a dedicated Advisor Guide.

### 4.3. Critic-Facing Features

- **Critic Workspace:**
  - A dashboard (`/critic`) to manage their review queue.
  - A list of assigned students (`/critic/students`).
  - Billing and payout management (`/critic/billing`). The billing model is based on a **flat fee per document review**.
- **Resources:**
  - Access to a dedicated Critic Guide.

### 4.4. Admin-Facing Features

- **System Oversight:**
  - A comprehensive admin dashboard (`/admin`) for user and system management.
  - Ability to manage user roles (Student, Advisor, Critic, Admin).
  - Ability to assign advisors to students.
- **Request Management:**
  - Approve or decline pending institution registration requests.
  - Approve or reject user-submitted testimonials.
  - Process or decline payout requests from Critics/Advisors.
- **Demo Functionality:**
  - Ability to log in as a demo version of each user role for testing and demonstration.

## 5. Data Model

Based on the application logic, the following data entities are inferred:

- **`profiles`**: Stores user information, including `id`, `first_name`, `last_name`, and `role`.
- **`documents`**: (Inferred) Stores the academic documents created by students.
  - **Fields**: Includes content, title, and associated metadata.
  - **Status Lifecycle**: Documents progress through the following states: `Draft` -> `In Review` -> `Revisions Requested` -> `Approved`.
- **`advisor_student_relationships`**: A linking table to associate `student_id` with an `advisor_id`.
- **`institution_requests`**: Stores requests from users to add a new institution to the platform. Includes `name`, `status`, and `requested_by`.
- **`testimonials`**: Stores user-submitted testimonials for the platform. Includes `content`, `status`, and `user_id`.
- **`payout_requests`**: Stores requests from users (likely Critics/Advisors) to cash out their earnings. Includes `amount`, `payout_method`, and `status`.
- **`user_preferences`**: (Inferred) Stores user-specific settings, such as dashboard widget visibility and notification preferences.

## 6. Non-Functional & Architectural Requirements

- **Technology Stack:**
  - **Frontend:** Next.js 15.3.4, React 19, TypeScript
  - **Styling:** Tailwind CSS
  - **Backend & Database:** Supabase
- **Architecture:**
  - **AI Features:** All AI-powered functionality will be implemented through an internal abstraction layer or gateway. This gateway will be responsible for managing API calls to one or more external, third-party LLM providers.
- **Observability:**
  - Error tracking and performance monitoring are implemented using Sentry.
- **Editor:**
  - A rich-text editor is implemented using Tiptap for document creation and editing.

## 7. Out of Scope

*(This section is intentionally left blank as it cannot be determined from a codebase analysis alone. It requires explicit product decisions.)*