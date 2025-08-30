# AI Agent Guidelines for AI Build Dashboard

This document provides comprehensive guidelines for AI assistants working on the AI Build Dashboard project. All rules are stored in the `.cursor/rules/` directory and are automatically applied when working on this codebase.

## 📁 Project Overview

**AI Build Dashboard** is a Next.js 15 application for inventory management and data visualization. It features:
- Excel file upload and processing
- PostgreSQL database with Drizzle ORM
- NextAuth.js authentication
- Recharts data visualization
- Vitest testing framework

## 📋 Available Rules

The following rules are defined in `.cursor/rules/` and should be followed when working on this project:

### 🔧 Core Development Rules

#### [project-structure](.cursor/rules/project-structure.mdc)
- **Always Applied**: Yes
- **Description**: Project structure and file organization guidelines
- **Key Points**:
  - Next.js App Router under `app/` directory
  - API routes in `app/api/**/route.ts`
  - Drizzle database configuration in `lib/db/`
  - Prefer Server Components over Client Components

#### [ts-style](.cursor/rules/ts-style.mdc)
- **Always Applied**: Yes
- **Description**: TypeScript and React coding style guidelines
- **Key Points**:
  - Use explicit types for public APIs
  - Prefer descriptive names over abbreviations
  - Handle errors explicitly with context
  - Match existing ESLint configuration

#### [next-app-router](.cursor/rules/next-app-router.mdc)
- **Always Applied**: Yes
- **Description**: Next.js App Router specific rules
- **Key Points**:
  - Server Components by default
  - Server data fetching in Server Components
  - Request/Response Web APIs for route handlers
  - Proper caching semantics

### 🛠️ Technology-Specific Rules

#### [drizzle](.cursor/rules/drizzle.mdc)
- **Description**: Drizzle ORM usage guidelines
- **Key Points**:
  - Database schema definitions
  - Query patterns and transactions
  - Migration handling

#### [auth-nextauth](.cursor/rules/auth-nextauth.mdc)
- **Description**: NextAuth.js authentication guidelines
- **Key Points**:
  - Credentials provider setup
  - Session management
  - Protected routes

#### [api-upload](.cursor/rules/api-upload.mdc)
- **Description**: Excel upload API specifications
- **Key Points**:
  - File processing workflow
  - Data transformation logic
  - Transaction handling
  - Input validation

#### [ui-charts](.cursor/rules/ui-charts.mdc)
- **Description**: UI components and Recharts usage
- **Key Points**:
  - Chart component patterns
  - Data visualization standards
  - Component composition

### 🧪 Testing Rules

#### [vitest-testing](.cursor/rules/vitest-testing.mdc)
- **Description**: Vitest testing framework guidelines
- **Key Points**:
  - Test structure and organization
  - Test configuration
  - Testing patterns and best practices
  - API testing guidelines

### 🔒 Security and Environment Rules

#### [env-secrets](.cursor/rules/env-secrets.mdc)
- **Description**: Environment variables and secrets management
- **Key Points**:
  - Environment variable handling
  - Secret management
  - Configuration patterns

#### [git-quality](.cursor/rules/git-quality.mdc)
- **Description**: Git workflow and code quality guidelines
- **Key Points**:
  - Commit message conventions
  - Branch naming
  - Code review processes
  - CI/CD integration

## 🚀 Development Workflow

### 1. **Always Check Rules First**
Before making any changes, review the relevant rules in `.cursor/rules/` to understand:
- Current architecture decisions
- Coding standards
- Technology choices
- Security requirements

### 2. **Follow the Development Plan**
Reference `.Information/developPlan.md` for:
- Current development stage
- Implementation priorities
- Feature roadmap
- Technical decisions

### 3. **Use Testing Framework**
- Write tests for new features using Vitest
- Place test files in `test/` directory
- Use test data from `test/data/`
- Run tests before commits

### 4. **Maintain Code Quality**
- Follow TypeScript and ESLint rules
- Use descriptive variable and function names
- Handle errors appropriately
- Write clear documentation

### 5. **Database Operations**
- Use Drizzle ORM for all database interactions
- Always use transactions for multi-table operations
- Follow schema definitions in `lib/db/schema.ts`
- Test database operations thoroughly

## 📚 Key Files and Directories

### Core Configuration
- `package.json` - Dependencies and scripts
- `vitest.config.ts` - Testing configuration
- `drizzle.config.ts` - Database configuration
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - Code quality rules

### Database Layer
- `lib/db/schema.ts` - Database schema definitions
- `lib/db/index.ts` - Database client and helpers

### API Layer
- `app/api/upload/route.ts` - Excel file upload endpoint
- `app/api/auth/[...nextauth]/route.ts` - Authentication endpoint

### Frontend Layer
- `app/layout.tsx` - Root layout component
- `app/page.tsx` - Home page
- `app/dashboard/page.tsx` - Data visualization dashboard
- `app/upload/page.tsx` - File upload interface

### Testing
- `test/` - Test files directory
- `test/data/` - Test data files
- `vitest.config.ts` - Test configuration

## 🔍 Rule Application Priority

1. **Always Applied Rules** (highest priority):
   - `project-structure.mdc`
   - `ts-style.mdc`
   - `next-app-router.mdc`

2. **Technology-Specific Rules** (medium priority):
   - Apply relevant technology rules based on the feature being worked on

3. **Quality Assurance Rules** (medium priority):
   - `git-quality.mdc`
   - `vitest-testing.mdc`

4. **Security Rules** (high priority):
   - `env-secrets.mdc`
   - Security-related sections in other rules

## ⚠️ Important Notes

- **Never override established architecture** without explicit approval
- **Always follow security guidelines** especially for authentication and data handling
- **Test thoroughly** before committing changes
- **Document decisions** that deviate from existing patterns
- **Use transactions** for database operations that affect multiple tables

## 📞 Getting Help

If you're unsure about any aspect of the codebase:
1. Check the relevant rule files in `.cursor/rules/`
2. Review `.Information/developPlan.md` for project context
3. Examine existing code for patterns and conventions
4. Ask specific questions about unclear requirements

This ensures consistent, maintainable, and secure code throughout the project lifecycle.
