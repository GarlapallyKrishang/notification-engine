# MERN Notification Prioritization Engine Backend

This is the Node.js/Express implementation of the Notification Engine.

## Setup

1. `npm install`
2. Create `.env` based on `.env.example`
3. Ensure MongoDB is running locally or provide a URI via `MONGO_URI`.
4. Run `npm run dev` (Requires setting up script in package.json)

## Scripts

Add these to package.json:
```
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js",
  "dev": "ts-node src/server.ts"
}
```

## Features
- Deduplication & Rate Limiting (Fatigue logic)
- Rule Engine Evaluation Fallback
- OpenAI based Asynchronous Classification (Event loop detached promise)
- Circuit Breaker Pattern protecting OpenAI limits
- LATER Queue Scheduler processing jobs every 2 mins
