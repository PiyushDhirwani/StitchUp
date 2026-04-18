# Authentication Flow & OTP Implementation

## Complete OTP-Based Login Flow

### Overview
The StitchUp platform uses **phone number + OTP-based authentication** instead of traditional password login. This provides better security and user experience for the Indian market.

---

## Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  User Opens App                                     │
│  Enters Phone Number (10 digits)                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Click "Send OTP"                                   │
│  POST /auth/login/request-otp                       │
│  Body: { phone_number: "9876543210" }               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Backend:                                           │
│  1. Check if phone exists                           │
│  2. Generate 6-digit OTP                            │
│  3. Store in cache (Redis) with expiry = 5 min      │
│  4. Send OTP via SMS (Twilio/AWS SNS)               │
│  5. Return session_id                               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Response: 200 OK                                   │
│  {                                                  │
│    "success": true,                                 │
│    "message": "OTP sent",                           │
│    "session_id": "sess_123abc",                     │
│    "otp_expiry_seconds": 300                        │
│  }                                                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  User Receives SMS with OTP                         │
│  Enters 6-digit OTP in app                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Click "Verify OTP"                                 │
│  POST /auth/login/verify-otp                        │
│  Body: {                                            │
│    phone_number: "9876543210",                      │
│    otp: "123456",                                   │
│    session_id: "sess_123abc"                        │
│  }                                                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Backend:                                           │
│  1. Validate session_id is valid                    │
│  2. Retrieve cached OTP                             │
│  3. Compare with provided OTP                       │
│  4. If valid: Delete OTP from cache                 │
│  5. Generate JWT auth token                         │
│  6. Generate refresh token                          │
│  7. Update user.last_login                          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  Response: 200 OK                                   │
│  {                                                  │
│    "success": true,                                 │
│    "data": { user, role, ... },                     │
│    "auth_token": "eyJhbGci...",                    │
│    "refresh_token": "eyJhbGci...",                 │
│    "token_expiry_seconds": 86400                    │
│  }                                                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  App Stores:                                        │
│  • auth_token (in memory, secure storage)           │
│  • refresh_token (in device encrypted storage)      │
│  • user data (for offline access)                   │
│  • User logged in ✓                                 │
└─────────────────────────────────────────────────────┘
```

---

## Detailed Implementation

### Step 1: Request OTP

**Endpoint:** `POST /auth/login/request-otp`

**Request:**
```json
{
  "phone_number": "9876543210"
}
```

**Backend Logic:**
```python
def request_otp(phone_number):
    # Validate phone format
    if not is_valid_phone(phone_number):
        return error("Invalid phone format")

    # Check if user exists
    user = User.find_by_phone(phone_number)
    if not user:
        return error("Phone number not registered")

    # Generate 6-digit OTP
    otp = generate_random_otp(6)  # e.g., "123456"

    # Store in Redis with 5 minute expiry
    session_id = generate_session_id()
    cache.set(
        key=f"otp:{session_id}",
        value=otp,
        expiry=300  # 5 minutes
    )

    # Attempt counter (prevent brute force)
    cache.set(
        key=f"otp_attempts:{session_id}",
        value=0,
        expiry=300
    )

    # Send OTP via SMS
    send_sms(phone_number, f"Your StitchUp OTP is: {otp}")

    return {
        "session_id": session_id,
        "otp_expiry_seconds": 300
    }
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to 9876543210",
  "phone_number": "9876543210",
  "session_id": "sess_abc123xyz789",
  "otp_expiry_seconds": 300,
  "resend_after_seconds": 30
}
```

**Error Scenarios:**
- Phone number not registered → 404
- Invalid phone format → 400
- Rate limit (too many attempts) → 429
- SMS service unavailable → 503

---

### Step 2: Verify OTP & Login

**Endpoint:** `POST /auth/login/verify-otp`

**Request:**
```json
{
  "phone_number": "9876543210",
  "otp": "123456",
  "session_id": "sess_abc123xyz789"
}
```

**Backend Logic:**
```python
def verify_otp(phone_number, otp, session_id):
    # Validate session_id
    cache_key = f"otp:{session_id}"
    stored_otp = cache.get(cache_key)

    if not stored_otp:
        return error("OTP expired or invalid session")

    # Check attempt limit (prevent brute force)
    attempts_key = f"otp_attempts:{session_id}"
    attempts = cache.get(attempts_key) or 0

    if attempts >= 5:
        cache.delete(cache_key)
        return error("Too many attempts, request new OTP")

    # Verify OTP
    if otp != stored_otp:
        cache.increment(attempts_key)
        return error("Invalid OTP")

    # Clear OTP from cache
    cache.delete(cache_key)
    cache.delete(attempts_key)

    # Find user
    user = User.find_by_phone(phone_number)
    if not user:
        return error("User not found")

    # Generate tokens
    auth_token = jwt.encode({
        "user_id": user.id,
        "role": user.role.name,
        "iat": datetime.now(),
        "exp": datetime.now() + timedelta(hours=24)
    })

    refresh_token = jwt.encode({
        "user_id": user.id,
        "iat": datetime.now(),
        "exp": datetime.now() + timedelta(days=30)
    })

    # Update last login
    user.last_login = datetime.now()
    user.save()

    # Log in audit trail
    AuditLog.create({
        "user_id": user.id,
        "action": "login",
        "ip_address": request.remote_addr,
        "user_agent": request.headers.get("User-Agent")
    })

    return {
        "auth_token": auth_token,
        "refresh_token": refresh_token,
        "token_expiry_seconds": 86400,
        "user": {
            "user_id": user.id,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role.name,
            "first_name": user.first_name
        }
    }
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": 123,
    "email": "consumer@example.com",
    "phone_number": "9876543210",
    "first_name": "John",
    "role": "consumer",
    "consumer_id": 45
  },
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expiry_seconds": 86400
}
```

---

## Security Measures

### OTP Generation
- 6-digit OTP (0-999999)
- Cryptographically secure random generation
- Time-limited (5 minutes)

### Brute Force Protection
- Maximum 5 OTP verification attempts
- Session expires after 5 minutes
- Exponential backoff recommended
- Rate limiting on request-otp (1 per minute)

### Session Management
- Session ID is random and unique
- Stores mapping: session_id → otp
- Automatic expiry (5 minutes)
- Deleted immediately after successful verification

### Token Security
- JWT with HS256 algorithm
- Auth token: 24 hour expiry
- Refresh token: 30 day expiry
- Include `iat` (issued at) and `exp` (expiration) claims
- Include user context (user_id, role)

### SMS Provider
- Use Twilio, AWS SNS, or Nexmo
- Encrypted API credentials in environment variables
- Fallback provider if primary fails
- Log all SMS sends for audit trail

---

## Client Implementation

### React Native Example
```javascript
// Step 1: Request OTP
const requestOTP = async (phoneNumber) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phoneNumber })
    });

    const { session_id, otp_expiry_seconds } = await response.json();

    // Store session_id
    await SecureStore.setItemAsync('session_id', session_id);

    // Start countdown timer
    startOTPTimer(otp_expiry_seconds);

    return { session_id };
  } catch (error) {
    console.error('OTP request failed:', error);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (phoneNumber, otp) => {
  try {
    const session_id = await SecureStore.getItemAsync('session_id');

    const response = await fetch('http://localhost:3000/api/auth/login/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: phoneNumber,
        otp: otp,
        session_id: session_id
      })
    });

    const { auth_token, refresh_token, data } = await response.json();

    // Store tokens securely
    await SecureStore.setItemAsync('auth_token', auth_token);
    await SecureStore.setItemAsync('refresh_token', refresh_token);
    await AsyncStorage.setItem('user_data', JSON.stringify(data));

    // Clear session
    await SecureStore.deleteItemAsync('session_id');

    return { success: true, user: data };
  } catch (error) {
    console.error('OTP verification failed:', error);
  }
};
```

---

## Token Management

### Using Auth Token
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh Flow
```
1. Token expires (24 hours)
2. App intercepts 401 response
3. Call POST /auth/refresh-token with refresh_token
4. Get new auth_token
5. Retry original request
6. If refresh_token also expired, user must re-login
```

### Logout
```
1. Delete auth_token from client
2. Delete refresh_token from client
3. Call POST /auth/logout (optional, for server cleanup)
4. Clear user data
5. Redirect to login
```

---

## Failure Scenarios & Solutions

### Scenario 1: User didn't receive OTP
**Solution:**
- Resend button (after 30 seconds)
- Alt: Call customer support
- Check SMS delivery logs

### Scenario 2: OTP entered incorrectly
**Handling:**
- Max 5 attempts
- Show attempts counter
- After 5 attempts: Force request new OTP
- Cooldown period before retry

### Scenario 3: Session timeout
**Handling:**
- If not verified within 5 minutes, OTP expires
- User must request new OTP
- Clear session_id on error

### Scenario 4: SMS service down
**Handling:**
- Implement fallback SMS provider
- Show error: "Unable to send OTP, try again"
- Log incident for investigation
- Consider temporary email OTP option

---

## Testing OTP

### For Development/Testing
```python
# Bypass SMS in dev environment
if settings.ENVIRONMENT == 'development':
    OTP = hardcoded_value  # e.g., "000000"
    print(f"OTP for testing: {OTP}")
```

### Test Cases
1. ✓ Valid phone number + correct OTP
2. ✓ Valid phone number + incorrect OTP
3. ✓ Phone number not registered
4. ✓ OTP expired (after 5 minutes)
5. ✓ Max attempts exceeded
6. ✓ Invalid session_id
7. ✓ Multiple concurrent login attempts
8. ✓ Resend OTP before expiry
9. ✓ Different devices, same phone login

---

**Last Updated:** 2026-04-19
**Status:** ✅ Ready for Implementation
