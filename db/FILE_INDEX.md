# StitchUp Database Files Index

## 📋 Quick Navigation

### Master & Setup
- **`00_master.sql`** - Load this ONE file to set up entire database

### SQL Table Files (22 tables)

#### Foundation (2 files)
| File | Purpose | Tables |
|------|---------|--------|
| `01_user_roles.sql` | User role definitions | `user_roles` |
| `02_users.sql` | Base user table for all users | `users` |

#### User Profiles (5 files)
| File | Purpose | Tables |
|------|---------|--------|
| `03_user_consumer.sql` | Consumer profile (address, preferences) | `user_consumer` |
| `04_body_measurements.sql` | Measurements for consumers | `body_measurements` |
| `05_user_tailor.sql` | Tailor profile (shop, experience, rating) | `user_tailor` |
| `06_tailor_verification.sql` | Document verification records | `tailor_verification` |
| `07_tailor_bank_details.sql` | Tailor payment information | `tailor_bank_details` |

#### Catalog & Templates (3 files)
| File | Purpose | Tables |
|------|---------|--------|
| `08_template_type.sql` | Clothing types (Salwar, Kurta, etc.) | `template_type` |
| `09_template_sub_type.sql` | Clothing subtypes (Traditional, Modern, etc.) | `template_sub_type` |
| `10_material.sql` | Fabric/material specifications | `material` |

#### Orders & Workflow (6 files) ⭐ MULTI-ITEM SUPPORT
| File | Purpose | Tables |
|------|---------|--------|
| `11_orders.sql` | Main order entity | `orders` |
| `12_order_items.sql` | ⭐ **LINE ITEMS** (supports Salwar+Kurta+Scarf) | `order_items` |
| `13_order_details.sql` | Extended order specifications | `order_details` |
| `14_order_status_history.sql` | Audit trail of status changes | `order_status_history` |
| `15_consumer_tailor_match.sql` | Tailor matching for orders | `consumer_tailor_match` |
| `16_appointments.sql` | Scheduling (measurement, fitting, etc.) | `appointments` |

#### Payments (2 files)
| File | Purpose | Tables |
|------|---------|--------|
| `17_payment_methods.sql` | Stored payment methods | `payment_methods` |
| `18_payment_transactions.sql` | Payment records (advance, final, refund) | `payment_transactions` |

#### Feedback & Support (2 files)
| File | Purpose | Tables |
|------|---------|--------|
| `19_ratings_reviews.sql` | Ratings and customer reviews | `ratings_reviews` |
| `20_support_tickets.sql` | Support tickets and grievances | `support_tickets` |

#### System (2 files)
| File | Purpose | Tables |
|------|---------|--------|
| `21_notifications.sql` | User notifications | `notifications` |
| `22_audit_logs.sql` | System audit trail | `audit_logs` |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main documentation (overview, structure, quick start) |
| `MULTI_ITEM_ORDERS_GUIDE.md` | ⭐ Complete guide for multi-item orders (APIs, queries, patterns) |
| `FILE_INDEX.md` | This file - quick reference |

---

## 🎯 Where to Look For...

### I want to understand...

**How multi-item orders work?**
→ Read: `MULTI_ITEM_ORDERS_GUIDE.md`

**How to load the database?**
→ Read: `README.md` (Quick Start section)

**What's in each table?**
→ This file (scroll down) or individual .sql files

**How consumers place orders?**
→ See: `11_orders.sql`, `12_order_items.sql`, `13_order_details.sql`

**How tailors are matched?**
→ See: `15_consumer_tailor_match.sql`

**How payments work?**
→ See: `17_payment_methods.sql`, `18_payment_transactions.sql`

**How ratings/feedback work?**
→ See: `19_ratings_reviews.sql`

**How support tickets work?**
→ See: `20_support_tickets.sql`

---

## 🚀 Getting Started in 3 Steps

```bash
# Step 1: Load the database
mysql stitchup_db -u root -p < 00_master.sql

# Step 2: Verify
mysql stitchup_db -u root -p -e "SHOW TABLES;"

# Step 3: Read docs
cat README.md
cat MULTI_ITEM_ORDERS_GUIDE.md
```

---

## 💡 Key Points

### Multi-Item Orders (NEW!)
- ✅ One order can have multiple items (Salwar + Kurta + Scarf)
- ✅ Each item tracked separately in `order_items` table
- ✅ Items have individual costs, customizations, and embroidery options
- ✅ Backward compatible (single-item orders work too)

