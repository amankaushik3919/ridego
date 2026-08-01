# RideGo — Admin Dashboard TRD (Technical Design)

## 1. Tech Stack (existing)
- **Frontend**: Next.js 16 App Router, TypeScript, shadcn/ui, Tailwind v4, axios, zustand
- **Backend**: NestJS 11, Prisma 6 + Supabase Postgres, Upstash Redis, Socket.IO
- Global prefix: `/api/v1` | JWT access 15m + refresh 7d

---

## 2. Database Changes (Prisma schema)

### 2.1 New `Admin` model
```prisma
model Admin {
  id           String   @id @default(uuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
}
```

### 2.2 `User.isActive` (block/unblock)
```prisma
model User {
  id        String   @id @default(uuid())
  phone     String   @unique
  name      String?
  role      Role?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  driverProfile DriverProfile?
  ridesTaken    RideRider[]
}
```

### 2.3 Migration
```bash
cd rider-backend
npx prisma migrate dev --name add_admin_and_user_active
```

---

## 3. Admin SQL Setup (seed — aap ise chalaoge)

Migration ke baad **Supabase SQL Editor** me chalao. Ye admin bana dega **username `admin` / password `Admin@123`** — password hash khud generate hota hai (pgcrypto `crypt` = bcrypt-compatible).

```sql
-- 1) pgcrypto extension enable (agar pehle se nahi)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Admin banao — username/password yahan change karo
INSERT INTO "Admin" (id, username, "passwordHash", "createdAt")
VALUES (
  gen_random_uuid(),
  'admin',
  crypt('Admin@123', gen_salt('bf', 10)),
  now()
)
ON CONFLICT (username) DO NOTHING;

-- 3) Verify
SELECT username, "createdAt" FROM "Admin";
```

> **Password badalne ke liye** dobara insert karne ki jagah UPDATE:
> ```sql
> UPDATE "Admin" SET "passwordHash" = crypt('NayaPassword', gen_salt('bf', 10)) WHERE username = 'admin';
> ```
>
> Backend me bcryptjs `compare()` se verify hoga — pgcrypto ka `$2a$` hash bcryptjs ke saath compatible hai.

---

## 4. Backend — Auth

### 4.1 `JWT_ADMIN_SECRET` (alag secret)
`.env` me:
```
JWT_ADMIN_SECRET=admin-access-super-secret
JWT_ADMIN_REFRESH_SECRET=admin-refresh-super-secret
JWT_ADMIN_ACCESS_EXPIRY=1h
JWT_ADMIN_REFRESH_EXPIRY=7d
```

### 4.2 JWT payload (admin)
```ts
const payload = { sub: adminId, type: 'admin', username };
// signed with JWT_ADMIN_SECRET
```

### 4.3 Admin module structure
```
src/admin/
├── admin.module.ts
├── admin.controller.ts      // POST /login, /refresh, GET /me
├── admin.service.ts         // validateAdmin, generateTokens, refresh
├── admin.dashboard.controller.ts  // stats, drivers, riders, online
├── admin.dashboard.service.ts
├── dto/
│   ├── admin-login.dto.ts
│   └── pagination.dto.ts
├── guards/
│   ├── admin-jwt.strategy.ts
│   └── admin-auth.guard.ts
```

### 4.4 Login flow
```ts
async login(username: string, password: string) {
  const admin = await this.prisma.admin.findUnique({ where: { username } });
  if (!admin) throw new UnauthorizedException('Invalid credentials');
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw new UnauthorizedException('Invalid credentials');
  return this.generateTokens(admin);
}
```

### 4.5 `AdminAuthGuard`
```ts
@Injectable()
export class AdminAuthGuard extends AuthGuard('admin-jwt') {}
```
- Sab admin endpoints par `@UseGuards(AdminAuthGuard)`.
- `req.admin = { adminId, username }`

---

## 5. Backend — Dashboard Service (aggregations)

### 5.1 `stats/overview` — KPIs
```ts
const todayStart = new Date(); todayStart.setHours(0,0,0,0);

const [drivers, riders, todayRides, onlineCount, revenueAgg] = await Promise.all([
  prisma.driverProfile.count(),
  prisma.user.count({ where: { role: { in: ['RIDER','BOTH'] } } }),
  prisma.ride.count({ where: { status: 'COMPLETED', completedAt: { gte: todayStart } } }),
  sessionRepo.listActiveIndex().then(s => s.length),   // Redis
  prisma.ride.aggregate({
    where: { status: 'COMPLETED', completedAt: { gte: todayStart } },
    _sum: { seatsBooked: true },
  }),
]);

// revenue = sum(seatsBooked × driver.farePerRider) — aggregate join
```

