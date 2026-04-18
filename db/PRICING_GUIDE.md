# Pricing Configuration System
## Complete Guide to Dynamic Pricing in StitchUp

---

## Overview

The StitchUp platform uses a **flexible, component-based pricing system** that calculates the final price based on:

1. **Template Type** (Salwar Suit, Kurta, Scarf, etc.)
2. **Material/Fabric** (Cotton, Silk, Georgette, etc.)
3. **Body Configuration** (Standard, Plus Size, Custom Proportions, etc.)
4. **Customizations** (Embroidery, special stitching, add-ons)
5. **Urgency/Rush Orders** (Normal, Express, Priority)
6. **Discounts** (Bulk orders, promo codes)

---

## Tables Overview

### 1. template_type_pricing
**Base price for each clothing type**

```sql
SELECT * FROM template_type_pricing;
```

| Template | Base Price | Complexity | Est. Hours |
|----------|-----------|-----------|-----------|
| Salwar Suit | ₹800 | Moderate | 8.0 |
| Kurta | ₹600 | Simple | 6.0 |
| Saree Blouse | ₹400 | Simple | 4.0 |
| Dupatta | ₹150 | Simple | 1.5 |
| Dress | ₹900 | Moderate | 9.0 |
| Sherwani | ₹1200 | Complex | 12.0 |

**Used when:** Customer selects a template type

---

### 2. material_pricing_multiplier
**Cost adjustment based on fabric type**

```sql
SELECT * FROM material_pricing_multiplier;
```

| Material | Multiplier | Effect |
|----------|-----------|--------|
| Cotton | 1.0 | No change (standard) |
| Silk | 1.5 | 50% premium |
| Georgette | 1.2 | 20% premium |
| Chiffon | 1.3 | 30% premium |
| Linen | 1.4 | 40% premium |
| Satin | 1.6 | 60% premium |

**Example:** Kurta (₹600) + Silk (×1.5) = ₹900

---

### 3. body_config_pricing
**Adjustment based on body measurements complexity**

```sql
SELECT * FROM body_config_pricing;
```

| Factor | Multiplier | Flat Adjustment | Use Case |
|--------|-----------|-----------------|----------|
| Standard | 1.0 | ₹0 | Regular measurements |
| Plus Size | 1.2 | +₹200 | Larger sizes, extra fabric |
| Petite | 1.15 | +₹150 | Smaller frame, many adjustments |
| Athletic | 1.1 | +₹100 | Special chest/shoulder shaping |
| Custom Proportions | 1.3 | +₹300 | Unusual measurements |
| First Time Detailed | 0.95 | -₹50 | Initial session incentive |

**Example:**
- Regular Kurta: ₹600
- Plus Size Kurta: ₹600 + ₹200 = ₹800

---

### 4. customization_pricing
**Additional charges for special requests**

```sql
SELECT * FROM customization_pricing WHERE customization_type = 'embroidery';
```

#### Embroidery Options

| Type | Base Cost | Rate | Example |
|------|-----------|------|---------|
| Simple | ₹150 | ₹5/inch | Basic patterns |
| Detailed | ₹300 | ₹10/inch | Intricate designs |
| Heavy Zari | ₹500 | ₹20/inch | Gold thread luxury |
| Bead Work | ₹400 | ₹15/inch | Beaded embellishment |

**Example:** 10 sq. inches of Detailed Embroidery = ₹300 + (10 × ₹10) = ₹400

#### Stitching Modifications

| Modification | Cost |
|-------------|------|
| Side Zippers | ₹100 |
| Extended Length | ₹50 |
| Custom Sleeves | ₹75 |
| Lace Border | ₹100 |
| Piping Detail | ₹60 |

---

### 5. urgency_pricing
**Rush order multipliers**

```sql
SELECT * FROM urgency_pricing;
```

| Level | Multiplier | Flat Rate | Turnaround | Min Days |
|-------|-----------|----------|-----------|----------|
| Normal | ×1.0 | ₹0 | 7-14 days | 7 |
| Express | ×1.25 | ₹200 | 3-5 days | 3 |
| Priority | ×1.5 | ₹500 | 1-2 days | 1 |

