# Driver Live Location Tracking — Design & Load Analysis

## Problem
Rickshaw move kar raha hai, lekin rider ko purani static location dikhti hai. Need: rider ko live location dikhe (Uber/Ola style), bina server load badhaye.

## Solution (3-layer)
1. **Client (driver phone)**: `watchPosition` har 5s check kare, sirf **10m+ move** par request bheje.
2. **Backend**: `POST /rides/location` → Redis `GEOADD` update + Socket.io `driverLocation` emit.
3. **Rider (socket)**: `driverLocation` listener → live distance/indicator update.

## Load Analysis

### 1000 drivers × 5s = 200 req/s — exact numbers

| Component | Capacity | Load at 200 req/s | Verdict |
|---|---|---|---|
| Redis GEOADD | ~50k+ ops/s | 200/s (0.4%) | OK |
| Node.js HTTP | ~10-30k req/s | 200/s (1-2%) | OK |
| Socket.io emit | ~50k/s | 200/s (0.4%) | OK |
| Backend CPU (1 core) | — | ~5% | OK |

**200 req/s koi load nahi.** Ek chhota server 1000 drivers se 20x zyada sambhal leta.

### When problems start (exact thresholds)

| Scenario | req/s | Problem? |
|---|---|---|
| 1000 drivers, har 5s | 200/s | OK |
| 10,000 drivers, har 5s | 2,000/s | 1 core ~50%+ — throttling zaroori |
| 50,000 drivers | 10,000/s | Multi-instance + Redis Pub/Sub |
| Burst (sab ek saath app kholen) | spike | Node async handles |

## Throttling Strategy

| Layer | Kab lagana hai | Kaam |
|---|---|---|
| **Client-side** (abhi) | Free, hamesha | Phone khud check "10m move?" → nahi to request mat bhejo. ~90% requests khatam rukte driver ke liye |
| **Server-side throttle** | 5,000+ drivers | Har driver ki last update timestamp Redis mein, 5s se kam interval skip |
| **Multi-instance** | 50,000+ drivers | Redis Pub/Sub socket ke liye, horizontal scaling |

## Backend Changes
- `POST /rides/location` (JWT protected) — driver apni live location bhejta hai
- Redis `GEOADD drivers:online:geo` (already exists: `addDriverGeoLocation`)
- Socket emit `driverLocation` to `session:{sessionId}` room (riders who locked seat)
- Server-side throttle: last update time check (min 5s interval)

## Frontend Changes
- **Driver** (`driver-rides.tsx`): online par `watchPosition` start, 10m+ move par bhejo, offline par stop
- **Rider** (`rider-dashboard` / `nearby-list`): socket `driverLocation` listener → live distance update + indicator

## Files
- Backend: `rides.controller.ts`, `rides.service.ts`, `dto/update-driver-location.dto.ts`, `rides.gateway.ts`, `ride-session.repository.ts`
- Frontend: `driver-rides.tsx`, `rider-dashboard.tsx`, `nearby-list.tsx`, `lib/hooks/use-ride-socket.ts`