Revenue ke liye farePerRider per driver alag hai, isliye join karke compute:
```ts
const rows = await prisma.ride.findMany({
  where: { status: 'COMPLETED', completedAt: { gte: todayStart } },
  select: { seatsBooked: true, driver: { select: { farePerRider: true } } },
});
const revenueToday = rows.reduce((s, r) => s + r.seatsBooked * (r.driver.farePerRider ?? 0), 0);
```

**Response:**
```json
{
  "totalDrivers": 45, "totalRiders": 220,
  "ridesToday": 68, "revenueToday": 3400,
  "driversOnline": 12
}
```

### 5.2 `stats/trend?days=7`
```ts
const start = new Date(); start.setDate(start.getDate() - 7);
const rides = await prisma.ride.findMany({
  where: { status: 'COMPLETED', completedAt: { gte: start } },
  select: { completedAt: true, seatsBooked: true, driver: { select: { farePerRider: true } } },
});
// group by YYYY-MM-DD → { date, rides, revenue }
```

### 5.3 `drivers?page&limit&search` — paginated + stats
```ts
const where = search ? {
  OR: [
    { user: { name: { contains: search, mode: 'insensitive' } } },
    { user: { phone: { contains: search } } },
    { vehicleNumber: { contains: search, mode: 'insensitive' } },
  ],
} : {};

const [total, drivers] = await Promise.all([
  prisma.driverProfile.count({ where }),
  prisma.driverProfile.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    skip: (page-1)*limit, take: limit,
  }),
]);
```
**Per-driver today/total stats** — batching se (N+1 avoid):
```ts
const ids = drivers.map(d => d.id);
const [today, total] = await Promise.all([
  prisma.ride.groupBy({
    by: ['driverId'],
    where: { driverId: { in: ids }, status: 'COMPLETED', completedAt: { gte: todayStart } },
    _count: { id: true }, _sum: { seatsBooked: true },
  }),
  prisma.ride.groupBy({
    by: ['driverId'],
    where: { driverId: { in: ids }, status: 'COMPLETED' },
    _count: { id: true }, _sum: { seatsBooked: true },
  }),
]);
```

**Response:**
```json
{
  "items": [{
    "driverId": "dp_1", "userId": "u_1",
    "name": "Ramesh", "phone": "+9198...", "vehicleNumber": "UP32 ET 1234",
    "vehicleModel": "EV", "totalSeats": 4, "farePerRider": 10,
    "isActive": true,
    "today": { "rides": 6, "riders": 14, "revenue": 140 },
    "total": { "rides": 120, "riders": 310, "revenue": 3100 },
    "isOnline": true
  }],
  "total": 45, "page": 1, "limit": 20
}
```

### 5.4 `drivers/:driverProfileId`
Single driver: today + total stats + destinations + online status + last 10 rides.

### 5.5 `riders?page&limit&search`
```ts
const where = search ? {
  AND: [
    { role: { in: ['RIDER','BOTH'] } },
    { OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]},
  ],
} : { role: { in: ['RIDER','BOTH'] } };

const riders = await prisma.user.findMany({
  where, include: { _count: { select: { ridesTaken: true } } },
  skip, take, orderBy: { createdAt: 'desc' },
});
```

### 5.6 `online-drivers` (Redis)
```ts
const sessionIds = await sessionRepo.listActiveIndex();  // sessions:active:index
const online = [];
for (const id of sessionIds) {
  const s = await sessionRepo.getSession(id);  // { driverId, destination, availableSeats, totalSeats, status }
  const profile = await prisma.driverProfile.findUnique({ where: { id: s.driverId }, include: { user: true } });
  online.push({ sessionId: id, name, phone, vehicleNumber, destination, availableSeats, totalSeats, status });
}
```
N+1 se bachne ke liye profiles ko batch fetch (`findMany where id in`).

### 5.7 Block/Unblock
```ts
@Patch('users/:userId/block')
async blockUser(userId: string) {
  // force-close active session agar online ho
  const driverProfile = await prisma.driverProfile.findUnique({ where: { userId } });
  if (driverProfile) {
    const active = await sessionRepo.getDriverActiveSession(userId);
    if (active) {
      await rideCompletionService.finalizeSession(active, 'CANCELLED');
    }
  }
  return prisma.user.update({ where: { id: userId }, data: { isActive: false } });
}
```

