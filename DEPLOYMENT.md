# Deployment Strategy

This system is designed to be easily deployable to modern cloud providers for both implementations.

## Target Architecture

### MERN Stack
- **Database**: MongoDB Atlas (Cloud NoSQL).
- **Backend (Node.js)**: Railway or Render.
- **Frontend (Next.js)**: Vercel.

### Spring Boot Stack
- **Database**: PostgreSQL (Elephantsql, Railway, or AWS RDS).
- **Backend (Java)**: Railway or Render.
- **Frontend (Next.js)**: Vercel.

## Environment Variables Configuration

- **SECRETS**: Never hardcoded. Always injected.
- `.env.example` templates provided for each app.
- Key variables:
  - `OPENAI_API_KEY`: API Key for LLM classification.
  - `MONGO_URI` / `SPRING_DATASOURCE_URL`: Database connection strings.
  - `JWT_SECRET`: (If auth is implemented for dashboard)
  - `PORT`: Default 8080.

## Dockerization

Both backends include `Dockerfile`s optimized for production:

**Node.js Dockerfile**:
- Multi-stage build.
- Base image: `node:18-alpine`.
- Copies `package.json`, installs deps, builds TypeScript.
- Runs `node dist/server.js`.

**Spring Boot Dockerfile**:
- Multi-stage build.
- Base image: `maven:3.9-eclipse-temurin-17` (builder).
- Base image: `eclipse-temurin:17-jre` (runner).
- Builds `.jar` and executes `java -jar app.jar`.

## Frontend Deployment

Both Next.js frontends are designed as standard static + serverless apps. They can be deployed via Vercel GitHub integration automatically. Vercel automatically detects the Next.js framework and configures the build steps (`npm run build`).

Provide `NEXT_PUBLIC_API_BASE_URL` in Vercel environment variables to point to the respective Render/Railway API instances.
