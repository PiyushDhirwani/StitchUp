# Order Placement & Pricing Calculation Guide

## Complete Order Flow with Pricing Examples

---

## Order Placement Process

### Phase 1: User Selects Item

```
User Action                          Backend Response
─────────────────────────────────────────────────────
1. Browse Templates
   GET /templates
                     ────────────→  Return all templates
                                    with base pricing

2. View Template Details
   GET /templates/1                 Return Salwar Suit
                     ────────────→  with subtypes:
                                    - Traditional (₹800)
                                    - Modern (₹900)
                                    - Indo-Western (₹950)

3. View Subtype Options
   GET /templates/1/2               Return Modern Salwar
                     ────────────→  with all available:
                                    - Materials (Cotton/Silk/Georgette)
                                    - Customizations
                                    - Body configs
```

---

### Phase 2: User Configures Order

```
User Selects                    Sub-Type Pricing Add-On
─────────────────────────────────────────────────────
Template Type: Salwar Suit      Base: ₹800
  ↓
Sub Type: Modern                +₹100 (adjustment)
  ↓
Material: Silk                  ×1.5 (multiplier)
  ↓
Body Config: Plus Size          +₹200 (adjustment)
  ↓
Customizations:
  - Simple Embroidery (5 sq")   +₹175 (₹150 base + 5×₹5)
  - Side Zippers                +₹100
  ↓
Urgency: Normal                 ×1.0 (multiplier)
```

---

## Detailed Pricing Calculation

### Example 1: Basic Kurta Order

**User Selections:**
```
Template: Kurta (id=2, base=₹600)
Sub-Type: Short Kurta (id=4, adjustment=$0)
Material: Cotton (id=1, multiplier=1.0)
Body Config: Standard (adjustment=$0)
Customizations: None
Urgency: Normal (×1.0)
Discount: None
```

**Calculation Flow:**

```
Step 1: Base Template Price
        Short Kurta = ₹600

Step 2: Sub-Type Adjustment
        ₹600 + ₹0 = ₹600

Step 3: Material Multiplier
        ₹600 × 1.0 = ₹600

Step 4: Body Configuration
        ₹600 + ₹0 = ₹600

Step 5: Customizations
        No customizations = ₹0
        Running Total: ₹600

Step 6: Urgency Multiplier
        ₹600 × 1.0 = ₹600

Step 7: Discount
        No discount = ₹0

FINAL PRICE: ₹600

Advance Payment (50%): ₹300
Final Payment (50%): ₹300
```

---

### Example 2: Premium Salwar with Customizations

**User Selections:**
```
Template: Salwar Suit (id=1, base=₹800)
Sub-Type: Modern (id=2, adjustment=+₹100)
Material: Silk (id=2, multiplier=1.5)
Body Config: Plus Size (adjustment=+₹200)
Customizations:
  - Simple Embroidery: 5 sq inches
  - Side Zippers: 1
Urgency: Express (×1.25, +₹200)
Discount: FIRST10 (10%)
```

**Calculation Flow:**

```
Step 1: Base Template Price
        Salwar Suit = ₹800

Step 2: Sub-Type Adjustment
        ₹800 + ₹100 = ₹900

Step 3: Material Multiplier
        ₹900 × 1.5 (Silk) = ₹1350

Step 4: Body Configuration Adjustment
        ₹1350 + ₹200 (Plus Size) = ₹1550

Step 5: Customizations
        Embroidery: ₹150 + (5 × ₹5) = ₹175
        Side Zippers: ₹100
        Total Customizations: ₹275
        Running Total: ₹1550 + ₹275 = ₹1825

Step 6: Urgency Multiplier
        ₹1825 × 1.25 = ₹2281.25
        + Express Charge: +₹200
        Total: ₹2481.25

Step 7: Discount (FIRST10 = 10%)
        Discount Amount: ₹2481.25 × 0.10 = ₹248.13

FINAL PRICE: ₹2481.25 - ₹248.13 = ₹2233.12

Advance Payment (50%): ₹1116.56
Final Payment (50%): ₹1116.56
```

---

### Example 3: Complete Bundle (Multi-Item)

**Note:** For MVP, we support single item. Adding for future reference.