**Example:**
- Normal order: ₹600 × 1.0 = ₹600
- Express order: ₹600 × 1.25 + ₹200 = ₹950
- Priority order: ₹600 × 1.5 + ₹500 = ₹1400

---

### 6. tailor_custom_pricing
**Override pricing for specific tailors**

Tailors can set custom prices for specific template + material combinations:

```sql
INSERT INTO tailor_custom_pricing
(tailor_id, template_type_id, material_id, override_base_price, override_reason)
VALUES
(5, 1, 2, 1000.00, 'Expert in Silk Salwars - Premium pricing');
```

**Use Cases:**
- Expert tailors charge premium for their specialty
- New tailors offer discounts to build reputation
- Regional pricing variations

---

## Pricing Calculation Formula

### Basic Formula

```
Final Price = ((Base Price × Material Multiplier)
              + Body Config Adjustment
              + Customizations)
              × Urgency Multiplier
              - Discount
```

### Step-by-Step Calculation

```javascript
function calculatePrice(orderItem) {
  // Step 1: Get base template price
  const basePrice = getTemplatePrice(orderItem.template_type_id);

  // Step 2: Apply material multiplier
  const materialMultiplier = getMaterialMultiplier(orderItem.material_id);
  const materialAdjusted = basePrice * materialMultiplier;

  // Step 3: Add body config adjustment
  const bodyAdjustment = getBodyConfigAdjustment(orderItem.body_config);

  // Step 4: Add customizations
  const customizationTotal = calculateCustomizations(orderItem.customizations);

  // Step 5: Calculate subtotal before urgency
  const subtotal = materialAdjusted + bodyAdjustment + customizationTotal;

  // Step 6: Apply urgency multiplier
  const urgencyMultiplier = getUrgencyMultiplier(orderItem.urgency_level);
  const withUrgency = subtotal * urgencyMultiplier;

  // Step 7: Apply discount
  const discount = calculateDiscount(withUrgency, orderItem.discount_code);

  // Final price
  const finalPrice = withUrgency - discount;

  return finalPrice;
}
```

---

## Worked Examples

### Example 1: Basic Kurta Order

**Customer Scenario:**
- Kurta (Short Kurta subtype)
- Cotton material
- Standard body measurements
- No embroidery
- Normal delivery (7-14 days)
- No discount

**Calculation:**
```
Base Price (Kurta):              ₹600.00
Material Multiplier (Cotton):    ×1.0
Material Adjusted:               ₹600.00
Body Config (Standard):          +₹0.00
Customizations:                  ₹0.00
Subtotal:                        ₹600.00
Urgency Multiplier (Normal):     ×1.0
With Urgency:                    ₹600.00
Discount:                        -₹0.00
───────────────────────────
FINAL PRICE:                     ₹600.00
```

---

### Example 2: Premium Salwar + Customizations

**Customer Scenario:**
- Salwar Suit (Traditional)
- Silk material
- Plus-size measurements
- Simple embroidery (2 sq inches)
- Normal delivery
- First time discount (10%)

**Calculation:**
```
Base Price (Salwar):             ₹800.00
Material Multiplier (Silk):      ×1.5
Material Adjusted:               ₹1,200.00
Body Config (Plus Size):         +₹200.00
Simple Embroidery (2 sq":        ₹150.00 + (2×₹5) = +₹160.00
Subtotal:                        ₹1,560.00
Urgency Multiplier (Normal):     ×1.0
With Urgency:                    ₹1,560.00
Discount (10%):                  -₹156.00
───────────────────────────
FINAL PRICE:                     ₹1,404.00
```

---

### Example 3: Rush Sherwani with Heavy Embroidery

**Customer Scenario:**
- Sherwani (Traditional formal)
- Satin material
- Standard measurements
- Heavy Zari embroidery (15 sq inches)
- Priority delivery (1-2 days)
- No discount

