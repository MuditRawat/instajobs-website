# Instajob — AuthX Integration

Base path: `/api/v1`.

## Credentials (production)

| Key | Value |
|---|---|
| `X-Project-Key` | `your-authx-project-key-here` |

Send `X-Project-Key` on every call below. Keep it secret (backend only).
Enabled methods: `WHATSAPP_OTP`, `EMAIL_OTP`.

## Response envelope

```json
{ "statusCode": 200, "responseStatus": "SUCCESS", "responseCode": "SUCCESS", "message": "...", "responseData": {} }
```
Errors use the same shape with `responseStatus: "ERROR"` and a machine
`responseCode` — branch on that, not on `message`.

## Login flow

**1. `POST /authx/start`** — `{ "identifier": "+919876543210" }`
→ `{ requestId, flow, methods: ["WHATSAPP_OTP","EMAIL_OTP"] }`

**2. `POST /authx/send-otp`** — `{ requestId, method: "WHATSAPP_OTP" }`
→ OTP delivered via WhatsApp. `requestId` expires in 5 min;
max 5 sends, 30s cooldown between sends.

**3. `POST /authx/verify`** — `{ requestId, method: "WHATSAPP_OTP", otp: "123456" }`
→ `{ accessToken, refreshToken, expiresIn, scope, user }`
Max 5 wrong attempts per `requestId`.

`accessToken` is an RS256 JWT (verify against `GET /.well-known/jwks.json`).
`refreshToken` is an opaque string, store it securely.

## Session

- **`POST /authx/refresh`** — `{ refreshToken }` → `{ accessToken, expiresIn }` (refresh token itself is not rotated)
- **`POST /authx/logout`** — `Authorization: Bearer <accessToken>`, no body → revokes current session

## Common errors

| responseCode | HTTP | Meaning |
|---|---|---|
| `INVALID_PROJECT_KEY` | 401 | Bad/missing `X-Project-Key` |
| `RATE_LIMITED` | 403 | >10 `/start` calls/min from this IP |
| `REQUEST_EXPIRED` | 400 | `requestId` unknown or past 5 min |
| `INVALID_OTP` | 400 | Wrong code |
| `MAX_ATTEMPTS` | 403 | 5 wrong attempts — restart from `/start` |
| `OTP_SEND_LIMIT_EXCEEDED` / `OTP_SEND_COOLDOWN` | 403 | Resend abuse |
| `TOKEN_EXPIRED` | 403 | Access token expired — call `/refresh` |
| `INVALID_REFRESH_TOKEN` / `REFRESH_TOKEN_EXPIRED` | 401 | Refresh token bad/expired — re-login |
| `SESSION_REVOKED` | 401 | Session was logged out elsewhere |

## curl example

```bash
curl -X POST https://auth.surefy.co/api/v1/authx/start \
  -H "X-Project-Key: your-authx-project-key-here" \
  -H "Content-Type: application/json" \
  -d '{"identifier":"9999999999"}'

curl -X POST https://auth.surefy.co/api/v1/authx/send-otp \
  -H "Content-Type: application/json" \
  -d '{"requestId":"<id>","method":"WHATSAPP_OTP"}'

curl -X POST https://auth.surefy.co/api/v1/authx/verify \
  -H "Content-Type: application/json" \
  -d '{"requestId":"<id>","method":"WHATSAPP_OTP","otp":"123456"}'

curl -X POST https://auth.surefy.co/api/v1/authx/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'

curl -X POST https://auth.surefy.co/api/v1/authx/logout \
  -H "Authorization: Bearer <accessToken>"
```

---

## How to implement (server side)

Verify the `accessToken` locally on every protected API request — no call back to AuthX per
request.

```env
AUTHX_BASE_URL=https://auth.surefy.co
AUTHX_PROJECT_KEY=your-authx-project-key-here
```

```bash
pnpm add jwks-rsa jsonwebtoken
pnpm add -D @types/jsonwebtoken
```

