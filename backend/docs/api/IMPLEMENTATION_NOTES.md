# Backend Implementation Notes

## Key Points for Backend Development

---

## 1. Missing Features Added to Schema

### ✅ Template Sub-Type Pricing (NEW)
**File:** `db/23_pricing_config.sql`

Added table `template_sub_type_pricing` to support pricing variations within same template:

```sql
CREATE TABLE template_sub_type_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  template_sub_type_id INT NOT NULL UNIQUE,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  override_base_price DECIMAL(10, 2),
  status ENUM('active', 'inactive') DEFAULT 'active',
  ...
);
```

**Example Data:**
```
Salwar Suit:
  - Traditional (id=1):    ₹800 (no adjustment)
  - Modern (id=2):         ₹900 (+ ₹100 adjustment)
  - Indo-Western (id=3):   ₹950 (+ ₹150 adjustment)
```

**Usage in API:**
- `/templates/{templateId}` returns base price + subtypes with adjustments
- `/templates/{templateId}/{subTemplateId}` returns final_base_price
- `/pricing/calculate` includes sub_type_adjustment in breakdown

---

## 2. Authentication Implementation

### OTP Flow (Phone-based)
1. **Request OTP:** `POST /auth/login/request-otp`
   - Generate 6-digit OTP
   - Store in Redis with 5-min expiry
   - Return session_id
   - Send OTP via SMS

2. **Verify OTP:** `POST /auth/login/verify-otp`
   - Validate session_id, phone, OTP
   - Max 5 attempts per session
   - Generate JWT tokens (24h auth, 30d refresh)
   - Update user.last_login

### Token Management
- **Auth Token:** 24 hours, HTTP-only cookie or secure storage
- **Refresh Token:** 30 days, refresh endpoint to get new auth token
- Include `user_id` and `role` in JWT payload
- Include `iat` (issued at) and `exp` (expiration) claims

### Security
- Brute force protection (5 attempts max)
- Session timeout (5 minutes)
- SMS provider failover
- Rate limiting on OTP requests

---

## 3. User Role-Based Operations

### Consumer Registration
**Required Fields:**
- first_name, last_name
- email, phone_number (unique)
- password (min 8 chars)
- address_line1, city, state, postal_code, country
- Optional: bio, latitude, longitude, preferred_radius_km

**After Registration:**
- Create record in `users` table (role_id = consumer)
- Create record in `user_consumer` table (status = active)
- Set is_verified = false initially
- May send verification email/SMS

### Tailor Registration
**Required Fields:**
- Same as consumer +
- shop_name
- shop_address_line1, shop_address_line2
- Optional: years_of_experience, business_type, shop_registration_number

**After Registration:**
- Create record in `users` table (role_id = tailor)
- Create record in `user_tailor` table
- verification_status = pending (requires document verification)
- tailor_status = active
- Average_rating = 0, total_orders = 0
- Tailor cannot accept orders until verified

---

## 4. Pricing Calculation (Critical)

### Formula (in order)
```
1. Base Template Price (from template_type_pricing)
2. + Sub-Type Adjustment (from template_sub_type_pricing)
3. × Material Multiplier (from material_pricing_multiplier)
4. + Body Configuration Adjustment (from body_config_pricing)
5. + Customization Costs (sum from customization_pricing)
6. × Urgency Multiplier (from urgency_pricing)
7. - Discount Amount (from discount_pricing)
= FINAL PRICE
```

### Implementation Steps
```python
def calculate_price(order_item):
    1. Get base_price from template_type_pricing
    2. Get sub_type_adjustment from template_sub_type_pricing
    3. Apply sub_type: price = base + adjustment
    4. Get material_multiplier, apply: price = price × multiplier
    5. Get body_config_adjustment, apply: price = price + adjustment
    6. For each customization:
       - Get customization cost
       - If has unit: add base_cost + (quantity × per_unit_cost)
       - Else: add flat cost
       - Sum all customizations
    7. Add total customizations to price
    8. Get urgency_multiplier, apply: price = price × multiplier
    9. Get discount (code or bulk):
       - Check if code exists and is active
       - Check date range validity
       - Apply: discount = price × (discount_value / 100)
    10. final_price = price - discount
    11. Store in pricing_calculation_history for audit trail
    12. Return full breakdown
```

### Caching
- Cache template_type_pricing (refresh daily)
- Cache material_pricing_multiplier (refresh on change)
- Cache customization_pricing (refresh on change)
- Don't cache body_config_pricing (rarely used, static)
- Don't cache urgency_pricing (rarely used, static)