### Why Modular Files?
- 📂 Easier to maintain
- 🔍 Better to understand (one concern per file)
- 🔧 Easier to modify (change one file, not 3000+ lines)
- 📝 Better for version control
- 👥 Team can work on different tables

### Design Highlights
- 🔐 Separate consumer and tailor profiles (no NULL fields)
- 📊 Immutable status history (for disputes & analytics)
- 💳 Separate payment transactions (advance + final)
- ⭐ Multi-dimensional ratings (quality, timeliness, communication)
- 📋 Complete audit trail (for compliance)

---

## 📊 Table Count

- **Total Tables: 22**
- **Foundation: 2**
- **User-related: 5**
- **Catalog: 3**
- **Order-related: 6** (including new order_items)
- **Payment-related: 2**
- **Feedback: 2**
- **System: 2**

---

## 🔍 Quick Schema Diagram

```
USERS & AUTH
├─ user_roles (admin, tailor, consumer, support)
├─ users (email, phone, password_hash, role_id)
├─ user_consumer (profile for consumers)
│  └─ body_measurements (height, weight, chest, etc.)
└─ user_tailor (profile for tailors)
   ├─ tailor_verification (PAN, Aadhar docs)
   └─ tailor_bank_details (payment info)

CATALOG
├─ template_type (Salwar, Kurta, Saree, Scarf, Dress, etc.)
├─ template_sub_type (Traditional, Modern, Embroidered, etc.)
└─ material (Cotton, Silk, Georgette, etc.)

ORDERS (MULTI-ITEM SUPPORT) ⭐
├─ orders (main order, number_of_items, total_cost)
├─ order_items ⭐ (line items: Salwar, Kurta, Scarf separately)
├─ order_details (overall specs, delivery address)
├─ order_status_history (audit trail)
├─ consumer_tailor_match (tailor candidates)
└─ appointments (measurement, fitting, pickup)

PAYMENTS
├─ payment_methods (credit card, UPI, etc.)
└─ payment_transactions (advance, final, refund)

FEEDBACK
├─ ratings_reviews (quality, timeliness, communication ratings)
└─ support_tickets (issues, grievances, resolutions)

SYSTEM
├─ notifications (in-app, email, SMS alerts)
└─ audit_logs (system actions & changes)
```

---

## 📝 Sample Data

### Pre-inserted Data

| Table | Sample Data |
|-------|------------|
| `user_roles` | admin, tailor, consumer, support |
| `template_type` | Salwar Suit, Kurta, Dupatta, Dress, Sherwani, etc. |
| `template_sub_type` | Traditional, Modern, Indo-Western (per type) |
| `material` | Cotton, Silk, Georgette, Chiffon, Crepe, Satin, Linen |

---

## 🔐 Security Features

- ✅ Foreign key constraints
- ✅ Proper collation (utf8mb4_unicode_ci)
- ✅ Strategic indexes for performance
- ✅ Audit logs for compliance
- ✅ Status history for transparency
- ⚠️ Application-level encryption for sensitive data (passwords, bank details)

---

## 📞 Troubleshooting

**Error: `SOURCE 12_order_items.sql` not found**
→ Make sure you're in the `/db` directory
→ Or use full paths: `SOURCE /path/to/db/12_order_items.sql;`

**Error: Foreign key constraint fails**
→ Load tables in order shown in `00_master.sql`
→ Don't skip dependencies

**Tables created but no sample data?**
→ Only template_type, template_sub_type, and material have sample data
→ User data is created through registration

---

## 🎓 Learning Path

1. **Start here:** `README.md` (overview)
2. **Understand multi-item:** `MULTI_ITEM_ORDERS_GUIDE.md`
3. **Load database:** Run `00_master.sql`
4. **Explore tables:** Check individual .sql files
5. **Query examples:** See MULTI_ITEM_ORDERS_GUIDE.md for queries
6. **Build API:** Create endpoints for orders, items, assignments

---

## 📈 Next Steps

1. ✅ Load schema: `mysql stitchup_db -u root -p < 00_master.sql`
2. ✅ Verify: `SHOW TABLES;`
3. → Design API endpoints (POST/GET/PUT orders with items)
4. → Build consumer frontend (order creation with multi-item support)
5. → Build tailor frontend (order assignment, status updates)
6. → Implement matching algorithm
7. → Add payment integration
8. → Add notifications

---

**Last Updated:** 2026-04-19
**Schema Version:** 2.0 (Multi-Item Orders)
**Total Size:** ~25KB SQL + ~28KB Docs
**Status:** ✅ Ready for Development

