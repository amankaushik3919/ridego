1. Project Setup — Next.js (App Router) + TypeScript + Tailwind + shadcn/ui init
2. API & Socket Client Layer — fetch wrapper (auth token handling, refresh logic), socket.io client setup
3. Auth Module — single-screen phone+OTP login/signup, token storage, protected route middleware
4. Shared Layout & Role Routing — after login, rider vs driver ke alag dashboards, shadcn layout components
5. Driver Module — profile/become-driver form, go-online screen (destination+distance), live QR display, active riders list, end-ride button
6. Rider Module — nearby rickshaws list/map, QR scanner (camera), seat confirm+lock screen, active ride tracker
7. Real-time Integration — socket connection wiring into driver/rider screens (seat updates, session-ended events)
