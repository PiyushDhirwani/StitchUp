# Multi-Item Orders Architecture
## Order Items Table Documentation

---

## Overview

The **`order_items`** table is a critical new addition that enables the platform to support **multi-item orders** where a single order can contain multiple pieces of clothing.

### Use Cases

#### Example 1: Salwar + Kurta + Scarf Bundle
```
Order ID: 1001
├─ Item 1: Salwar (Traditional) - Cotton
├─ Item 2: Kurta (Modern) - Silk
└─ Item 3: Dupatta (Embroidered) - Georgette

Total Order Cost: Item1_Cost + Item2_Cost + Item3_Cost
Estimated Delivery: Same (all items ready together)
```

#### Example 2: Salwar + Kurta (Matched Set)
```
Order ID: 1002
├─ Item 1: Salwar (Indo-Western) - Crepe
└─ Item 2: Kurta (Short Kurta) - Cotton Blend

Total Order Cost: Item1_Cost + Item2_Cost
```

#### Example 3: Single Item Order (Traditional)
```
Order ID: 1003
└─ Item 1: Dress (Fusion) - Chiffon

Total Order Cost: Item1_Cost (backward compatible)
```

---

## Table Structure

### order_items Table
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,                    -- Link to parent order
  item_sequence INT NOT NULL,               -- 1, 2, 3... for ordering
  template_type_id INT NOT NULL,            -- Type: Salwar, Kurta, Scarf, etc.
  template_sub_type_id INT NOT NULL,        -- Subtype: Traditional, Modern, etc.
  material_id INT,                          -- Fabric details
  quantity INT DEFAULT 1,                   -- How many of this item (usually 1)
  length_meters DECIMAL(5, 2),              -- Fabric length for this item
  item_description TEXT,                    -- Custom description
  item_cost DECIMAL(10, 2),                 -- Price for this item
  item_discount DECIMAL(10, 2) DEFAULT 0,   -- Discount on this item
  item_final_cost DECIMAL(10, 2),           -- item_cost - item_discount
  customization_details TEXT,               -- Special stitching requests
  embroidery_required BOOLEAN DEFAULT false,-- Embroidery flag
  embroidery_details TEXT,                  -- Embroidery specifications
  design_reference_url VARCHAR(500),        -- Image/reference link
  special_notes TEXT,                       -- Any special instructions
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Key Differences from Previous Schema

### Before (Single Item Per Order)
```sql
-- Orders table
orders (
  id,
  template_type_id,      -- ❌ Only ONE template
  template_sub_type_id,  -- ❌ Only ONE sub type
  material_id,           -- ❌ Only ONE material
  ...
)
```

**Problem:** Can't handle "Salwar + Kurta + Scarf" in single order

### After (Multiple Items Per Order)
```sql
-- Orders table
orders (
  id,
  number_of_items INT,   -- ✅ Tracks item count
  total_cost,
  final_amount,
  ...
)

-- Order Items table
order_items (
  order_id,
  item_sequence,         -- ✅ Item 1, 2, 3...
  template_type_id,      -- ✅ Template for THIS item
  template_sub_type_id,  -- ✅ Subtype for THIS item
  material_id,           -- ✅ Material for THIS item
  item_cost,
  item_final_cost,
  ...
)
```

**Benefit:** Unlimited items per order, flexible bundle creation

---

## Design Patterns

### Pattern 1: Creating a Multi-Item Order

```sql
-- Step 1: Create main order
INSERT INTO orders (consumer_id, order_status, total_cost, final_amount, number_of_items)
VALUES (123, 'created', 5000, 4500, 3);

SET @order_id = LAST_INSERT_ID(); -- e.g., 1001

-- Step 2: Add Item 1 (Salwar)
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 1, 1, 1, 1, 2.5, 1500, 1400);

-- Step 3: Add Item 2 (Kurta)
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 2, 2, 2, 2, 1.5, 2000, 1900);

-- Step 4: Add Item 3 (Dupatta)
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, length_meters, item_cost, item_final_cost)
VALUES (@order_id, 3, 4, 1, 3, 3.0, 800, 700);

-- Total: 1400 + 1900 + 700 = 4000 (final_amount should be sum of item_final_costs)
```

