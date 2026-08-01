# RideGo — Admin Dashboard PRD (v1.0)

## 1. Overview

**Goal**: Ek web-based admin panel jisse platform owner manage kare — drivers, riders, rides, revenue, aur live online status. Phone + laptop dono par responsive.

**Route**: `https://ridego.in/admin` (frontend), APIs `/api/v1/admin/*` (backend)

**Tech**: Next.js App Router + shadcn/ui (mobile-first, desktop-adapted) + NestJS + Prisma + Redis (existing stack)

---

## 2. Persona

**Admin** — platform owner (sirf 1-2 log). Separate username/password login hota hai (regular users OTP use karte hain, ye alag flow).

---

## 3. Functional Requirements

### FR-1: Admin Authentication
| ID | Requirement | Priority |
|----|------------|----------|
| FR-1.1 | Admin ke liye **alag login page** at `/admin/login` | P0 |
| FR-1.2 | Login = **username + password** (OTP nahi, regular users se alag) | P0 |
| FR-1.3 | Successful login → JWT (admin access + refresh token) | P0 |
| FR-1.4 | Admin routes `/admin/*` guard — bina login ke redirect `/admin/login` | P0 |
| FR-1.5 | Logout button | P0 |
| FR-1.6 | Failed login → clear error message | P1 |

> Admin account **database se create** hota hai (SQL query through), koi self-registration nahi.

### FR-2: Dashboard Overview (Home)
| ID | Requirement | Priority |
|----|------------|----------|
| FR-2.1 | **KPI cards** (top): Total Drivers, Total Riders, Rides Today, Revenue Today | P0 |
| FR-2.2 | **Live**: Drivers Online Abhi (count + list) | P0 |
| FR-2.3 | **Trend chart**: last 7 days — rides/day + revenue/day | P1 |
| FR-2.4 | Recent activity (last 10 rides) | P2 |

### FR-3: Driver Management
| ID | Requirement | Priority |
|----|------------|----------|
| FR-3.1 | List all drivers — table: name, phone, **vehicle number**, vehicle model, seats, status | P0 |
| FR-3.2 | Search (name / phone / vehicle number) | P0 |
| FR-3.3 | Pagination | P0 |
| FR-3.4 | **Per-driver detail view** (click → drawer/page): | P0 |
|     | - Vehicle number, model, seats, fare per rider | |
|     | - Today: rides count, riders count, earnings | |
|     | - Total: rides, riders, revenue, distance | |
|     | - Online/offline status | |
| FR-3.5 | **Block / Unblock** driver | P0 |
| FR-3.6 | Blocked driver: login/rides se rokna (backend guard) | P0 |

### FR-4: Rider Management
| ID | Requirement | Priority |
|----|------------|----------|
| FR-4.1 | List all riders — name, phone, signup date, total rides | P0 |
| FR-4.2 | Search (name / phone) | P0 |
| FR-4.3 | Pagination | P0 |
| FR-4.4 | Rider detail: total rides, last ride date | P1 |
| FR-4.5 | **Block / Unblock** rider | P0 |

### FR-5: Online Drivers (Live)
| ID | Requirement | Priority |
|----|------------|----------|
| FR-5.1 | Abhi kaunse drivers online — list: name, vehicle number, destination, available seats, status (ACTIVE/STARTED) | P0 |
| FR-5.2 | **Real-time refresh** (poll 15-30s ya WebSocket) | P1 |
| FR-5.3 | Total online count | P0 |

### FR-6: Block/Unblock System (cross-cutting)
| ID | Requirement | Priority |
|----|------------|----------|
| FR-6.1 | User model me `isActive` boolean (default true) | P0 |
| FR-6.2 | Blocked user: login rejected, all user/ride endpoints reject (403/401) | P0 |
| FR-6.3 | Active online session par block lagne par: session force-close | P1 |
| FR-6.4 | Admin UI me clear Blocked badge + Unblock action | P0 |

### FR-7: Responsive Design
| ID | Requirement | Priority |
|----|------------|----------|
| FR-7.1 | Phone: bottom nav ya hamburger, KPI cards stacked, tables → cards | P0 |
| FR-7.2 | Laptop/desktop: sidebar nav + data tables | P0 |
| FR-7.3 | shadcn/ui components throughout | P0 |

---

## 4. Non-Functional Requirements

- **Security**: Admin password bcrypt-hashed. Admin JWT secret `JWT_ADMIN_SECRET` alag. All admin APIs `AdminGuard`. Rate-limit login.
- **Performance**: Lists paginated (20/page). Online list from Redis (fast). Dashboard aggregates via SQL `GROUP BY`.
- **Reliability**: Failed admin API → JSON error with status. Frontend loading skeletons + empty states.
- **Compatibility**: Chrome/Safari mobile + desktop.

---

## 5. Out of Scope (v1.0)
- Fare editing / payment integration
- Driver payout system
- Multi-admin roles (superadmin vs admin)
- Real-time charts (WebSocket push) — polling sufficient
- Driver KYC/photo verification

---

## 6. Success Metrics
- Admin 1-click par kisi bhi driver/rider ki status + rides + earnings dekh sake
- Block/unblock < 5 sec
- 1000+ users par dashboard < 2s load

---

## 7. Pages Map (Frontend)

```
/admin/login                 → admin login (username+password)
/admin                       → dashboard (KPIs, online drivers, trend)
/admin/drivers               → drivers table + search + pagination
/admin/drivers/:id           → driver detail (stats + block/unblock)
/admin/riders                → riders table + search + pagination
/admin/riders/:id            → rider detail (block/unblock)
```

## 8. API Map (Backend) — `/api/v1/admin`

```
POST /admin/login                      → login (username+password → tokens)
POST /admin/refresh                    → refresh tokens
GET  /admin/me                         → current admin

GET  /admin/stats/overview             → KPIs (total drivers/riders, rides today, revenue today, online count)
GET  /admin/stats/trend?days=7         → daily rides+revenue (last 7 days)
GET  /admin/drivers?page&limit&search  → paginated drivers + per-driver today/total stats
GET  /admin/drivers/:driverProfileId   → driver detail stats
GET  /admin/riders?page&limit&search   → paginated riders
GET  /admin/riders/:userId             → rider detail
GET  /admin/online-drivers             → live online drivers (from Redis)
PATCH /admin/users/:userId/block       → block user
PATCH /admin/users/:userId/unblock     → unblock user
```

## 9. Dependencies / Schema Changes

- `User.isActive Boolean @default(true)` (new migration)
- `Admin` model: `id, username @unique, passwordHash, createdAt` (new migration)
- `Role` enum: `ADMIN` add karna optional (alag Admin table better hai — user flow se clean separation)
- `JWT_ADMIN_SECRET` env
- `AdminGuard` + `@Admin()` decorator
