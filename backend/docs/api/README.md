# Backend API Documentation - Navigation Guide

**Version:** 1.0
**Status:** ✅ Complete & Ready for Development
**Last Updated:** 2026-04-19

---

## 📚 Documentation Files

### 1. **ENDPOINTS.md** (COMPREHENSIVE - 1000+ lines)
Complete API reference with all endpoints, request/response formats

**Contains:**
- Authentication APIs (Register, Login, OTP)
- User Management APIs
- Template APIs
- Order APIs
- Pricing APIs
- Error Handling
- 50+ curl examples

**Start Here When:**
- You need to implement an endpoint
- You want to see request/response format
- You need to understand all available APIs

**Key Sections:**
- `/auth/consumer/register` - Consumer signup
- `/auth/tailor/register` - Tailor signup
- `/auth/login/request-otp` - Request OTP
- `/auth/login/verify-otp` - Verify OTP & login
- `/user/details/{userId}` - Get profile
- `/templates` - Browse all templates
- `/templates/{id}` - Get specific template
- `/templates/{id}/{subId}` - Get subtype details
- `/orders` - Create order
- `/orders/history/{userId}` - Order history
- `/orders/{orderId}` - Order details
- `/pricing/calculate` - Calculate price
- `/pricing/materials` - Get materials
- `/pricing/customizations` - Get customizations

---

### 2. **AUTH_FLOW.md** (AUTHENTICATION DEEP DIVE)
Complete OTP-based authentication flow with security details

**Contains:**
- Detailed auth flow diagram
- Step-by-step OTP logic
- Python backend implementation examples
- React Native client examples
- Security measures
- Token management
- Failure scenarios & solutions
- Testing strategies

**Start Here When:**
- Implementing authentication
- Understanding OTP flow
- Implementing security measures
- Handling edge cases in OTP

**Key Topics:**
- OTP generation (6-digit, secure)
- OTP expiry (5 minutes)
- Brute force protection (max 5 attempts)
- Session management
- JWT token generation (24h auth, 30d refresh)
- Token refresh flow
- Logout process

---

### 3. **PRICING_AND_ORDER_FLOW.md** (PRICING CALCULATIONS)
Complete pricing system with real-world examples

**Contains:**
- Order placement process
- Detailed pricing calculations
- 3 worked examples (Basic, Premium, Bundle)
- Pricing API workflow
- Order placement request/response
- Pricing stored in database
- Special pricing scenarios
- Edge cases & validations
- Future enhancements

**Start Here When:**
- Implementing pricing calculations
- Placing orders
- Calculating price preview
- Understanding pricing formula
- Handling special cases (bulk discount, promo codes)

**Key Formulas:**
```
Price = ((Base × SubType) × Material + BodyConfig + Customizations) × Urgency - Discount
```

**Examples:**
- Basic Kurta: ₹600 (examples in file)
- Premium Salwar: ₹2233 with discount
- Multi-item bundle: ₹2045 (future reference)

---

### 4. **IMPLEMENTATION_NOTES.md** (DEVELOPER CHECKLIST)
Key points for backend developers

**Contains:**
- Missing features added to schema
- Complete auth implementation checklist
- User role-based operations
- Pricing calculation step-by-step
- Order placement validation & process
- API response structure
- Database indexes (critical!)
- Error handling with specific codes
- Soft delete policy
- Audit trail logging
- Testing checklist
- Required environment variables
- Design decisions explained
- Next steps for backend

**Start Here When:**
- Starting backend development
- Need complete implementation checklist
- Looking for best practices
- Want to understand design decisions

**Critical Sections:**
- **Pricing Calculation Logic** (10-step process)
- **Database Indexes** (15+ critical indexes)
- **Error Codes** (20+ specific error codes)
- **Environment Variables** (all required configs)

---

## 🎯 Quick Navigation by Task

### I need to implement...

