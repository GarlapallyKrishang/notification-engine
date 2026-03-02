# Notification Prioritization Engine

This repository contains two fully working implementations of a production-grade **Notification Prioritization Engine**, built as part of a technical evaluation.

## Implementations
Both implementations conform to the EXACT same architecture, event schemas, workflow, failure handling, and endpoints. 

1. **MERN Stack** (`/notification-engine-mern`)
   - MongoDB, Express.js, TypeScript
   - Built confidently using `mongoose` and custom async logic.
2. **Spring Boot Stack** (`/notification-engine-spring`)
   - Java 17, Spring Boot, PostgreSQL, JPA
   - Built robustly utilizing `Resilience4j` and Spring's native `@Async` & `@Scheduled`.

### Frontends
Both stacks utilize an identical **Next.js 14 App Router** frontend crafted with **Tailwind CSS**. It provides a premium, responsive, and glassmorphism-based aesthetic.

## Architecture Highlights
- **Immediate 202 Accepted Response**: API never blocks. DB insertion acts as a buffer.
- **Deduplication Engine**: Hash-based deduplication and text similarity heuristics.
- **Alert Fatigue Check**: Throttles users receiving >10 alerts/hr (soft cap).
- **Asynchronous AI Integration (OpenAI)**: Detached processing evaluating payloads using LLMs.
- **Circuit Breaker**: System trips after 5 AI failures inside a 2 min sliding window, instantly shifting traffic to rules engine.
- **Rule Engine Fallback**: JSON-configured rules loaded dynamically providing uninterrupted classification when AI goes down.
- **Background Scheduler**: A background chron processor evaluating `LATER` queued messages every 2 minutes.
- **Audit Logging**: Append-only ledgers tracing whether AI or Rules handled an event.

## Getting Started
Please view the respective `/backend` and `/frontend` `README.md` files inside each tech stack folder for detailed setup and `.env` requirements.

## Deployment Notes
- Ready for Railway/Render (Dockerfiles provided for both Backends).
- Ready for Vercel (Next.js config standard).
- No hardcoded localhost addresses inside production builds (API targets handled via Env vars).
