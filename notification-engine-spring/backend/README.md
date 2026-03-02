# Spring Boot Notification Prioritization Engine Backend

This is the Java Spring Boot + PostgreSQL implementation of the Notification Engine.

## Setup

1. Ensure PostgreSQL is running.
2. Provide a URI via `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
3. Provide `OPENAI_API_KEY`.
4. Run:
```bash
mvn spring-boot:run
```

## Features
- Complete Schema management via JPA
- Resilience4j Circuit Breaker implemented for OpenAI
- Spring Async execution for non-blocking classification
- LATER Queue Scheduler processing jobs every 2 mins using `@Scheduled`
- Identical behavior to MERN stack implementation