| Task | Document | Section |
|------|----------|---------|
| Consumer Registration | ENDPOINTS.md | Authentication APIs #1 |
| Tailor Registration | ENDPOINTS.md | Authentication APIs #2 |
| OTP Login | AUTH_FLOW.md | Flow Diagram |
| Auth Flow | AUTH_FLOW.md | Detailed Implementation |
| User Profile | ENDPOINTS.md | User Management APIs #4 |
| Browse Templates | ENDPOINTS.md | Template APIs #6 |
| Template Details | ENDPOINTS.md | Template APIs #7-8 |
| Calculate Price | PRICING_AND_ORDER_FLOW.md | Pricing API Workflow |
| Place Order | ENDPOINTS.md | Order APIs #9 |
| Order History | ENDPOINTS.md | Order APIs #10 |
| Order Details | ENDPOINTS.md | Order APIs #11 |
| Get Materials | ENDPOINTS.md | Pricing APIs #13 |
| Get Customizations | ENDPOINTS.md | Pricing APIs #14 |
| Pricing Formula | PRICING_AND_ORDER_FLOW.md | Pricing Calculation |
| Error Handling | ENDPOINTS.md | Error Handling |
| Setup Database | IMPLEMENTATION_NOTES.md | Next Steps |
| Security Measures | AUTH_FLOW.md | Security Measures |
| Testing | IMPLEMENTATION_NOTES.md | Testing Checklist |

---

## 📊 API Endpoints Summary

### Authentication (3 endpoints)
- `POST /auth/consumer/register` - Register consumer
- `POST /auth/tailor/register` - Register tailor
- `POST /auth/login/request-otp` - Request OTP
- `POST /auth/login/verify-otp` - Verify OTP & Login

### Users (2 endpoints)
- `GET /user/details/{userId}` - Get profile
- `PUT /user/details/{userId}` - Update profile

### Templates (3 endpoints)
- `GET /templates` - List all templates
- `GET /templates/{templateId}` - Get specific template
- `GET /templates/{templateId}/{subTemplateId}` - Get subtype details

### Orders (3 endpoints)
- `POST /orders` - Create order (MVP: single item)
- `GET /orders/history/{userId}` - Order history
- `GET /orders/{orderId}` - Order details

### Pricing (3 endpoints)
- `POST /pricing/calculate` - Calculate price
- `GET /pricing/materials` - List materials
- `GET /pricing/customizations` - List customizations

**Total: 14 endpoints** (for MVP)

---

## 🔑 Key Concepts to Understand

### 1. OTP-Based Authentication
- Phone number + OTP instead of password
- 6-digit OTP valid for 5 minutes
- Max 5 attempts before session expires
- Session ID for tracking requests
- JWT tokens after successful verification

### 2. Role-Based Access
- **Consumer:** Places orders, tracks status, pays
- **Tailor:** Receives orders, updates status, gets paid
- Different registration flows
- Different data access patterns

### 3. Single-Item Orders (MVP)
- User can order ONE template per order
- Future: Multi-item bundles
- Structure ready for multi-item (order_items table)

### 4. Pricing Tiers
- **Base Template:** ₹150-₹1500 by type
- **Sub-Type Adjustment:** +₹0-₹150 per variation
- **Material Multiplier:** ×1.0-×1.6 (Cotton to Satin)
- **Body Config:** +₹0-₹300 (Standard to Custom)
- **Customizations:** ₹50-₹500 per type
- **Urgency:** ×1.0-×1.5 (Normal to Priority)
- **Discounts:** Up to 30% or ₹500 flat

### 5. Soft Deletes
- Never hard delete (DELETE)
- Update status field instead
- Preserves history and audit trail
- All tables: users, templates, materials, etc.

---

## ⚙️ Technical Stack (Recommended)

### Backend
- **Node.js** with Express.js OR
- **Python** with Flask/Django OR
- **Java** with Spring Boot

### Database
- **MySQL** 8.0+ (schema provided)
- **Redis** for caching & OTP storage
- Indexes already designed

### Libraries
- **JWT:** jsonwebtoken / PyJWT
- **OTP:** Built-in random module
- **SMS:** Twilio SDK / AWS SNS
- **Payment:** Razorpay SDK
- **Validation:** joi / marshmallow

### Deployment
- Docker containers
- AWS/GCP cloud (databases, storage)
- CI/CD pipeline (GitHub Actions, etc.)

---

## 📋 Implementation Checklist

### Phase 1: Auth (Week 1)
- [ ] Setup database (load schema)
- [ ] Setup Redis cache
- [ ] Implement consumer registration
- [ ] Implement tailor registration
- [ ] Implement OTP request & verification
- [ ] Test auth flow end-to-end

### Phase 2: APIs (Week 2)
- [ ] User details endpoints
- [ ] Template listing & details
- [ ] Pricing calculation
- [ ] Order creation
- [ ] Order history & details