```ts
import { Request, Response, NextFunction } from 'express'
import jwt, { TokenExpiredError, JwtHeader, SigningKeyCallback } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const client = jwksClient({
  jwksUri: `${process.env.AUTHX_BASE_URL}/api/v1/.well-known/jwks.json`,
  cache: true,
  cacheMaxAge: 3_600_000,   // 1 hour
  rateLimit: true,
  jwksRequestsPerMinute: 10,
})

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => callback(err, key?.getPublicKey()))
}

export interface AuthxPayload {
  sub: string          // AuthX internal userId (uuid)
  surefyId: string      // usr_XXXXXXXX
  scope: 'PLATFORM' | 'PROJECT' | 'COMPANY'
  projectId?: string
  companyId?: string
  sessionId: string
  iat: number
  exp: number
}

declare global {
  namespace Express { interface Request { authxUser?: AuthxPayload } }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, payload) => {
    if (err instanceof TokenExpiredError) {
      return res.status(403).json({ success: false, message: 'Token expired' })
    }
    if (err || !payload) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    req.authxUser = payload as AuthxPayload
    next()
  })
}
```

Instajob's project id (`req.authxUser.projectId`): `06387796-e643-4f32-9bcd-c68b02cb1d60`.

---

## Phase 2 Implementation Details

### 1. Identity Mapping & Onboarding Architecture

```text
AuthX JWT (sub)
   ↓
users.authx_user_id
   ↓
users.id (Internal Primary Key)
   ↓
candidate_profiles / employer_profiles
```

- **Existing User Resolution**: Upon `POST /api/v1/authx/verify`, the backend resolves `users.authx_user_id = sub`. If found, existing `users.id` and `users.role` are used directly without creating duplicate accounts.
- **Strict Identity Mapping (No Automatic Email Linking)**: A verified AuthX identity ONLY maps to an existing account via `users.authx_user_id = sub`. Unmapped AuthX logins will NEVER automatically inherit an existing Supabase account merely because the email matches. If an email collision occurs with an unmapped account, a new distinct AuthX identity account is created.
- **New User Onboarding**: If `authx_user_id` does not exist, a new InstaJobs `users` row is created with `authx_user_id = sub`, `email = identifier`, `role = selectedRole` ('candidate' or 'employer'), and an associated profile row in `candidate_profiles` or `employer_profiles`.
- **Role Security**: Role selection applies ONLY during new user onboarding. Existing user roles are authoritative and cannot be modified by client requests.
- **Account Linking Policy**: Unsafe client-supplied account linking (`/api/v1/authx/link-account`) is disabled and removed.

### 2. Unified Authentication Middleware & Coexistence

- **`unifiedAuthMiddleware`**: All protected business APIs (`/api/candidate/*`, `/api/employer/*`, `/api/auth/me`) are protected by a unified middleware that supports both AuthX RS256 Bearer JWTs and Supabase Auth HS256 tokens.
- **Token Verification**: Automatically inspects token headers to verify RS256 JWKS tokens via AuthX or HS256 tokens via Supabase Auth, attaching standard `req.user = { id, email, role }` for downstream controllers.
- **AuthX Session Storage**: `instajobs_authx_access_token`, `instajobs_authx_refresh_token`, `instajobs_authx_user` managed in `localStorage`.
- **Token Refresh**: Token expiry triggers `/api/v1/authx/refresh` automatically. Refresh failure clears session state cleanly.
- **Supabase Auth Coexistence**: Supabase password login and registration remain fully functional as a temporary fallback.

### 3. API Routes

- `POST /api/v1/authx/start` — Start OTP flow (`identifier`)
- `POST /api/v1/authx/send-otp` — Send OTP (`requestId`, `method`)
- `POST /api/v1/authx/verify` — Verify OTP & map/onboard user (`requestId`, `method`, `otp`, `role`, `identifier`)
- `POST /api/v1/authx/refresh` — Refresh access token (`refreshToken`)
- `POST /api/v1/authx/logout` — Revoke active AuthX session (`Authorization: Bearer <accessToken>`)
- `GET  /api/v1/authx/me` — Protected endpoint returning active AuthX identity & InstaJobs user record