**Calculation:**
```
Base Price (Sherwani):           ₹1,200.00
Material Multiplier (Satin):     ×1.6
Material Adjusted:               ₹1,920.00
Body Config (Standard):          +₹0.00
Heavy Zari (15 sq"):             ₹500.00 + (15×₹20) = +₹800.00
Subtotal:                        ₹2,720.00
Urgency Multiplier (Priority):   ×1.5
With Urgency:                    ₹4,080.00
Extra Priority Charge:           +₹500.00
Discount:                        -₹0.00
───────────────────────────
FINAL PRICE:                     ₹4,580.00
```

---

### Example 4: Multi-Item Order (Salwar + Kurta + Dupatta)

**Customer Order:**
- Item 1: Salwar (Cotton) → ₹800×1.0 + ₹200 (plus size) = ₹1,000
- Item 2: Kurta (Silk, embroidery) → ₹600×1.5 + ₹150 (embroidery) = ₹1,050
- Item 3: Dupatta (Georgette) → ₹150×1.2 = ₹180

**Calculation:**
```
Item 1 (Salwar):                 ₹1,000.00
Item 2 (Kurta):                  ₹1,050.00
Item 3 (Dupatta):                ₹180.00
───────────────────────────
Subtotal (Normal):               ₹2,230.00

With Express Urgency (×1.25):    ₹2,787.50
Express Charge:                  +₹200.00
                                 ₹2,987.50

Bulk Discount (20%):             -₹597.50
───────────────────────────
FINAL PRICE:                     ₹2,390.00
```

---

## API Integration

### POST /api/pricing/calculate
**Calculate price for an order item before checkout**

**Request:**
```json
{
  "template_type_id": 1,
  "template_sub_type_id": 1,
  "material_id": 2,
  "body_config": "plus_size",
  "customizations": [
    {
      "type": "embroidery",
      "name": "Detailed Embroidery",
      "area_sq_inches": 5
    },
    {
      "type": "stitching",
      "name": "Side Zippers",
      "quantity": 1
    }
  ],
  "urgency_level": "normal",
  "discount_code": "FIRST10"
}
```

**Response:**
```json
{
  "base_price": 800.00,
  "material_multiplier": 1.5,
  "material_adjusted": 1200.00,
  "body_config_adjustment": 200.00,
  "customization_total": 310.00,
  "subtotal": 1710.00,
  "urgency_multiplier": 1.0,
  "with_urgency": 1710.00,
  "discount_code": "FIRST10",
  "discount_percent": 10,
  "discount_amount": 171.00,
  "final_price": 1539.00,
  "breakdown": {
    "embroidery": 310.00,
    "urgent_charge": 0.00
  }
}
```

### GET /api/pricing/templates
**Get pricing for all template types**

### GET /api/pricing/materials
**Get material multipliers**

### GET /api/pricing/customizations?type=embroidery
**Get available customizations and their costs**

---

## Backend Implementation

### Database Query to Calculate Price

```sql
SELECT
  tti.id as item_id,
  ttp.base_price,
  mpm.cost_multiplier as material_multiplier,
  (ttp.base_price * mpm.cost_multiplier) as material_adjusted_price,
  bcp.price_adjustment as body_config_adjustment,
  -- For customizations, need separate query/join
  up.rush_multiplier as urgency_multiplier,
  dp.discount_value,

  -- Calculate final
  ROUND(
    ((ttp.base_price * mpm.cost_multiplier) + COALESCE(bcp.price_adjustment, 0))
    * up.rush_multiplier
    - COALESCE(dp.discount_value, 0),
    2
  ) as final_price

FROM order_items tti
LEFT JOIN template_type_pricing ttp ON tti.template_type_id = ttp.template_type_id
LEFT JOIN material_pricing_multiplier mpm ON tti.material_id = mpm.material_id
LEFT JOIN body_config_pricing bcp ON bcp.id = 1  -- Need to determine which body config
LEFT JOIN urgency_pricing up ON up.urgency_level = 'normal'
LEFT JOIN discount_pricing dp ON dp.discount_code = 'FIRST10'
WHERE tti.order_id = 1001;
```

---

## Setting Up Custom Pricing

### For a Specific Tailor

