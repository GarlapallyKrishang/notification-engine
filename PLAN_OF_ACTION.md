# Plan of Action

## Phase 1: Planning and Architecture (Current)
- Document the Architecture Decisions.
- Document the System Workflow.
- Document Deployment Strategy.
- Create initial task tracking (`task.md`).

## Phase 2: Core Platform Setup & CI/CD
- Establish monorepo or standard folder structure for both stacks.
- Setup environment variables `.env.example`.
- Setup Dockerfiles for both backends.

## Phase 3: MERN Stack Implementation
- **Backend API**: Express + MongoDB. Establish schemas and core entry point.
- **Deduplication Engine**: Hash-based Exact Match and Near-Match Logic.
- **Alert Fatigue Logic**: Redis/MongoDB backed sliding window per user.
- **AI Integration**: OpenAI SDK integration + Asynchronous queue logic.
- **Resilience**: Implement Circuit Breaker logic manually for API integration.
- **Rule Engine Fallback**: Configure rules in DB + evaluator logic.
- **Frontend App**: Next.js (Pages/App router), Tailwind CSS, connecting to Express backend.

## Phase 4: Spring Boot Implementation
- **Backend API**: Spring Web + Spring Data JPA (PostgreSQL). Establish entities.
- **Deduplication Engine**: Same logic, but using Java Data Structures/JPA queries.
- **Alert Fatigue Logic**: DB driven or Caffeine cache.
- **AI Integration**: RestTemplate/WebClient to OpenAI + `@Async` execution.
- **Resilience**: Use `Resilience4j` `@CircuitBreaker` annotation.
- **Rule Engine Fallback**: Configure rules in Postgres, SpEL (Spring Expression Language) or custom evaluator.
- **Frontend App**: Copy over Next.js code from Phase 3, adjust API base URLs and slightly adjust data consumption if needed (should ideally be identical).

## Phase 5: Testing and Polish
- Validate failure scenarios (e.g. invalid OpenAI key -> switches to rules).
- Validate Scheduler kicks in to process deferred LATER events.
- Audit Log verification.
