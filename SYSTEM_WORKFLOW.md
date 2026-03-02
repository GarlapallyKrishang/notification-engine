# System Workflow

## 1. Notification Ingestion
1. Client sends a POST request to `/api/notifications/events`.
2. Core API receives standard JSON payload.

## 2. Pre-processing & Deduplication
1. Generate `dedupe_key` (if not provided) by hashing `user_id`, `event_type`, `message`.
2. Check Database/Cache for existing `dedupe_key`. 
    - If found -> Discard (Exact Duplicate).
3. Check for Near-Duplicates (e.g. string distance for similar messages within X timeframe).
    - If detected -> Discard/Log.
4. Check User Rate Limit (Alert Fatigue).
    - If > threshold -> Discard/Log.

## 3. Storage & Initial Response
1. Save the notification event to the Database with status = `PENDING`.
2. Return immediately HTTP 202 Accepted. Client is not blocked.

## 4. Asynchronous Classification Pipeline
1. **Circuit Breaker Check**: Is the AI Service Circuit CLOSED or HALF_OPEN?
    - **YES**: Proceed to AI Classification.
    - **NO (OPEN)**: Proceed immediately to Rule Engine Fallback.

2. **AI Classification (OpenAI)**:
    - Attempt OpenAI call with prompt + event data.
    - Retry logic: Max 3 times with exponential backoff.
    - If SUCCESS -> Update DB with AI result (`NOW`, `LATER`, `NEVER`). Log to Audit Log.
    - If ALL 3 RETRIES FAIL:
        - Increment Failure Count in `ai_health`.
        - If Failure Count >= 5 in < 2 mins -> Trip Circuit Breaker.
        - Fallback to Rule Engine.

3. **Rule Engine Fallback**:
    - Load active Rules from DB.
    - Evaluate conditions against event payload.
    - Assign `priority_hint` or rule-based score. Map to `NOW`, `LATER`, `NEVER`.
    - Update DB. Log as `fallback_used: true` in Audit Log.

## 5. Post-Classification Actions
- **NOW**: Immediate downstream delivery (simulated).
- **LATER**: Remains in DB as `LATER`. Picked up by Scheduler every 2 mins.
- **NEVER**: End of line.

## 6. Background Scheduler
1. Runs every 2 minutes.
2. Selects all items where `status = LATER`.
3. Processes items. Marks them as DONE or delivers them. If delivery fails, status stays `LATER` to retry.
