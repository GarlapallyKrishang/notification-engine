# Architecture Decisions

## 1. Asynchronous AI Classification
- **Decision**: AI Classification (OpenAI) will be done asynchronously.
- **Reason**: The API must respond immediately without blocking the client. A background queue or worker will handle the synchronous calling of the LLM and DB update.

## 2. Dual Implementations
- **Decision**: The system will be built in two discrete stacks: MERN and Spring Boot.
- **Reason**: This is a direct requirement for the technical evaluation to contrast the identical architecture across different stacks.

## 3. Circuit Breaker Mechanism
- **Decision**: To handle OpenAI failures, a circuit breaker will open after 5 consecutive failures within a 2-minute window.
- **Reason**: Protects the system from cascading failures, limits costs associated with failing API calls, and automatically degrades to a fast rule-based engine.

## 4. Rule Engine Fallback
- **Decision**: A lightweight rule engine stored in a relational DB/document store will act as a primary fallback when AI classification fails or the circuit is open.
- **Reason**: Guarantees that "Never drop events" requirement is met and allows dynamic configuration without restarting the service.

## 5. Background Scheduler for LATER Queue
- **Decision**: A robust background job scheduler will pick up `LATER` status items every 2 minutes.
- **Reason**: Prevents system overload by batch-processing deferred non-urgent events, fulfilling the specific timing requirement.

## 6. Deduplication and Alert Fatigue
- **Decision**: Immediate exact match deduplication based on `dedupe_key` will occur at the controller/service entry point. Alert fatigue will be calculated per user inside a defined time window.
- **Reason**: Prevents redundant processing and user harassment. Near-duplicate detection will be incorporated alongside this.
