# StitchUp Database Schema
## Modular SQL Files & Multi-Item Order Architecture

Welcome to the StitchUp database schema! This version has been completely reorganized into **individual SQL files** for better maintainability and includes support for **multi-item orders** (e.g., Salwar + Kurta + Scarf bundles).

---

## 📁 File Structure

```
db/
├── 00_master.sql                           # Run this to load all tables
├── 01_user_roles.sql                       # User roles (consumer, tailor, admin)
├── 02_users.sql                            # Base user table
├── 03_user_consumer.sql                    # Consumer profile info
├── 04_body_measurements.sql                # Consumer measurements (height, weight, etc.)
├── 05_user_tailor.sql                      # Tailor profile & verification status
├── 06_tailor_verification.sql              # Document verification (PAN, Aadhar, etc.)
├── 07_tailor_bank_details.sql              # Tailor payment info
├── 08_template_type.sql                    # Clothing types (Salwar, Kurta, Dupatta, etc.)
├── 09_template_sub_type.sql                # Clothing subtypes (Traditional, Modern, etc.)
├── 10_material.sql                         # Fabric/material specifications
├── 11_orders.sql                           # Main order entity
├── 12_order_items.sql                      # ⭐ LINE ITEMS (NEW - supports multi-item orders)
├── 13_order_details.sql                    # Overall order specifications
├── 14_order_status_history.sql             # Audit trail of status changes
├── 15_consumer_tailor_match.sql            # Tailor matching for orders
├── 16_appointments.sql                     # Scheduling (measurement, fitting, etc.)
├── 17_payment_methods.sql                  # Stored payment methods
├── 18_payment_transactions.sql             # Payment records
├── 19_ratings_reviews.sql                  # Ratings and customer feedback
├── 20_support_tickets.sql                  # Support/grievance tickets
├── 21_notifications.sql                    # User notifications
├── 22_audit_logs.sql                       # System audit trail
├── MULTI_ITEM_ORDERS_GUIDE.md             # ⭐ Complete guide for multi-item orders
├── README.md                               # This file
└── QUICK_REFERENCE.md                      # (To be created) SQL query examples
```

---

## 🚀 Quick Start

### Load All Tables at Once
```bash
# Method 1: Using master file (recommended)
mysql stitchup_db -u root -p < 00_master.sql

# Method 2: Load individual files in order
mysql stitchup_db -u root -p < 01_user_roles.sql
mysql stitchup_db -u root -p < 02_users.sql
# ... and so on
```

### Load Individual Table
```bash
# Load just one table
mysql stitchup_db -u root -p < 12_order_items.sql
```

---

## ⭐ NEW: Multi-Item Orders (Most Important Change)

### What Changed?

**Old Design:**
```
One order = One item (Salwar suit only)
```

**New Design:**
```
One order = Multiple items (Salwar + Kurta + Scarf all in one order!)
```

### Key Feature: Order Items Table

The new **`order_items`** table (`12_order_items.sql`) allows each order to have multiple line items:

```
Order #1001
  ├─ Item 1: Salwar (Traditional) - 2.5m Cotton - ₹1400
  ├─ Item 2: Kurta (Modern) - 1.5m Silk - ₹1900
  └─ Item 3: Dupatta (Embroidered) - 3m Georgette - ₹700

Total: ₹4000 (all items together)
```

### Benefits
✅ Customers can order complete outfits in one transaction
✅ Single tailor handles the entire bundle
✅ Unified tracking and shipping
✅ Better pricing and discounts
✅ Simplified payment flow

### Structure

**orders table** (Summary level)
```sql
- id: Order ID
- consumer_id: Who placed it
- tailor_id: Who's making it
- number_of_items: Count of items (1, 2, or 3+)
- total_cost: Sum of all item costs
- final_amount: Total after discount
```

**order_items table** (Line item level)
```sql
- id: Item ID
- order_id: Which order this item belongs to
- item_sequence: 1, 2, 3... (for ordering)
- template_type_id: Salwar? Kurta? Scarf?
- template_sub_type_id: Traditional? Modern? Embroidered?
- material_id: What fabric
- length_meters: How much fabric
- item_cost: Cost for THIS item
- item_final_cost: Cost after discount
- embroidery_required: Embroidery yes/no
- customization_details: Special instructions
```