### Pattern 2: Retrieving Full Order with Items

```sql
SELECT
  o.id as order_id,
  o.order_status,
  o.consumer_id,
  o.tailor_id,
  o.total_cost,
  o.final_amount,
  o.delivery_date,
  o.urgency_level
FROM orders o
WHERE o.id = 1001;

-- Get all items in this order
SELECT
  oi.item_sequence,
  tt.type_name,
  tst.sub_type_name,
  m.material_name,
  oi.length_meters,
  oi.item_cost,
  oi.item_discount,
  oi.item_final_cost,
  oi.customization_details,
  oi.embroidery_required
FROM order_items oi
LEFT JOIN template_type tt ON oi.template_type_id = tt.id
LEFT JOIN template_sub_type tst ON oi.template_sub_type_id = tst.id
LEFT JOIN material m ON oi.material_id = m.id
WHERE oi.order_id = 1001
ORDER BY oi.item_sequence;
```

### Pattern 3: Item-Based Pricing

```sql
-- Calculate order total from items
SELECT
  order_id,
  COUNT(*) as item_count,
  SUM(item_cost) as subtotal,
  SUM(item_discount) as total_discount,
  SUM(item_final_cost) as total_after_discount
FROM order_items
WHERE order_id = 1001
GROUP BY order_id;
```

### Pattern 4: Update Item Details

```sql
-- Update embroidery details for Item 2
UPDATE order_items
SET embroidery_required = true,
    embroidery_details = 'Golden zari embroidery on sleeves'
WHERE order_id = 1001 AND item_sequence = 2;
```

---

## API Integration Examples

### POST /orders (Create Multi-Item Order)
```json
{
  "consumer_id": 123,
  "delivery_date": "2026-05-15",
  "urgency_level": "express",
  "items": [
    {
      "template_type_id": 1,      // Salwar
      "template_sub_type_id": 1,  // Traditional
      "material_id": 1,            // Cotton
      "length_meters": 2.5,
      "item_cost": 1500,
      "customization_details": "Add side zippers",
      "embroidery_required": true,
      "embroidery_details": "Floral pattern on hem"
    },
    {
      "template_type_id": 2,      // Kurta
      "template_sub_type_id": 2,  // Long Kurta
      "material_id": 2,            // Silk
      "length_meters": 1.5,
      "item_cost": 2000,
      "customization_details": "Extended length",
      "embroidery_required": false
    },
    {
      "template_type_id": 4,      // Dupatta
      "template_sub_type_id": 2,  // Embroidered
      "material_id": 3,            // Georgette
      "length_meters": 3.0,
      "item_cost": 800
    }
  ],
  "body_measurement_id": 45,
  "special_instructions": "Urgent - needed for wedding event"
}
```

**Backend Logic:**
```python
def create_order(request_data):
    # 1. Create primary order
    order = Orders.create(
        consumer_id=request_data['consumer_id'],
        order_status='created',
        number_of_items=len(request_data['items']),
        total_cost=sum(item['item_cost'] for item in request_data['items']),
        delivery_date=request_data['delivery_date'],
        urgency_level=request_data['urgency_level']
    )

    # 2. Create order details
    OrderDetails.create(
        order_id=order.id,
        body_measurement_id=request_data.get('body_measurement_id'),
        total_fabric_length_meters=sum(item['length_meters'] for item in request_data['items'])
    )

    # 3. Create each item
    for index, item in enumerate(request_data['items'], 1):
        OrderItems.create(
            order_id=order.id,
            item_sequence=index,
            template_type_id=item['template_type_id'],
            template_sub_type_id=item['template_sub_type_id'],
            material_id=item['material_id'],
            length_meters=item['length_meters'],
            item_cost=item['item_cost'],
            item_final_cost=item['item_cost'],  # Before discount
            customization_details=item.get('customization_details'),
            embroidery_required=item.get('embroidery_required', False),
            embroidery_details=item.get('embroidery_details')
        )

    # 4. Create status history
    OrderStatusHistory.create(
        order_id=order.id,
        current_status='created',
        status_notes='Order created with {} items'.format(len(request_data['items']))
    )

    return order
```

