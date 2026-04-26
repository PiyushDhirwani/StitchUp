# StitchUp Backend

NestJS REST API for the StitchUp consumer-to-tailor stitching platform.

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | NestJS 11                               |
| Language       | TypeScript 5                            |
| ORM            | TypeORM 0.3                             |
| Database       | MySQL 8                                 |
| Cache / OTP    | Redis (ioredis)                         |
| Auth           | JWT (passport-jwt) + Email OTP login    |
| Email          | Nodemailer (Gmail SMTP)                 |
| Validation     | class-validator / class-transformer     |
| API Docs       | Swagger (via @nestjs/swagger)           |
| Rate Limiting  | @nestjs/throttler                       |

---

## Prerequisites

- **Node.js** >= 18
- **MySQL** 8.x running locally (or via Docker)
- **Redis** running locally (or via Docker)

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create environment file

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. Key variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=<your_mysql_password>
DB_NAME=stitchup_db

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=<random_32+_char_secret>
JWT_REFRESH_SECRET=<another_random_secret>

# Gmail SMTP for email OTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_NAME=StitchUp

NODE_ENV=development
```

#### Setting up Gmail App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Ensure **2-Factor Authentication** is enabled on the Google account
3. Select **"Mail"** as the app and generate a password
4. Copy the 16-character code into `SMTP_PASS` in `.env`

> **Note**: Gmail allows ~500 emails/day on free accounts — plenty for development and early usage.

### 3. Create the database and tables

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS stitchup_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run all schema files in order
for f in ../db/{01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23}_*.sql; do
  echo "Running: $(basename $f)"
  mysql -u root -p stitchup_db < "$f"
done
```

This creates all **31 tables** with seed data (roles, template types, materials, pricing config, etc.).

### 4. Start Redis

```bash
# macOS (Homebrew)
brew services start redis

# Or run directly
redis-server
```

### 5. Start the server

```bash
# Development (hot-reload)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at:
- **API**: http://localhost:3000/api
- **Swagger UI**: http://localhost:3000/docs

---

## Email OTP Authentication

All authentication uses **email-based OTP verification** via Gmail SMTP (Nodemailer). No SMS provider needed.

### Registration Flow

Registration data is **cached in Redis** — nothing is written to the database until the email is verified.

1. **Register** a consumer or tailor:
   ```bash
   curl -X POST http://localhost:3000/api/auth/consumer/register \
     -H "Content-Type: application/json" \
     -d '{
       "first_name": "John",
       "last_name": "Doe",
       "email": "john@example.com",
       "phone_number": "9876543210",
       "password": "password123!",
       "address_line1": "123 Main Street",
       "city": "Mumbai",
       "state": "Maharashtra",
       "postal_code": "400001"
     }'
   ```
   Response includes `session_id` and `otp_expiry_seconds` in `data`. **No DB entry yet.**

2. **Check your email** for the 6-digit verification code.

3. **Verify OTP** to complete registration and get tokens:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login/verify-otp \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "otp": "482917",
       "session_id": "sess_abc123xyz456"
     }'
   ```
   On success: user is persisted to DB, and `auth_token` + `refresh_token` are returned.

### Login Flow (returning users)

1. **Request OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login/request-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "john@example.com"}'
   ```
2. **Verify OTP** using the same `/verify-otp` endpoint as above.

### Fallback

If email sending fails (e.g., SMTP misconfigured), the OTP is **logged to the server console** so you can still test:
```
[AuthService] [FALLBACK] OTP for john@example.com: 482917
```

### Redis inspection

```bash
redis-cli KEYS 'otp:*'                       # List all OTP sessions
redis-cli GET "otp:sess_abc123xyz456"         # View session data + OTP
redis-cli TTL "otp:sess_abc123xyz456"         # Seconds until expiry
```

---

## API Endpoints

| Method | Endpoint                                       | Description                        | Auth |
| ------ | ---------------------------------------------- | ---------------------------------- | ---- |
| POST   | `/api/auth/consumer/register`                  | Register consumer (sends email OTP) | No   |
| POST   | `/api/auth/tailor/register`                    | Register tailor (sends email OTP)  | No   |
| POST   | `/api/auth/login/request-otp`                  | Request login OTP via email        | No   |
| POST   | `/api/auth/login/verify-otp`                   | Verify OTP → get tokens / complete registration | No   |
| GET    | `/api/user/details/:userId`                    | Get user profile                   | JWT  |
| PUT    | `/api/user/details/:userId`                    | Update user profile                | JWT  |
| GET    | `/api/templates`                               | List all template types            | No   |
| GET    | `/api/templates/:templateId`                   | Get template details               | No   |
| GET    | `/api/templates/:templateId/:subTemplateId`    | Get sub-type details               | No   |
| POST   | `/api/pricing/calculate`                       | Calculate order price               | JWT  |
| GET    | `/api/pricing/materials`                       | List materials with pricing        | No   |
| GET    | `/api/pricing/customizations`                  | List customizations with pricing   | No   |
| POST   | `/api/orders`                                  | Place a new order                  | JWT  |
| GET    | `/api/orders/history/:userId`                  | Get order history                  | JWT  |
| GET    | `/api/orders/:orderId`                         | Get full order details             | JWT  |
| PUT    | `/api/orders/:orderId/status`                  | Update order status                | JWT  |

See the interactive **Swagger UI** at `/docs` for full request/response schemas and a "Try it out" button.

For the complete endpoint reference, see [docs/api/ENDPOINTS.md](./docs/api/ENDPOINTS.md).

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts                           # App bootstrap, Swagger, CORS, global pipes
│   ├── app.module.ts                     # Root module (TypeORM, Config, Throttler, Auth)
│   │
│   ├── config/
│   │   ├── database.config.ts            # TypeORM MySQL connection config
│   │   └── redis.config.ts               # Redis client factory
│   │
│   ├── common/
│   │   ├── constants/
│   │   │   └── error-codes.ts            # Standardized error code constants
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts # @CurrentUser() param decorator
│   │   │   └── roles.decorator.ts        # @Roles() metadata decorator
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Global exception handler
│   │   ├── guards/
│   │   │   └── roles.guard.ts            # Role-based access guard
│   │   ├── interceptors/
│   │   │   └── response.interceptor.ts   # Standardized API response wrapper
│   │   └── services/
│   │       └── email.service.ts          # Gmail SMTP email sender (Nodemailer)
│   │
│   ├── entities/                         # TypeORM entities (22 + 9 pricing)
│   │   ├── user-role.entity.ts
│   │   ├── user.entity.ts
│   │   ├── ...                           # (see full list in docs)
│   │   └── pricing/                      # 9 pricing entities
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts           # Registration cached in Redis, DB write on OTP verify
│       │   ├── dto/
│       │   │   ├── register-consumer.dto.ts
│       │   │   ├── register-tailor.dto.ts
│       │   │   └── login.dto.ts          # Email-based OTP DTOs
│       │   └── strategies/
│       │       └── jwt.strategy.ts
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   └── dto/
│       │       ├── update-consumer-profile.dto.ts
│       │       └── update-tailor-profile.dto.ts
│       ├── templates/
│       │   ├── templates.module.ts
│       │   ├── templates.controller.ts
│       │   └── templates.service.ts
│       ├── pricing/
│       │   ├── pricing.module.ts
│       │   ├── pricing.controller.ts
│       │   ├── pricing.service.ts
│       │   └── dto/
│       │       └── calculate-price.dto.ts
│       └── orders/
│           ├── orders.module.ts
│           ├── orders.controller.ts
│           ├── orders.service.ts
│           └── dto/
│               ├── create-order.dto.ts
│               └── update-order-status.dto.ts
│
├── docs/api/                             # API documentation
│   ├── README.md
│   ├── ENDPOINTS.md
│   ├── AUTH_FLOW.md
│   ├── PRICING_AND_ORDER_FLOW.md
│   └── IMPLEMENTATION_NOTES.md
│
├── docker-compose.yml                    # MySQL + Redis + App (optional)
├── Dockerfile
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env.example
└── .prettierrc
```