**User Selections:**
```
Item 1: Salwar Suit (Traditional)
        - Material: Cotton
        - Custom: Simple Embroidery (3 sq")
        Subtotal: ₹950 (₹800 + ₹150)

Item 2: Kurta (Long)
        - Material: Silk
        - No customization
        Subtotal: ₹1050 (₹700 base + ₹100 adj, ×1.5 = ₹900, no custom)

Item 3: Dupatta (Embroidered)
        - Material: Georgette
        - Special: Premium finishing
        Subtotal: ₹275 (₹250 + ₹25)

Bundle Total: ₹950 + ₹1050 + ₹275 = ₹2275
Bulk Discount (20%): -₹455
Urgency (Express): ₹225 surcharge

FINAL: ₹2275 - ₹455 + ₹225 = ₹2045
```

---

## Pricing API Workflow

### 1. Get Pricing for Preview (Before Order)

**Request:**
```bash
POST /pricing/calculate
{
  "template_type_id": 1,
  "template_sub_type_id": 2,
  "material_id": 2,
  "body_config": "plus_size",
  "customizations": [
    {
      "type": "embroidery",
      "name": "Simple Embroidery",
      "quantity": 5,
      "quantity_unit": "sq_inches"
    },
    {
      "type": "stitching",
      "name": "Side Zippers",
      "quantity": 1
    }
  ],
  "urgency_level": "express",
  "discount_code": null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing_breakdown": {
      "template": {
        "base_price": 800.00,
        "sub_type_name": "Modern",
        "sub_type_adjustment": 100.00,
        "subtotal": 900.00
      },
      "material": {
        "name": "Silk",
        "multiplier": 1.5,
        "adjusted_price": 1350.00
      },
      "body_configuration": {
        "factor": "plus_size",
        "adjustment": 200.00,
        "total_after_body": 1550.00
      },
      "customizations": [
        {
          "type": "embroidery",
          "name": "Simple Embroidery",
          "base_cost": 150.00,
          "quantity": 5,
          "per_unit": 5.00,
          "total": 175.00
        },
        {
          "type": "stitching",
          "name": "Side Zippers",
          "cost": 100.00,
          "total": 100.00
        }
      ],
      "customization_total": 275.00,
      "subtotal_before_urgency": 1825.00,
      "urgency": {
        "level": "express",
        "multiplier": 1.25,
        "surcharge": 200.00,
        "total_with_urgency": 2481.25
      },
      "discount": {
        "code": null,
        "amount": 0.00
      },
      "final_price": 2481.25,
      "payments": {
        "advance": 1240.63,
        "advance_percentage": 50,
        "final": 1240.62,
        "final_percentage": 50
      }
    }
  }
}
```

---

## Order Placement with Pricing

### Place Order Request

```bash
POST /orders
{
  "consumer_id": 123,
  "template_type_id": 1,
  "template_sub_type_id": 2,
  "material_id": 2,
  "body_measurement_id": 1,
  "fabric_length_meters": 2.5,
  "delivery_date": "2026-05-10",
  "urgency_level": "express",
  "customizations": [
    {
      "type": "embroidery",
      "name": "Simple Embroidery",
      "quantity": 5,
      "quantity_unit": "sq_inches"
    },
    {
      "type": "stitching",
      "name": "Side Zippers",
      "quantity": 1
    }
  ],
  "special_instructions": "Perfect fit is important",
  "delivery_address_line1": "123 Main Street",
  "delivery_city": "Mumbai",
  "delivery_state": "Maharashtra",
  "delivery_postal_code": "400001",
  "discount_code": null
}
```