```sql
-- Tailor specializes in Silk Salwars, charges premium
INSERT INTO tailor_custom_pricing
(tailor_id, template_type_id, material_id, override_base_price, override_reason)
VALUES
(5, 1, 2, 1200.00, 'Expert in Silk Salwars - 20+ years experience');

-- When calculating price for this tailor's Silk Salwars:
-- Instead of: ₹800 × 1.5 = ₹1200
-- Use custom: ₹1200 (flat)
```

### For Regional Pricing

```sql
-- Different pricing in Mumbai vs rural areas
INSERT INTO template_type_pricing
(template_type_id, base_price, complexity_level, estimated_hours)
VALUES
(1, 950.00, 'moderate', 8.0);  -- Mumbai premium

-- Query by region
SELECT ttp.* FROM template_type_pricing ttp
WHERE ttp.template_type_id = 1 AND region = 'Mumbai';
```

---

## Bulk Order Discounts

### Set Up Bulk Pricing

```sql
-- 20% off for orders >= ₹5000
INSERT INTO discount_pricing
(discount_code, discount_name, discount_type, discount_value, min_order_amount, status)
VALUES
('BULK20', 'Bulk Order Discount', 'percentage', 20.00, 5000.00, 'active');

-- Check eligibility
SELECT * FROM discount_pricing
WHERE discount_code = 'BULK20'
AND 2500.00 >= min_order_amount;  -- ✓ Order qualifies
```

---

## Seasonal & Promotional Pricing

### Time-Limited Discounts

```sql
INSERT INTO discount_pricing
(discount_code, discount_name, discount_type, discount_value,
 usage_limit, status, valid_from, valid_until)
VALUES
('FESTIVAL50', 'Festival Special', 'percentage', 30.00, 500, 'active',
 '2026-05-01 00:00:00', '2026-05-31 23:59:59');

-- Query active discounts
SELECT * FROM discount_pricing
WHERE status = 'active'
AND NOW() BETWEEN valid_from AND valid_until;
```

---

## Reporting & Analytics

### Average Pricing by Template

```sql
SELECT
  tt.type_name,
  COUNT(tti.id) as order_count,
  AVG(tti.item_final_cost) as avg_price,
  MIN(tti.item_final_cost) as min_price,
  MAX(tti.item_final_cost) as max_price,
  SUM(tti.item_final_cost) as total_revenue
FROM order_items tti
LEFT JOIN template_type tt ON tti.template_type_id = tt.id
WHERE tti.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY tti.template_type_id
ORDER BY total_revenue DESC;
```

### Most Used Customizations

```sql
SELECT
  cp.customization_type,
  cp.customization_name,
  COUNT(*) as usage_count,
  AVG(cp.base_cost) as avg_cost
FROM -- Need to join with order_items customization_details (JSON)
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY cp.customization_type, cp.customization_name
ORDER BY usage_count DESC;
```

---

## Migration from Old Pricing

If you had fixed pricing before:

```sql
-- Set all templates to previous fixed price
UPDATE template_type_pricing
SET base_price = 1000.00
WHERE template_type_id IN (1, 2, 3);

-- Phase 2: Gradually introduce material multipliers
UPDATE material_pricing_multiplier
SET cost_multiplier = 1.0;  -- All materials same cost initially
```

---

## Best Practices

✅ **Do:**
- Update pricing regularly based on market rates
- Test price calculations with multiple scenarios before going live
- Keep pricing history in `pricing_calculation_history` table
- Offer seasonal discounts strategically
- Give new/struggling tailors opportunity for lower pricing

❌ **Don't:**
- Hard-code prices in application
- Change base prices without notifying users
- Allow customers to see price calculations (creates disputes)
- Set contradictory multipliers (e.g., negative)
- Forget to set valid_from/valid_until on time-limited offers

---

## Troubleshooting

**Q: Price seems too high**
A: Check material multiplier, body config adjustment, customizations, and urgency charges

**Q: Discount not applied**
A: Verify discount code is 'active', within valid date range, and min amount met

**Q: Custom tailor price not working**
A: Ensure entry in `tailor_custom_pricing` with all 3 FKs (tailor, template, material)

**Q: Embroidery cost calculation wrong**
A: Verify area_sq_inches is correct and rate is being multiplied properly

---

**Last Updated:** 2026-04-19
**Version:** 1.0
**Status:** ✅ Complete
