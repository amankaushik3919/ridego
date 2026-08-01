# RideGo — 1000 Users Scalability & Quality Analysis

## Goal
Kya current architecture **1000+ concurrent users** handle kar sakta hai? Kis load par kya hoga, bottlenecks kahan hain, aur kya optimize karna chahiye.

## Assumptions (1000 users model)
- **1000 users** online: ~700 riders + ~300 drivers (realistic split)
- Peak hour: most users active simultaneously
- **200 drivers** online at once (kabhi-kabhi max)
- Location updates: har driver **har 10s** par sirf ≥10m move par (live-location design)
- Rides/day: ~2000 completed rides

---

## Layer-by-Layer Analysis

### 1. Frontend (Vercel — Next.js)
| Metric | Capacity | Load @1000 users | Verdict |
|---|---|---|---|
| Static assets (CDN) | ~unlimited | ~1000 × ~200KB = 200MB | OK |
| API requests (REST) | ~1M/min free tier | ~100 req/s peak | OK |
| Socket connections | per-server 10k+ | ~1000 connections | OK |

**Verdict: OK.** Vercel statics CDN par serve hote hain, load server par nahi padta. Socket.io polling → production me WebSocket.

### 2. Backend (NestJS — Railway/Docker)
| Metric | Capacity | Load @1000 users | Verdict |
|---|---|---|---|
| Node.js HTTP | ~10-30k req/s (1 core) | ~100-200 req/s | OK (~1%) |
| JWT verify per request | ~50k/s | 100-200/s | OK |
| Prisma queries | ~1-3k/s | 100-200/s | OK |

**Bottleneck: single Node process.** Railway default 1 instance. 1000 users ke liye OK, 5000+ ke liye **horizontal scaling** (multi-instance) chahiye.

### 3. Database (Supabase Postgres)
| Metric | Capacity | Load | Verdict |
|---|---|---|---|
| Reads | 1000s/s | 100-200/s | OK |
| Writes (ride finalize) | 100s/s | ~1/s peak | OK |
| Indexed queries (userId, driverId) | fast | all indexed | OK |

**Concern:** 
- `ride.findMany` me `driver: { farePerRider }` join — indexed `driverId` se OK
- Dashboard aggregations admin ke liye — frequency kam (manual click), OK
- **Full scan se bacho** — sab queries `where` par indexed fields use karti hain ✓

### 4. Redis (Upstash) — session/location/OTP
| Metric | Capacity | Load | Verdict |
|---|---|---|---|
| REST commands | 1000s/s | ~500/s peak | OK |
| GEOSEARCH | ~50k ops/s | 200 drivers → 200/s | OK |
| TTL sessions | auto-cleanup | — | OK |

**Note:** Upstash REST has per-request overhead (HTTP round-trip). Har `getSession` = 1 HTTP call. Admin online-drivers loop me `listActiveIndex` + N×`getSession` — **N+1**. 200 online → 200 HTTP calls. **Optimize: `pipeline`/`mget`** (Upstash supports pipeline) ya batch.

---

## Bottlenecks & Fixes (priority order)

| # | Bottleneck | Impact @1000 | Fix |
|---|---|---|---|
| 1 | **Admin online-drivers N+1** (Redis) | 200 HTTP calls per refresh | Upstash `pipeline` batch `getSession` |
| 2 | **Driver stats N+1** (drivers list) | per-driver 2 groupBy — batched ✓ but profile+session loop | already batched; session check loop → Redis pipeline |
| 3 | **Single backend instance** | CPU spikes @peak | Railway `replicas: 2` (env `REPLICA_COUNT`) |
| 4 | **Socket single instance** | 1000 sockets on 1 process OK, cross-instance room broadcast fails | Redis adapter (`@socket.io/redis-adapter`) jab multi-instance |
| 5 | **Un-indexed queries** | — | confirm `completedAt`, `status` on Ride (add composite index) |
| 6 | **Location write rate** | 200 drivers × every 10s = 20/s | already throttled by 10m threshold ✓ |

---

## Prisma Query Quality Checklist
- [x] `where` hamesha indexed fields (`userId`, `driverId`, `phone`)
- [x] Batch `findMany` + `groupBy` (N+1 avoided in drivers list)
- [x] `select` limited fields (kam data)
- [ ] **Ride index**: `@@index([driverId, status, completedAt])` — admin aggregations ke liye
- [ ] **RideRider index**: `@@index([riderId])` — rider history
- [ ] `pipeline()` use Redis me (admin online list)

---

## Pagination & Data Reduction (admin)
- [x] Sab lists paginated (`page`/`limit`, default **10/page**)
- [x] Kam data: drivers/riders sirf required fields
- [x] Driver detail me `recentRides` take 10, total rides capped 500
- [x] `limit` max 100 enforced (DTO)
- [ ] Trend API: 7/30 days param — kam days = kam rows

---

## Load Test Plan
```bash
# Backend local start
cd rider-backend && pnpm start:dev

# 100 concurrent admin/read requests
# (ApacheBench ya k6)
ab -n 1000 -c 100 http://localhost:4000/api/v1/admin/stats/overview -H "Authorization: Bearer $TOKEN"

# Expected: p95 < 200ms @ 100 concurrent
```

---

## Verdict
**1000 users: SAFE.** Current architecture handles 1000 concurrent users comfortably (CPU ~5-10% load). Bottlenecks sirf 2000+ par aayenge. **Production se pehle** karo:
1. Ride + RideRider indexes add (migration)
2. Admin online-drivers me Redis pipeline
3. Railway me `REPLICA_COUNT=2` (future)
4. Socket Redis adapter (jab multi-instance ho)

## Future (5000+ users)
- Backend: 3+ instances + load balancer
- Socket: Redis adapter + sticky sessions
- Postgres: read replica for admin reports
- Redis: dedicated cluster
