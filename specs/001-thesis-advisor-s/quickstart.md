# Quickstart Guide

**Date**: 2025-10-18
**Spec**: [spec.md](./spec.md)

This guide provides instructions to set up and run the ThesisAI application locally for development.

## 1. Prerequisites

- Node.js (version specified in `.nvmrc` or latest LTS)
- pnpm (or npm/yarn)
- Supabase account and a new project created.
- Git

## 2. Environment Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd thesis-ai
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Supabase environment variables:**
    - In your Supabase project dashboard, go to `Settings` > `API`.
    - Create a new file named `.env.local` in the root of the project.
    - Copy the following variables into the file:

      ```env
      NEXT_PUBLIC_SUPABASE_URL="<YOUR_SUPABASE_URL>"
      NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_SUPABASE_ANON_KEY>"
      ```
    - Replace the placeholder values with your actual Supabase URL and Anon Key.

4.  **Set up database schema:**
    - The required database tables and policies are defined in `specs/001-thesis-advisor-s/data-model.md`.
    - You can either run the SQL statements manually in the Supabase SQL Editor or use Supabase migrations if they are set up.

## 3. Running the Application

-   **Start the development server:**
    ```bash
    pnpm run dev
    ```
-   The application will be available at `http://localhost:3000`.

## 4. Running Tests

-   **Execute the test suite:**
    ```bash
    pnpm test
    ```
    This command will run all unit and integration tests using Jest.

## 5. First-Time Use

1.  Navigate to `http://localhost:3000/register` to create a new user account.
2.  After signing up, you will be logged in as a `student` by default.
3.  To gain `admin` privileges for testing, you will need to manually update the `role` of your user in the `profiles` table in your Supabase database.
4.  Once you are an admin, you can access the Admin Dashboard at `http://localhost:3000/admin` to manage other users and test the different roles.