---

## 5. Order Placement (Single Item for MVP)

### Validation Before Creating Order
```
1. Consumer exists and is_verified=true
2. Template type exists and status='active'
3. Sub-template exists and status='active'
4. Material exists and status='active' (not 'discontinued')
5. Body measurement belongs to consumer
6. Delivery date >= today + min_days (e.g., 7 days)
7. Delivery address provided
8. Fabric length is reasonable (> 0, < 100 meters)
9. Urgency level is valid enum
10. Customizations are valid (type, name exist in DB)
```

### Order Creation Process
```
1. Validate all fields
2. Calculate pricing using calculate_price()
3. Create order record (status='created')
4. Create order_items records for each item
5. Create order_details record
6. Insert into pricing_calculation_history
7. Create initial status history record
8. Trigger tailor matching algorithm (async)
9. Send notification to consumer
10. Return order with payment required information
```

### What Gets Stored
```
orders table:
  - order_id (auto)
  - consumer_id
  - tailor_id = null (until matching)
  - order_status = 'created'
  - number_of_items = 1 (for MVP)
  - total_cost = sum of item costs
  - final_amount = after discounts
  - delivery_date
  - urgency_level
  - created_at, updated_at

order_items table:
  - order_id
  - item_sequence = 1
  - template_type_id, template_sub_type_id
  - material_id
  - fabric_length_meters
  - item_cost, item_final_cost
  - customization_details (could be JSON)

order_details table:
  - order_id
  - body_measurement_id
  - delivery_address_*
  - payment_schedule (advance_and_final, 50-50 split)

pricing_calculation_history table:
  - All calculations for this item
  - Everything about how final price was derived
```

---

## 6. API Response Structure

### Always Include
```json
{
  "success": true/false,
  "message": "string (optional, user-friendly)",
  "data": {},
  "error": {
    "code": "string (error code)",
    "message": "string"
  },
  "meta": {
    "timestamp": "ISO 8601",
    "request_id": "unique id for debugging"
  }
}
```

### List Endpoints with Pagination
```json
{
  "data": [],
  "pagination": {
    "total_count": 100,
    "limit": 20,
    "offset": 0,
    "page": 1,
    "total_pages": 5,
    "has_more": true
  }
}
```

---

## 7. Database Indexes Performance

### Critical Indexes (Must Create)
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);

-- Consumer queries
CREATE INDEX idx_consumer_city_status ON user_consumer(city, consumer_status);
CREATE INDEX idx_consumer_coordinates ON user_consumer(latitude, longitude);

-- Tailor queries
CREATE INDEX idx_tailor_city_status ON user_tailor(city, tailor_status);
CREATE INDEX idx_tailor_rating ON user_tailor(average_rating DESC);

-- Order queries
CREATE INDEX idx_order_consumer ON orders(consumer_id, order_status);
CREATE INDEX idx_order_tailor ON orders(tailor_id, order_status);
CREATE INDEX idx_order_status_date ON orders(order_status, created_at);

-- Items
CREATE INDEX idx_order_items_order ON order_items(order_id, item_sequence);

-- Pricing
CREATE INDEX idx_template_pricing_type ON template_type_pricing(template_type_id);
CREATE INDEX idx_subtype_pricing_type ON template_sub_type_pricing(template_sub_type_id);
CREATE INDEX idx_material_multiplier ON material_pricing_multiplier(material_id);

-- Discount
CREATE INDEX idx_discount_code ON discount_pricing(discount_code);
CREATE INDEX idx_discount_active_date ON discount_pricing(status, valid_from, valid_until);
```

---

## 8. Error Handling

### Specific Error Codes (Use Throughout API)
```
INVALID_EMAIL          - Email format invalid
PHONE_EXISTS           - Phone already registered
EMAIL_EXISTS           - Email already registered
INVALID_OTP            - OTP invalid or expired
SESSION_EXPIRED        - OTP session expired
MAX_ATTEMPTS_EXCEEDED  - Too many OTP attempts
USER_NOT_FOUND         - User with ID not found
INVALID_TOKEN          - Auth token invalid/expired
USER_INACTIVE          - User account inactive
TEMPLATE_NOT_FOUND     - Template not found
MATERIAL_NOT_FOUND     - Material not found
ORDER_NOT_FOUND        - Order not found
INVALID_STATUS         - Cannot transition to this status
PAYMENT_FAILED         - Payment gateway error
INSUFFICIENT_BALANCE   - Insufficient payment
INVALID_DELIVERY_DATE  - Delivery date too soon
DISCOUNT_INVALID       - Discount code invalid
DISCOUNT_EXPIRED       - Discount code expired
BODY_MEASUREMENT_NOT_FOUND - Measurement not found
```

---

## 9. Soft Deletes vs Hard Deletes

### Policy
- **NEVER hard delete** from any table
- Use status/retirement fields instead
- Preserves historical data and audit trail
- Solves disputes and analysis needs

### Implementation
```
Instead of: DELETE FROM template_type WHERE id = 1;
Use: UPDATE template_type SET status = 'retired', retired_at = NOW() WHERE id = 1;