### Phase 3: Integrations (Week 3)
- [ ] SMS provider integration
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Error tracking (Sentry, etc.)

### Phase 4: Testing & Polish (Week 4)
- [ ] Unit tests (all functions)
- [ ] Integration tests (full flows)
- [ ] Load tests (concurrent users)
- [ ] Security audit
- [ ] Performance optimization

---

## 🚨 Critical Implementation Points

### DO ✅
- ✓ Handle soft deletes (never hard delete)
- ✓ Store pricing calculations in history
- ✓ Validate all inputs
- ✓ Use proper error codes
- ✓ Create audit trail for critical actions
- ✓ Implement rate limiting
- ✓ Use indexes for all queries
- ✓ Refresh tokens when auth expires
- ✓ Cache frequently accessed data
- ✓ Test edge cases

### DON'T ❌
- ✗ Store passwords in plain text
- ✗ Hard delete data
- ✗ Skip validation
- ✗ Miss indexes on frequently queried columns
- ✗ Recalculate prices without storing history
- ✗ Trust user input without validation
- ✗ Hardcode secrets/credentials
- ✗ Skip error handling
- ✗ Forget to log critical actions
- ✗ Use Status enum without checking validity

---

## 🔗 Database Schema Reference

**Location:** `/Users/apple/Documents/StitchUp/db/`

### Key Tables
- **users** - All users (consumer, tailor, admin)
- **user_consumer** - Consumer profiles
- **user_tailor** - Tailor profiles
- **template_type** - Clothing types
- **template_sub_type** - Clothing variations
- **material** - Fabric types
- **orders** - Main order records
- **order_items** - Line items per order (ready for multi-item)
- **pricing_config** - All pricing tables (8 tables)

### Total: 30 Tables (22 core + 8 pricing)

See `/db/PRICING_GUIDE.md` for complete pricing tables.

---

## 📞 Common Questions

**Q: Do I need to implement all 14 endpoints?**
A: For MVP, yes. They're all documented. Start with auth, then templates, then orders.

**Q: How do I calculate price?**
A: See PRICING_AND_ORDER_FLOW.md. 10-step process. Examples provided.

**Q: What about multi-item orders?**
A: Database is ready (order_items table). API supports 1 item for MVP. Easy to extend later.

**Q: Should I hard delete old orders?**
A: NO! Never hard delete. Use soft deletes (status field). See IMPLEMENTATION_NOTES.md.

**Q: How do I test OTP locally?**
A: See AUTH_FLOW.md. Bypass SMS in development, log OTP to console.

**Q: What error codes should I use?**
A: See IMPLEMENTATION_NOTES.md. 20+ specific codes listed.

---

## 🎓 Learning Resources in Docs

### For Authentication
- AUTH_FLOW.md: Complete flow with diagrams
- ENDPOINTS.md: Request/response formats
- IMPLEMENTATION_NOTES.md: Step-by-step logic

### For Pricing
- PRICING_AND_ORDER_FLOW.md: Formula & examples
- IMPLEMENTATION_NOTES.md: Calculation steps
- ENDPOINTS.md: API format

### For Order Management
- PRICING_AND_ORDER_FLOW.md: Order placement
- ENDPOINTS.md: All order endpoints
- IMPLEMENTATION_NOTES.md: Validation rules

### For Database
- /db/schema.sql: Table definitions
- /db/PRICING_GUIDE.md: Pricing tables
- /db/MULTI_ITEM_ORDERS_GUIDE.md: Order structure

---

## ✅ Final Checklist Before Coding

- [ ] Read all 4 API documentation files
- [ ] Understand OTP flow
- [ ] Understand pricing formula
- [ ] Know all 14 endpoints
- [ ] Understand soft deletes policy
- [ ] Know error codes to use
- [ ] Database schema loaded and verified
- [ ] Environment variables documented
- [ ] Testing strategy understood
- [ ] Ready to code!

---

## 📞 Support

**Issues?**
- Check ENDPOINTS.md for API format
- Check AUTH_FLOW.md for security details
- Check IMPLEMENTATION_NOTES.md for logic details
- Check PRICING_AND_ORDER_FLOW.md for calculations
- Check database schema files for table structure

---

**All set! Happy coding! 🚀**

**Next:** Load the database and start implementing endpoints from ENDPOINTS.md