### Order Response

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "order_id": 1001,
      "consumer_id": 123,
      "tailor_id": null,
      "order_status": "created",
      "number_of_items": 1,
      "urgency_level": "express",
      "delivery_date": "2026-05-10",
      "created_at": "2026-04-19T12:00:00Z"
    },
    "order_items": [
      {
        "item_id": 1,
        "item_sequence": 1,
        "template_type": "Salwar Suit",
        "template_sub_type": "Modern",
        "material": "Silk",
        "fabric_length_meters": 2.5,
        "customizations": [
          {
            "type": "embroidery",
            "name": "Simple Embroidery",
            "quantity": 5,
            "cost": 175.00
          },
          {
            "type": "stitching",
            "name": "Side Zippers",
            "cost": 100.00
          }
        ],
        "item_final_cost": 2481.25
      }
    ],
    "pricing": {
      "subtotal": 1825.00,
      "urgency_charge": 200.00,
      "discount_amount": 0.00,
      "final_amount": 2481.25
    },
    "payment_required": {
      "advance_payment": 1240.63,
      "advance_due_at": "2026-04-19T23:59:59Z",
      "payment_link": "https://pay.stitchup.app/order/1001/advance"
    }
  }
}
```

---

## Pricing Stored in Database

### What Gets Stored in `pricing_calculation_history`

After order placement, complete pricing calculation is stored:

```json
{
  "order_item_id": 1,
  "template_type_id": 1,
  "template_sub_type_id": 2,
  "material_id": 2,
  "base_template_price": 800.00,
  "template_sub_type_adjustment": 100.00,
  "material_multiplier": 1.5,
  "material_adjusted_price": 1350.00,
  "body_complexity_adjustment": 200.00,
  "customization_total": 275.00,
  "subtotal_before_urgency": 1825.00,
  "urgency_multiplier": 1.25,
  "urgency_surcharge": 200.00,
  "with_urgency": 2481.25,
  "discount_percent": 0.00,
  "discount_amount": 0.00,
  "final_price": 2481.25,
  "calculation_notes": "Express Salwar with embroidery + zippers + Plus size"
}
```

**Benefits of storing this:**
- Complete audit trail for disputes
- Historical pricing for analytics
- Can see how pricing changed over time
- Dispute resolution (customer vs platform)
- Tailor compensation calculation

---

## Special Pricing Scenarios

### Scenario 1: Tailor Has Custom Pricing

```
Global Pricing:
  Salwar Suit: ₹800
  Material Silk: ×1.5

Tailor #5 Custom Pricing:
  Salwar Suit + Silk: ₹1200 (override)

If order is for Tailor #5:
  Use: ₹1200 (not ₹800 × 1.5 = ₹1200)
```

---

### Scenario 2: Bulk Discount Eligibility

```
Order Total Before Discount: ₹2500

Bulk Discount Rules:
  - ₹5000+: 20% off
  - ₹3000-4999: 15% off
  - ₹2000-2999: 10% off
  - <₹2000: 5% off

This order gets: 10% discount = ₹250
Final: ₹2250
```

---

### Scenario 3: Promo Code Applied

```
Promo Code: WELCOME20

Eligible For:
  - First 1000 users
  - Max ₹500 discount
  - Valid till 2026-05-31

Calculation:
  20% of ₹2481.25 = ₹496.25
  But max = ₹500
  Discount Applied: ₹496.25
  Final: ₹2481.25 - ₹496.25 = ₹1985
```

---

## Edge Cases & Validations

### Validation 1: Body Configuration Compatibility

```
Body Config: "custom_proportions"
Adds: ₹300 + multiplier 1.3

Must validate:
- Not all templates support custom proportions
- May need multiple fittings (additional cost)
- Tailor must be expert-level (rating >= 4.5)
```

### Validation 2: Material Availability

```
User selects: Salwar Suit + Silk
But status='discontinued' for Silk

Action:
- Suggest alternatives: Georgette (1.2x) instead
- Or force user to select active material
```

### Validation 3: Delivery Date Feasibility

```
User selects: Salwar + Complex Embroidery + 1-day delivery
Would require: 8 hours (normal) × 1.5 (embroidery complexity)
                = 12 hours (not possible in 1 day)

Action:
- Show warning: "May not meet deadline"
- Suggest Express (2-3 days minimum)
- Or downgrade complexity
```

---

## Future Enhancements

### AI-Based Pricing
```
Could adjust pricing based on:
- Tailor's current workload
- Seasonal demand
- Material cost fluctuations
- Region-specific rates
```

### Loyalty Program
```
Points = Final Amount / 100
Existing customers: 20% point bonus
Redemption: 100 points = ₹50 discount
```

### Dynamic Urgency Pricing
```
Current system: Fixed multipliers
Future: ML-based pricing that adjusts based on tailor availability
```

---

**Last Updated:** 2026-04-19
**Status:** ✅ Ready for Implementation