In SELECT queries, filter:
SELECT * FROM template_type WHERE status = 'active';
```

---

## 10. Audit Trail & Logging

### Log Every Critical Action
```
- User login/logout
- Order creation/cancellation
- Payment transactions
- Status changes
- Document verification
- Account modifications
```

### Using audit_logs table
```python
AuditLog.create({
    'user_id': user.id,
    'action': 'order_created',
    'entity_type': 'order',
    'entity_id': order.id,
    'old_values': None,
    'new_values': order_data_as_json,
    'ip_address': request.remote_addr,
    'user_agent': request.headers.get('User-Agent')
})
```

---

## 11. Testing Checklist

### Unit Tests
- ✓ Price calculation with all combinations
- ✓ OTP generation and validation
- ✓ Token generation and expiry
- ✓ Order validation logic

### Integration Tests
- ✓ Full auth flow (register → login → token refresh)
- ✓ Full order flow (template browse → calculate → place → payment)
- ✓ Tailor matching algorithm
- ✓ Payment processing

### Data Tests
- ✓ Duplicate prevention (email, phone)
- ✓ Foreign key integrity
- ✓ Status transitions
- ✓ Pricing edge cases (no discount, max discount, etc.)

### Load Tests
- ✓ 100 concurrent order placements
- ✓ 1000 tailor searches by location
- ✓ Pricing calculation performance

---

## 12. Environment Variables (Required)

```bash
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=stitchup_user
DB_PASSWORD=secure_password
DB_NAME=stitchup_db

# JWT Tokens
JWT_SECRET=very_long_random_secret_key_min_32_chars
JWT_EXPIRY_HOURS=24
JWT_REFRESH_EXPIRY_DAYS=30

# OTP
OTP_LENGTH=6
OTP_EXPIRY_SECONDS=300
MAX_OTP_ATTEMPTS=5

# SMS Provider (e.g., Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway (e.g., Razorpay)
PAYMENT_PROVIDER=razorpay
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Redis (for caching OTP, sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Environment
ENVIRONMENT=development|staging|production
LOG_LEVEL=info
```

---

## 13. Important Decisions Documented

### Why Soft Deletes?
- Preserves historical data
- Supports audit trail
- Enables financial tracking
- Helps dispute resolution
- Compliant with regulations

### Why Sub-Type Pricing?
- Allows fine-grained pricing
- Modern Salwar more complex than Traditional
- Matches real business model
- Supports future dynamic pricing

### Why Material Multiplier?
- Silk more expensive than Cotton
- Transparent pricing for users
- Supports regional material costs
- Enables quality differentiation

### Why OTP-Based Login?
- Better UX for India (familiar with OTP)
- More secure than passwords
- Supports passwordless future
- Better for SMS notifications

### Why Advance + Final Payment?
- Tailor gets commitment from consumer
- Consumer doesn't pay full upfront
- Reduces fraud
- Aligns incentives

---

## 14. Next Steps for Backend

1. **Setup:**
   - Load database schema (00_master.sql)
   - Verify all 30 tables created
   - Run migrations if using ORM

2. **Dependencies:**
   - JWT library (jsonwebtoken for Node, PyJWT for Python)
   - OTP generation (random module is good)
   - SMS provider library (Twilio SDK)
   - Payment gateway library (Razorpay SDK)
   - Redis client for caching

3. **Implementation Order:**
   1. Database & connections
   2. Auth endpoints (register, login, token)
   3. User endpoints (profile, details)
   4. Template endpoints (browse, details)
   5. Pricing endpoint (calculate)
   6. Order endpoints (create, history, details)

4. **Testing:**
   - Start with auth flow (most critical)
   - Then pricing calculations
   - Then order placement
   - Then integration tests

---

**Last Updated:** 2026-04-19
**Status:** ✅ Ready for Backend Development
**Next Phase:** API Implementation