### GET /orders/{order_id}
```json
{
  "order_id": 1001,
  "order_status": "created",
  "consumer_id": 123,
  "tailor_id": null,
  "number_of_items": 3,
  "total_cost": 4300,
  "discount_amount": 300,
  "final_amount": 4000,
  "delivery_date": "2026-05-15",
  "urgency_level": "express",
  "items": [
    {
      "item_sequence": 1,
      "type_name": "Salwar",
      "sub_type_name": "Traditional",
      "material_name": "Cotton",
      "length_meters": 2.5,
      "item_cost": 1500,
      "item_discount": 100,
      "item_final_cost": 1400,
      "customization_details": "Add side zippers",
      "embroidery_required": true,
      "embroidery_details": "Floral pattern on hem"
    },
    {
      "item_sequence": 2,
      "type_name": "Kurta",
      "sub_type_name": "Long Kurta",
      "material_name": "Silk",
      "length_meters": 1.5,
      "item_cost": 2000,
      "item_discount": 100,
      "item_final_cost": 1900,
      "embroidery_required": false
    },
    {
      "item_sequence": 3,
      "type_name": "Dupatta",
      "sub_type_name": "Embroidered",
      "material_name": "Georgette",
      "length_meters": 3.0,
      "item_cost": 800,
      "item_discount": 100,
      "item_final_cost": 700
    }
  ],
  "created_at": "2026-04-19T10:30:00Z",
  "updated_at": "2026-04-19T10:30:00Z"
}
```

---

## Frontend Integration

### Consumer Frontend: Multi-Item Order Creation

```javascript
// Step 1: Start building order
const orderBuilder = {
  items: [],

  // Add item to cart
  addItem(templateTypeId, templateSubTypeId, materialId, lengthMeters, cost) {
    this.items.push({
      item_sequence: this.items.length + 1,
      template_type_id: templateTypeId,
      template_sub_type_id: templateSubTypeId,
      material_id: materialId,
      length_meters: lengthMeters,
      item_cost: cost,
      customization_details: "",
      embroidery_required: false
    });
  },

  // Remove item from cart
  removeItem(itemSequence) {
    this.items = this.items.filter(i => i.item_sequence !== itemSequence);
    // Renumber sequences
    this.items.forEach((item, idx) => item.item_sequence = idx + 1);
  },

  // Update item details
  updateItem(itemSequence, updateData) {
    const item = this.items.find(i => i.item_sequence === itemSequence);
    Object.assign(item, updateData);
  },

  // Get total cost
  getTotalCost() {
    return this.items.reduce((sum, item) => sum + item.item_cost, 0);
  },

  // Submit order
  submitOrder() {
    return fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consumer_id: currentUser.id,
        delivery_date: this.deliveryDate,
        urgency_level: this.urgency,
        items: this.items,
        body_measurement_id: selectedMeasurement.id
      })
    });
  }
};
```

### Display Order with Items

```html
<div class="order-summary">
  <h3>Order #{orderId}</h3>
  <p>Items: {{numberofItems}}</p>

  <div class="order-items">
    {{#each items}}
    <div class="item-card">
      <h4>Item {{item_sequence}}: {{type_name}} - {{sub_type_name}}</h4>
      <p>Material: {{material_name}}</p>
      <p>Length: {{length_meters}} meters</p>
      <p>Cost: ₹{{item_final_cost}}</p>
      {{#if embroidery_required}}
        <p><strong>Embroidery:</strong> {{embroidery_details}}</p>
      {{/if}}
      <p>{{customization_details}}</p>
    </div>
    {{/each}}
  </div>

  <div class="order-totals">
    <p><strong>Subtotal:</strong> ₹{{total_cost}}</p>
    <p><strong>Discount:</strong> ₹{{discount_amount}}</p>
    <p><strong>Final Amount:</strong> ₹{{final_amount}}</p>
  </div>
</div>
```

---

## Database Queries by Use Case