### Example: Creating a 3-Item Order

```sql
-- 1. Create order (note: number_of_items = 3)
INSERT INTO orders (consumer_id, number_of_items, total_cost, final_amount, urgency_level)
VALUES (123, 3, 4300, 4000, 'express');

SET @order_id = LAST_INSERT_ID();

-- 2. Add Item 1: Salwar
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 1, 1, 1, 1, 2.5, 1500, 1400);

-- 3. Add Item 2: Kurta
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 2, 2, 2, 2, 1.5, 2000, 1900);

-- 4. Add Item 3: Scarf
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 3, 4, 1, 3, 3.0, 800, 700);
```

**For detailed examples, see:** `MULTI_ITEM_ORDERS_GUIDE.md`

---

## 📊 Table Organization

### User & Auth (5 files)
- `01_user_roles.sql` - Role definitions
- `02_users.sql` - Main user table
- `03_user_consumer.sql` - Consumer profile
- `04_body_measurements.sql` - Measurements
- `05_user_tailor.sql` - Tailor profile

### Tailor Verification (2 files)
- `06_tailor_verification.sql` - Documents (PAN, Aadhar)
- `07_tailor_bank_details.sql` - Payment details

### Catalog (2 files)
- `08_template_type.sql` - Clothing categories
- `09_template_sub_type.sql` - Clothing variations
- `10_material.sql` - Fabric catalog

### Orders & Workflow (6 files)
- `11_orders.sql` - Order header
- `12_order_items.sql` - ⭐ Line items (NEW)
- `13_order_details.sql` - Order specs
- `14_order_status_history.sql` - Status audit trail
- `15_consumer_tailor_match.sql` - Tailor matching
- `16_appointments.sql` - Scheduling

### Payments (2 files)
- `17_payment_methods.sql` - Payment methods
- `18_payment_transactions.sql` - Payment records

### Feedback (2 files)
- `19_ratings_reviews.sql` - Ratings & reviews
- `20_support_tickets.sql` - Support tickets

### System (2 files)
- `21_notifications.sql` - User notifications
- `22_audit_logs.sql` - System audit trail

---

## 🔄 Order Flow (with Multiple Items)

```
1. CREATED
   └─ Consumer creates order with Items
      ├─ Item 1: Salwar (Trad)
      ├─ Item 2: Kurta (Modern)
      └─ Item 3: Dupatta

2. MATERIAL_RECEIVED
   └─ Consumer drops off fabric
      ├─ 2.5m Cotton for Salwar
      ├─ 1.5m Silk for Kurta
      └─ 3m Georgette for Dupatta

3. TAILOR_ASSIGNED
   └─ System matches with tailor who can do ALL items
      ├─ Tailor must handle Traditional Salwar ✓
      ├─ Tailor must handle Modern Kurta ✓
      └─ Tailor must handle Embroidered work ✓

4. CUTTING_STARTED → STITCHING → FINAL_TOUCH → READY
   └─ Tailor processes all 3 items together

5. COMPLETED
   └─ Consumer picks up complete outfit
```

---

## 📈 Key Changes Summary

| Aspect | Old Schema | New Schema |
|--------|-----------|-----------|
| **Items per Order** | 1 only | Multiple (1, 2, 3+) |
| **Template in Orders** | `orders.template_type_id` | Moved to `order_items.template_type_id` |
| **Item Tracking** | Single item implicitly | Each item has `item_sequence` |
| **Item Pricing** | `orders.total_cost` only | `order_items.item_cost` + sum |
| **Customization** | One set per order | Per-item customization details |
| **Embroidery** | One embroidery type | Per-item embroidery_required |
| **Material** | One material | Per-item material selection |

---

## 🔍 Sample Queries

### Get Order with All Items
```sql
SELECT
  o.id, o.order_status, o.number_of_items, o.final_amount,
  oi.item_sequence, tt.type_name, tst.sub_type_name, m.material_name,
  oi.length_meters, oi.item_final_cost
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN template_type tt ON oi.template_type_id = tt.id
LEFT JOIN template_sub_type tst ON oi.template_sub_type_id = tst.id
LEFT JOIN material m ON oi.material_id = m.id
WHERE o.id = 1001
ORDER BY oi.item_sequence;
```