### 5.8 Login guard — blocked user reject
`JwtStrategy.validate` me:
```ts
const user = await prisma.user.findUnique({ where: { id: payload.sub } });
if (!user || !user.isActive) throw new UnauthorizedException('Account is blocked');
```

---

## 6. Backend — module wiring (`app.module.ts`)
```ts
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  ScheduleModule.forRoot(),
  PrismaModule, RedisModule, AuthModule, UsersModule, RidesModule,
  AdminModule,  // ← new
]
```

### Dependencies
- `bcrypt` package install: `pnpm add bcrypt @types/bcrypt -D` (ya bcryptjs — no native build)
- `AdminAuthGuard` + `JwtModule` with admin secrets

---

## 7. Frontend

### 7.1 Routes
```
src/app/admin/
├── layout.tsx            // AdminShell: sidebar (desktop) / bottom-nav or hamburger (mobile) + AdminGuard
├── login/page.tsx        // username + password form
├── page.tsx              // dashboard overview
├── drivers/page.tsx
├── drivers/[id]/page.tsx // (ya drawer)
├── riders/page.tsx
└── riders/[id]/page.tsx
```

### 7.2 AdminGuard (client)
```tsx
// zustand admin-store: adminToken, adminUser, login/logout
// AdminGuard: bina token → <LoginRedirect> /admin/login
```

### 7.3 API client (`src/lib/api/admin.ts`)
```ts
export const adminApi = {
  login: (username, password) => axios.post(`${API_URL}/admin/login`, { username, password }),
  me: () => adminClient.get('/admin/me'),
  overview: () => adminClient.get('/admin/stats/overview'),
  trend: (days=7) => adminClient.get('/admin/stats/trend', { params: { days } }),
  drivers: (page, limit, search) => adminClient.get('/admin/drivers', { params: { page, limit, search } }),
  driverDetail: (id) => adminClient.get(`/admin/drivers/${id}`),
  riders: (page, limit, search) => adminClient.get('/admin/riders', { params: { page, limit, search } }),
  onlineDrivers: () => adminClient.get('/admin/online-drivers'),
  blockUser: (userId) => adminClient.patch(`/admin/users/${userId}/block`),
  unblockUser: (userId) => adminClient.patch(`/admin/users/${userId}/unblock`),
};
```

### 7.4 Pages + shadcn components

| Page | shadcn components |
|------|------------------|
| Login | `Card, Input, Button, Label` |
| Overview | `Card, Badge, Skeleton` + chart (custom svg/`recharts` optional) |
| Drivers/Riders table | `Table, Input(search), Button, Badge, Skeleton, Pagination` |
| Detail | `Dialog` (drawer on mobile) / `Tabs` (Today/Total/History) |
| Online drivers | `Card` list / `Table`, `Badge` (ACTIVE green / STARTED blue) |
| Block/Unblock | `Button` + `AlertDialog` confirm |

### 7.5 Responsive strategy
- **Desktop (≥768px)**: left `Sidebar` nav (shadcn `NavigationMenu` ya custom), data `Table`.
- **Mobile**: hamburger menu ya bottom nav (existing `BottomNav` pattern), tables ko **Card list** me transform (`hidden md:table` + mobile card layout).
- KPI cards: `grid grid-cols-2 md:grid-cols-4`.

---

## 8. Security Checklist
- [ ] Admin login `bcrypt.compare` + generic error (username/password info leak na ho)
- [ ] `JWT_ADMIN_SECRET` production me alag strong secret
- [ ] All admin routes `AdminAuthGuard`
- [ ] Blocked user guard in `JwtStrategy.validate`
- [ ] Admin login rate-limit (Redis counter)
- [ ] No admin data in regular user responses

---

## 9. Implementation Order
1. Schema: `Admin` + `User.isActive` → migration
2. Admin SQL seed (chalao, login testable)
3. Backend: admin auth (login/refresh/me) + `AdminAuthGuard`
4. Backend: stats overview + trend
5. Backend: drivers list/detail, riders list/detail, online drivers
6. Backend: block/unblock + guard integration
7. Frontend: admin store + api client + guard + login page
8. Frontend: overview page
9. Frontend: drivers/riders pages (responsive)
10. Test + polish

---

## 10. Test Plan (sanity)
1. SQL seed se admin login (username+password) ✔
2. Wrong password → error ✔
3. `/admin` bina login → redirect `/admin/login` ✔
4. Overview KPIs match DB (`SELECT count(*) FROM "DriverProfile"`) ✔
5. Block driver → driver login reject + online session closed ✔
6. Unblock → phir se kaam ✔
7. Mobile (375px) + desktop (1440px) par saari pages ✔