### Query 1: Get all orders with complete item details
```sql
SELECT
  o.id as order_id,
  o.order_status,
  o.consumer_id,
  t.shop_name as tailor_name,
  o.number_of_items,
  o.final_amount,
  o.delivery_date,
  GROUP_CONCAT(CONCAT(tt.type_name, ' - ', tst.sub_type_name) SEPARATOR ', ') as items_summary
FROM orders o
LEFT JOIN user_tailor t ON o.tailor_id = t.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN template_type tt ON oi.template_type_id = tt.id
LEFT JOIN template_sub_type tst ON oi.template_sub_type_id = tst.id
WHERE o.consumer_id = 123
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Result:
-- | order_id | order_status | consumer_id | tailor_name | number_of_items | final_amount | items_summary |
-- | 1001     | created      | 123         | NULL        | 3               | 4000         | Salwar - Traditional, Kurta - Long Kurta, Dupatta - Embroidered |
```

### Query 2: Get average item cost per order
```sql
SELECT
  o.id as order_id,
  COUNT(oi.id) as item_count,
  AVG(oi.item_cost) as avg_item_cost,
  SUM(oi.item_cost) as total_items_cost
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.consumer_id = 123
GROUP BY o.id
HAVING COUNT(oi.id) > 0;
```

### Query 3: Find orders with specific item type
```sql
SELECT DISTINCT o.id, o.order_status, o.final_amount
FROM orders o
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN template_type tt ON oi.template_type_id = tt.id
WHERE tt.type_name = 'Salwar' AND o.order_status != 'cancelled'
ORDER BY o.created_at DESC;
```

### Query 4: Get tailor's workload (items to stitch)
```sql
SELECT
  t.id as tailor_id,
  t.shop_name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.number_of_items) as total_items_to_stitch
FROM user_tailor t
LEFT JOIN orders o ON t.id = o.tailor_id AND o.order_status IN ('tailor_assigned', 'cutting_started', 'stitching_in_progress', 'final_touch')
GROUP BY t.id
ORDER BY total_items_to_stitch DESC;
```

---

## Performance Considerations

### Indexing Strategy
```sql
-- Already in schema, but key indexes for multi-item queries:

-- Fast order retrieval with items
CREATE INDEX idx_order_items_order ON order_items(order_id, item_sequence);

-- Fast search by template in items
CREATE INDEX idx_order_items_template ON order_items(template_type_id, template_sub_type_id);

-- Report queries
CREATE INDEX idx_orders_consumer_status ON orders(consumer_id, order_status, created_at);
CREATE INDEX idx_orders_tailor_status ON orders(tailor_id, order_status);
```

### Denormalization
Keep these fields updated to avoid expensive calculations:
- `orders.number_of_items` - Count of items
- `orders.total_cost` - Sum before discount
- `orders.final_amount` - Sum of `order_items.item_final_cost`

Update via trigger when `order_items` changes:
```sql
CREATE TRIGGER update_order_totals_after_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
  UPDATE orders
  SET number_of_items = (SELECT COUNT(*) FROM order_items WHERE order_id = NEW.order_id),
      total_cost = (SELECT SUM(item_cost) FROM order_items WHERE order_id = NEW.order_id),
      final_amount = (SELECT SUM(item_final_cost) FROM order_items WHERE order_id = NEW.order_id)
  WHERE id = NEW.order_id;
END;
```

---

## Backward Compatibility

### Single-Item Orders Still Work
If an order has only 1 item, existing code that expects `orders.template_type_id` can:

**Option 1:** Query the single order_item
```sql
SELECT oi.template_type_id, oi.template_sub_type_id
FROM order_items oi
WHERE oi.order_id = ? AND oi.item_sequence = 1;
```

**Option 2:** Add view for backward compatibility
```sql
CREATE VIEW orders_with_single_item AS
SELECT
  o.*,
  oi.template_type_id,
  oi.template_sub_type_id,
  oi.material_id
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id AND oi.item_sequence = 1
WHERE o.number_of_items = 1;
```

---

## Migration from Old Schema

If migrating from old single-item schema:
```sql
-- Copy existing data to new structure
INSERT INTO order_items
(order_id, item_sequence, template_type_id, template_sub_type_id, material_id, item_cost, item_final_cost)
SELECT
  id AS order_id,
  1 AS item_sequence,
  old_template_type_id,
  old_template_sub_type_id,
  old_material_id,
  total_cost,
  final_amount
FROM orders_old;

-- Update orders table
UPDATE orders
SET number_of_items = 1
WHERE id IN (SELECT order_id FROM order_items);
```