---

## Database

**31 tables** across 23 SQL files in `../db/`:

| Group                | Tables                                                                                  |
| -------------------- | --------------------------------------------------------------------------------------- |
| **Users & Roles**    | `user_roles`, `users`, `user_consumer`, `body_measurements`, `user_tailor`, `tailor_verification`, `tailor_bank_details` |
| **Templates**        | `template_type`, `template_sub_type`, `material`                                         |
| **Orders**           | `orders`, `order_items`, `order_details`, `order_status_history`, `consumer_tailor_match`, `appointments` |
| **Payments**         | `payment_methods`, `payment_transactions`                                                |
| **Feedback**         | `ratings_reviews`, `support_tickets`                                                     |
| **System**           | `notifications`, `audit_logs`                                                            |
| **Pricing (9)**      | `template_type_pricing`, `template_sub_type_pricing`, `material_pricing_multiplier`, `body_config_pricing`, `customization_pricing`, `urgency_pricing`, `discount_pricing`, `pricing_calculation_history`, `tailor_custom_pricing` |

All tables use **soft deletes** (status fields) — no hard deletes.

---

## Standard API Response Format

### Success

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-26T10:00:00.000Z",
    "request_id": "uuid-v4"
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": "Optional additional context"
  },
  "meta": {
    "timestamp": "2026-04-26T10:00:00.000Z",
    "request_id": "uuid-v4",
    "path": "/api/auth/login/verify-otp"
  }
}
```

---

## Scripts

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `npm run start:dev`  | Start with hot-reload              |
| `npm run build`      | Compile TypeScript to `dist/`      |
| `npm run start:prod` | Run compiled build                 |
| `npm run lint`       | Run ESLint                         |
| `npm run format`     | Run Prettier                       |
| `npm test`           | Run unit tests                     |
| `npm run test:e2e`   | Run e2e tests                      |
| `npm run test:cov`   | Run tests with coverage            |

---

## Environment Variables

See [.env.example](./.env.example) for the full list. Key groups:

- **Database**: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- **Redis**: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- **JWT**: `JWT_SECRET`, `JWT_EXPIRY`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRY`
- **OTP**: `OTP_LENGTH`, `OTP_EXPIRY_SECONDS`, `MAX_OTP_ATTEMPTS`
- **Email (Gmail SMTP)**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_NAME`
- **Rate Limiting**: `THROTTLE_TTL`, `THROTTLE_LIMIT`

---

## Docker (optional)

If you have Docker installed:

```bash
docker compose up mysql redis -d    # Start MySQL + Redis
docker compose up -d                # Start everything including the app
```

MySQL init scripts from `../db/` are mounted and run automatically on first start.

---

## Remaining Work

- [x] Auth module — email OTP registration & login (Redis-cached until verified)
- [x] Users module — profile CRUD, consumer/tailor profile updates
- [x] Templates module — list template types, sub-types, materials
- [x] Pricing module — price calculation endpoint
- [x] Orders module — place order, update status, list orders
- [ ] Reviews module — submit/view ratings
- [ ] Appointments module — scheduling
- [ ] Notifications module — list/mark-read
- [ ] Support module — create/manage tickets
- [ ] Unit & e2e tests
