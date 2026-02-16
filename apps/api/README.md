# API Backend (`apps/api`)

## Features

- **Auth-Modul**: Registrierung, Login, Logout, Passwort-Reset (JWT-basiert)
- **User-/Tenant-Modul**: Profilabruf/-update, Rollen (`user`, `admin`)
- **Billing-Modul**: Stripe Checkout Session + Webhook-Handling
- **Admin-Modul**: Benutzer- und Abo-Übersichten (nur Admin)

## Run

```bash
cd apps/api
npm install
npm run dev
```

## Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `GET /api/user/profile`
- `PATCH /api/user/profile`
- `POST /api/billing/checkout-session`
- `POST /api/billing/webhook`
- `GET /api/admin/users`
- `GET /api/admin/subscriptions`