### Count Orders by Item Combination
```sql
SELECT
  GROUP_CONCAT(tt.type_name ORDER BY oi.item_sequence SEPARATOR ' + ') as combination,
  COUNT(*) as count
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN template_type tt ON oi.template_type_id = tt.id
GROUP BY o.id
HAVING GROUP_CONCAT(tt.type_name) LIKE '%Salwar%Kurta%';
-- Shows orders with "Salwar + Kurta" combinations
```

**For more queries, see:** `MULTI_ITEM_ORDERS_GUIDE.md`

---

## 🛠️ Working with Individual Files

### Adding a New Table

**Do:**
1. Create file `23_new_feature.sql`
2. Include CREATE TABLE statement
3. Add appropriate indexes
4. Add sample data if applicable
5. Update `00_master.sql` to include it

**Example:**
```sql
-- File: 23_gift_registry.sql
CREATE TABLE gift_registry (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consumer_id INT NOT NULL,
  registry_name VARCHAR(100),
  items_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (consumer_id) REFERENCES user_consumer(id) ON DELETE CASCADE,
  KEY idx_consumer_id (consumer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Then add to `00_master.sql`:
```sql
SOURCE 23_gift_registry.sql;
```

### Modifying an Existing Table

```bash
# Option 1: Recreate and reload
# 1. Backup data
# 2. Edit the .sql file
# 3. Drop table
# 4. Reload: mysql stitchup_db -u root -p < XX_table_name.sql

# Option 2: Use ALTER (if just adding fields)
ALTER TABLE table_name ADD COLUMN new_field VARCHAR(100);
```

---

## 📚 Documentation Files

1. **MULTI_ITEM_ORDERS_GUIDE.md** - Comprehensive guide for multi-item orders (API, queries, patterns)
2. **README.md** (this file) - Overview and quick reference
3. **QUICK_REFERENCE.md** (to create) - Common SQL patterns and queries

---

## ✅ Deployment Checklist

- [ ] Create database: `CREATE DATABASE stitchup_db;`
- [ ] Load schema: `mysql stitchup_db -u root -p < 00_master.sql`
- [ ] Verify all tables created: `SHOW TABLES;`
- [ ] Check indexes: `SHOW INDEX FROM orders;`
- [ ] Verify data: `SELECT COUNT(*) FROM template_type;` (should be > 0)
- [ ] Test queries from MULTI_ITEM_ORDERS_GUIDE.md
- [ ] Set up backups
- [ ] Configure monitoring/alerts

---

## 🔒 Security Notes

✅ All tables use `utf8mb4_unicode_ci` collation
✅ Foreign key constraints enabled
✅ Sensitive data (bank details, passwords) should be encrypted at application level
✅ Access control via application, not database users
✅ Audit logs (`22_audit_logs.sql`) track all changes

---

## 📞 Common Questions

**Q: Can I have an order with just 1 item?**
A: Yes! Set `number_of_items = 1` in orders table. `order_items` will have 1 row with `item_sequence = 1`.

**Q: What if items need different delivery dates?**
A: Currently orders have one `delivery_date`. If needed, add `delivery_date` to `order_items` table.

**Q: Can tailor handle only some items in a multi-item order?**
A: Current design assumes tailor handles entire order. If partial fulfillment needed, need to redesign order_tailor_assignment.

**Q: How do I calculate total fabric needed?**
A: `SELECT SUM(length_meters) FROM order_items WHERE order_id = ?;`

**Q: How do I get average order value?**
A: `SELECT AVG(final_amount) FROM orders WHERE created_at > DATE_SUB(NOW(), INTERVAL 30 DAY);`

---

## 🚀 Next Steps

1. **Load the schema:** Run `00_master.sql`
2. **Review multi-item guide:** Read `MULTI_ITEM_ORDERS_GUIDE.md`
3. **Plan API:** Design endpoints for creating/fetching multi-item orders
4. **Build frontend:** Create order builder UI for selecting multiple items
5. **Implement backend:** Use patterns from MULTI_ITEM_ORDERS_GUIDE.md

---

## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-19 | 2.0 | ⭐ Multi-item orders support (NEW order_items table) |
| 2026-04-19 | 1.1 | Split into modular SQL files |
| 2026-04-19 | 1.0 | Initial schema design |

---

**Happy stitching! 🪡**

