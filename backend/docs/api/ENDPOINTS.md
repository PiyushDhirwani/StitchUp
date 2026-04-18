# StitchUp API Documentation
## Complete API Reference for Consumer-Tailor Stitching Platform

**Version:** 1.0
**Last Updated:** 2026-04-19
**Base URL:** `http://localhost:3000/api` (development)

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Template APIs](#template-apis)
4. [Order APIs](#order-apis)
5. [Pricing APIs](#pricing-apis)
6. [Common Response Formats](#common-response-formats)
7. [Error Handling](#error-handling)
8. [Request/Response Examples](#requestresponse-examples)

---

## Authentication APIs

### 1. Consumer Registration
**Endpoint:** `POST /auth/consumer/register`

**Purpose:** Register a new consumer account

**Request Payload:**
```json
{
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required, unique, valid email)",
  "phone_number": "string (required, unique, 10 digits)",
  "password": "string (required, min 8 chars, alphanumeric+special)",
  "city": "string (required)",
  "state": "string (required)",
  "postal_code": "string (required)",
  "country": "string (default: India)",
  "address_line1": "string (required)",
  "address_line2": "string (optional)",
  "bio": "string (optional)",
  "latitude": "decimal (optional)",
  "longitude": "decimal (optional)",
  "preferred_radius_km": "integer (default: 10)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Consumer registered successfully",
  "data": {
    "user_id": 123,
    "consumer_id": 45,
    "email": "consumer@example.com",
    "phone_number": "9876543210",
    "role": "consumer",
    "created_at": "2026-04-19T10:30:00Z"
  },
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validations:**
- Email must be unique
- Phone number must be unique
- Phone number must be 10 digits
- Password minimum 8 characters
- Required fields: first_name, last_name, email, phone, password, address, city, state, postal_code

---

### 2. Tailor Registration
**Endpoint:** `POST /auth/tailor/register`

**Purpose:** Register a new tailor account

**Request Payload:**
```json
{
  "first_name": "string (required)",
  "last_name": "string (required)",
  "email": "string (required, unique, valid email)",
  "phone_number": "string (required, unique, 10 digits)",
  "password": "string (required, min 8 chars)",
  "shop_name": "string (required)",
  "shop_address_line1": "string (required)",
  "shop_address_line2": "string (optional)",
  "city": "string (required)",
  "state": "string (required)",
  "postal_code": "string (required)",
  "country": "string (default: India)",
  "latitude": "decimal (optional)",
  "longitude": "decimal (optional)",
  "business_type": "string (optional, e.g., 'Individual', 'Partnership')",
  "years_of_experience": "integer (optional)",
  "bio": "string (optional)",
  "shop_registration_number": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tailor registered successfully",
  "data": {
    "user_id": 124,
    "tailor_id": 12,
    "email": "tailor@example.com",
    "phone_number": "9123456789",
    "role": "tailor",
    "shop_name": "Expert Tailoring",
    "verification_status": "pending",
    "tailor_status": "active",
    "created_at": "2026-04-19T10:35:00Z"
  },
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validations:**
- Same as consumer registration
- Shop name required
- Tailor account starts with verification_status = 'pending'

---

### 3. Login (OTP Based)
**Endpoint:** `POST /auth/login`

**Purpose:** Login using phone number and OTP

**Step 1: Request OTP**

**Endpoint:** `POST /auth/login/request-otp`

**Request:**
```json
{
  "phone_number": "string (required, 10 digits)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "OTP sent to registered mobile number",
  "phone_number": "9876543210",
  "otp_expiry_seconds": 300,
  "session_id": "sess_abc123xyz"
}
```

---

**Step 2: Verify OTP & Login**

**Endpoint:** `POST /auth/login/verify-otp`

**Request:**
```json
{
  "phone_number": "string (required, 10 digits)",
  "otp": "string (required, 6 digits)",
  "session_id": "string (required, from request-otp response)"
}
```

**Response (200 OK):**
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
    "consumer_id": 45,
    "last_login": "2026-04-19T10:45:00Z"
  },
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expiry_seconds": 86400,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validations:**
- Phone number must exist in database
- OTP must match and not be expired
- Session ID must be valid

---

## User Management APIs

### 4. Get User Details
**Endpoint:** `GET /user/details/{userId}`

**Purpose:** Get user profile information

**Headers:**
```
Authorization: Bearer {auth_token}
Content-Type: application/json
```

**Path Parameters:**
```
userId: integer (required)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "email": "consumer@example.com",
    "phone_number": "9876543210",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture_url": "https://cdn.example.com/profile123.jpg",
    "role": "consumer",
    "is_verified": true,
    "created_at": "2026-01-15T08:00:00Z",
    "updated_at": "2026-04-19T10:45:00Z",
    "consumer_profile": {
      "consumer_id": 45,
      "address_line1": "123 Main Street",
      "address_line2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001",
      "country": "India",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "preferred_radius_km": 10,
      "consumer_status": "active",
      "bio": "Fashion enthusiast"
    }
  }
}
```

---

### 5. Update User Profile
**Endpoint:** `PUT /user/details/{userId}`

**Purpose:** Update user profile information

**Request Payload (Partial update, any field optional):**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "profile_picture_url": "string (optional)",
  "bio": "string (optional)",
  "city": "string (optional)",
  "state": "string (optional)",
  "postal_code": "string (optional)",
  "preferred_radius_km": "integer (optional)",
  "latitude": "decimal (optional)",
  "longitude": "decimal (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user_id": 123,
    "updated_at": "2026-04-19T11:00:00Z"
  }
}
```

---

## Template APIs

### 6. Get All Templates with Subtypes
**Endpoint:** `GET /templates`

**Purpose:** Get list of all available template types with their subtypes and pricing

**Query Parameters (Optional):**
```
status: "active" | "retired" (default: "active")
category: "Traditional" | "Western" | "Formal" | "Accessories" | "Custom"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "template_type": {
        "id": 1,
        "type_name": "Salwar Suit",
        "description": "Traditional/modern salwar suit set",
        "image_url": "https://cdn.example.com/salwar.jpg",
        "category": "Traditional",
        "status": "active",
        "base_price": 800.00,
        "complexity_level": "moderate",
        "estimated_hours": 8.0
      },
      "sub_types": [
        {
          "id": 1,
          "sub_type_name": "Traditional",
          "description": "Classic salwar suit design",
          "image_url": "https://cdn.example.com/salwar-trad.jpg",
          "status": "active",
          "price_adjustment": 0.00,
          "final_base_price": 800.00
        },
        {
          "id": 2,
          "sub_type_name": "Modern",
          "description": "Contemporary salwar suit",
          "image_url": "https://cdn.example.com/salwar-mod.jpg",
          "status": "active",
          "price_adjustment": 100.00,
          "final_base_price": 900.00
        },
        {
          "id": 3,
          "sub_type_name": "Indo-Western",
          "description": "Fusion style salwar",
          "image_url": "https://cdn.example.com/salwar-fusion.jpg",
          "status": "active",
          "price_adjustment": 150.00,
          "final_base_price": 950.00
        }
      ]
    },
    {
      "template_type": {
        "id": 2,
        "type_name": "Kurta",
        "description": "Casual or formal kurta",
        "base_price": 600.00,
        "complexity_level": "simple",
        "estimated_hours": 6.0
      },
      "sub_types": [
        {
          "id": 4,
          "sub_type_name": "Short Kurta",
          "price_adjustment": 0.00,
          "final_base_price": 600.00
        },
        {
          "id": 5,
          "sub_type_name": "Long Kurta",
          "price_adjustment": 100.00,
          "final_base_price": 700.00
        }
      ]
    }
  ],
  "total_templates": 9,
  "total_sub_types": 15
}
```

---

### 7. Get Template Details with Subtype Details
**Endpoint:** `GET /templates/{templateId}`

**Purpose:** Get detailed information about a specific template type

**Path Parameters:**
```
templateId: integer (required)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "template_type": {
      "id": 1,
      "type_name": "Salwar Suit",
      "description": "Traditional/modern salwar suit set",
      "image_url": "https://cdn.example.com/salwar.jpg",
      "category": "Traditional",
      "status": "active",
      "base_price": 800.00,
      "complexity_level": "moderate",
      "estimated_hours": 8.0
    },
    "sub_types": [
      {
        "id": 1,
        "sub_type_name": "Traditional",
        "description": "Classic salwar suit design",
        "sizing_notes": "Fits M-L sizes",
        "image_url": "https://cdn.example.com/salwar-trad.jpg",
        "status": "active",
        "display_order": 1,
        "price_adjustment": 0.00,
        "final_base_price": 800.00
      },
      {
        "id": 2,
        "sub_type_name": "Modern",
        "description": "Contemporary salwar suit",
        "sizing_notes": "Fits all sizes with adjustments",
        "price_adjustment": 100.00,
        "final_base_price": 900.00
      },
      {
        "id": 3,
        "sub_type_name": "Indo-Western",
        "description": "Fusion style salwar",
        "price_adjustment": 150.00,
        "final_base_price": 950.00
      }
    ]
  }
}
```

---

### 8. Get Specific Subtype Details
**Endpoint:** `GET /templates/{templateId}/{subTemplateId}`

**Purpose:** Get detailed information about a specific sub-template with customization options

**Path Parameters:**
```
templateId: integer (required)
subTemplateId: integer (required)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "template_type": {
      "id": 1,
      "type_name": "Salwar Suit",
      "base_price": 800.00
    },
    "sub_type": {
      "id": 1,
      "sub_type_name": "Traditional",
      "description": "Classic salwar suit design",
      "sizing_notes": "Fits M-L sizes",
      "image_url": "https://cdn.example.com/salwar-trad.jpg",
      "status": "active",
      "price_adjustment": 0.00,
      "final_base_price": 800.00
    },
    "available_customizations": {
      "embroidery": [
        {
          "name": "Simple Embroidery",
          "base_cost": 150.00,
          "cost_per_unit": 5.00,
          "unit_type": "per inch"
        },
        {
          "name": "Detailed Embroidery",
          "base_cost": 300.00,
          "cost_per_unit": 10.00,
          "unit_type": "per inch"
        },
        {
          "name": "Heavy Zari",
          "base_cost": 500.00,
          "cost_per_unit": 20.00,
          "unit_type": "per inch"
        }
      ],
      "stitching": [
        {
          "name": "Side Zippers",
          "cost": 100.00
        },
        {
          "name": "Extended Length",
          "cost": 50.00
        },
        {
          "name": "Custom Sleeves",
          "cost": 75.00
        }
      ]
    },
    "available_materials": [
      {
        "id": 1,
        "name": "Cotton",
        "cost_multiplier": 1.0,
        "final_price": 800.00
      },
      {
        "id": 2,
        "name": "Silk",
        "cost_multiplier": 1.5,
        "final_price": 1200.00
      },
      {
        "id": 3,
        "name": "Georgette",
        "cost_multiplier": 1.2,
        "final_price": 960.00
      }
    ]
  }
}
```

---

## Order APIs

### 9. Place an Order (Single Item for MVP)
**Endpoint:** `POST /orders`

**Purpose:** Create a new order for a single template item

**Request Payload:**
```json
{
  "consumer_id": "integer (required)",
  "template_type_id": "integer (required)",
  "template_sub_type_id": "integer (required)",
  "material_id": "integer (required)",
  "body_measurement_id": "integer (required, existing measurement)",
  "fabric_length_meters": "decimal (required, for validation)",
  "delivery_date": "date string ISO 8601 (required, yyyy-mm-dd)",
  "urgency_level": "string (optional: 'normal' | 'express' | 'priority', default: 'normal')",
  "customizations": [
    {
      "type": "embroidery | stitching | treatment",
      "name": "string (customization name)",
      "quantity": "integer (optional, for measurements)",
      "quantity_unit": "string (optional, e.g., 'sq_inches')"
    }
  ],
  "special_instructions": "string (optional, max 500 chars)",
  "delivery_address_line1": "string (required)",
  "delivery_address_line2": "string (optional)",
  "delivery_city": "string (required)",
  "delivery_state": "string (required)",
  "delivery_postal_code": "string (required)",
  "is_delivery_same_as_profile": "boolean (optional, default: true)",
  "discount_code": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order_id": 1001,
    "consumer_id": 123,
    "order_status": "created",
    "number_of_items": 1,
    "items": [
      {
        "item_id": 1,
        "template_type": "Salwar Suit",
        "template_sub_type": "Traditional",
        "material": "Silk",
        "fabric_length_meters": 2.5,
        "item_cost": 800.00,
        "customization_cost": 150.00,
        "item_final_cost": 950.00
      }
    ],
    "pricing_breakdown": {
      "base_template_price": 800.00,
      "sub_type_adjustment": 0.00,
      "material_multiplier": 1.5,
      "material_adjusted_price": 1200.00,
      "body_config_adjustment": 0.00,
      "customization_total": 150.00,
      "subtotal": 1350.00,
      "urgency_multiplier": 1.0,
      "with_urgency": 1350.00,
      "discount_code": null,
      "discount_amount": 0.00,
      "final_amount": 1350.00
    },
    "delivery_date": "2026-05-10",
    "created_at": "2026-04-19T12:00:00Z",
    "next_action": "Pay advance payment of ₹675"
  },
  "payment_required": {
    "amount": 675.00,
    "percentage": 50,
    "due_at": "2026-04-19T23:59:59Z"
  }
}
```

**Validations:**
- Consumer must exist and be active
- Template and sub-template must exist and be active
- Material must exist and be active
- Body measurement must belong to consumer
- Delivery date must be >= today + minimum_days
- Delivery address required
- Customizations must have valid types and names

---

### 10. Get Order History
**Endpoint:** `GET /orders/history/{userId}`

**Purpose:** Get all orders for a consumer or tailor

**Path Parameters:**
```
userId: integer (required)
```

**Query Parameters (Optional):**
```
status: "created" | "material_received" | "tailor_assigned" | "cutting_started" | "stitching_in_progress" | "final_touch" | "ready_for_collection" | "completed" | "cancelled"
sort_by: "created_at" | "delivery_date" | "updated_at" (default: "created_at")
order: "asc" | "desc" (default: "desc")
limit: integer (default: 20, max: 100)
offset: integer (default: 0)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "order_id": 1001,
        "order_status": "tailor_assigned",
        "consumer_id": 123,
        "tailor_id": 12,
        "tailor_name": "Expert Tailoring",
        "number_of_items": 1,
        "final_amount": 1350.00,
        "delivery_date": "2026-05-10",
        "created_at": "2026-04-19T12:00:00Z",
        "items_summary": "Salwar Suit (Traditional)",
        "payment_status": "advance_paid",
        "status_updated_at": "2026-04-19T14:30:00Z"
      },
      {
        "order_id": 1000,
        "order_status": "completed",
        "consumer_id": 123,
        "tailor_id": 5,
        "tailor_name": "Quick Tailors",
        "number_of_items": 1,
        "final_amount": 950.00,
        "delivery_date": "2026-04-15",
        "created_at": "2026-04-05T10:00:00Z",
        "items_summary": "Kurta (Short)",
        "payment_status": "fully_paid",
        "status_updated_at": "2026-04-15T16:00:00Z",
        "rating_pending": true
      }
    ],
    "pagination": {
      "total_count": 15,
      "limit": 20,
      "offset": 0,
      "has_more": false
    }
  }
}
```

---

### 11. Get Order Details
**Endpoint:** `GET /orders/{orderId}`

**Purpose:** Get complete details of a specific order

**Path Parameters:**
```
orderId: integer (required)
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "order": {
      "order_id": 1001,
      "order_status": "tailor_assigned",
      "consumer_id": 123,
      "tailor_id": 12,
      "number_of_items": 1,
      "urgency_level": "normal",
      "delivery_date": "2026-05-10",
      "estimated_delivery_date": "2026-05-10",
      "created_at": "2026-04-19T12:00:00Z",
      "updated_at": "2026-04-19T14:30:00Z"
    },
    "consumer": {
      "consumer_id": 123,
      "name": "John Doe",
      "email": "consumer@example.com",
      "phone": "9876543210"
    },
    "tailor": {
      "tailor_id": 12,
      "shop_name": "Expert Tailoring",
      "name": "Rajesh Kumar",
      "phone": "9123456789",
      "email": "tailor@example.com",
      "average_rating": 4.5,
      "total_orders": 250
    },
    "items": [
      {
        "item_id": 1,
        "item_sequence": 1,
        "template_type": {
          "id": 1,
          "name": "Salwar Suit"
        },
        "template_sub_type": {
          "id": 1,
          "name": "Traditional"
        },
        "material": {
          "id": 2,
          "name": "Silk"
        },
        "fabric_length_meters": 2.5,
        "customizations": [
          {
            "type": "embroidery",
            "name": "Simple Embroidery",
            "area_sq_inches": 5,
            "cost": 150.00
          }
        ],
        "item_cost": 800.00,
        "customization_cost": 150.00,
        "item_final_cost": 1350.00
      }
    ],
    "pricing": {
      "base_price": 800.00,
      "materials_total": 200.00,
      "customizations_total": 150.00,
      "subtotal": 1350.00,
      "discount_code": null,
      "discount_amount": 0.00,
      "final_amount": 1350.00
    },
    "delivery_address": {
      "address_line1": "123 Main Street",
      "address_line2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    },
    "status_history": [
      {
        "status": "created",
        "changed_at": "2026-04-19T12:00:00Z",
        "notes": "Order created"
      },
      {
        "status": "material_received",
        "changed_at": "2026-04-19T13:00:00Z",
        "notes": "Fabric received at shop"
      },
      {
        "status": "tailor_assigned",
        "changed_at": "2026-04-19T14:30:00Z",
        "notes": "Assigned to Rajesh Kumar"
      }
    ],
    "appointments": [
      {
        "appointment_id": 1,
        "type": "fabric_drop",
        "date": "2026-04-19",
        "time": "14:00-14:30",
        "status": "completed",
        "location": "Expert Tailoring Shop"
      },
      {
        "appointment_id": 2,
        "type": "measurement",
        "date": "2026-04-21",
        "time": "15:00-15:30",
        "status": "scheduled",
        "location": "Expert Tailoring Shop"
      }
    ],
    "payments": {
      "advance_payment": {
        "amount": 675.00,
        "percentage": 50,
        "status": "completed",
        "paid_at": "2026-04-19T13:45:00Z",
        "transaction_id": "TXN20260419001"
      },
      "final_payment": {
        "amount": 675.00,
        "percentage": 50,
        "status": "pending",
        "due_at": "2026-05-10T23:59:59Z"
      }
    }
  }
}
```

---

## Pricing APIs

### 12. Calculate Order Price
**Endpoint:** `POST /pricing/calculate`

**Purpose:** Calculate final price before placing order (for price preview)

**Request Payload:**
```json
{
  "template_type_id": "integer (required)",
  "template_sub_type_id": "integer (required)",
  "material_id": "integer (required)",
  "body_config": "string (optional: 'standard' | 'plus_size' | 'petite' | 'athletic' | 'custom_proportions')",
  "customizations": [
    {
      "type": "embroidery | stitching | treatment",
      "name": "string",
      "quantity": "integer (optional)",
      "quantity_unit": "string (optional)"
    }
  ],
  "urgency_level": "string (optional: 'normal' | 'express' | 'priority')",
  "discount_code": "string (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "base_template_price": 800.00,
    "template_sub_type_adjustment": 0.00,
    "subtotal_after_subtype": 800.00,
    "material": {
      "name": "Silk",
      "multiplier": 1.5,
      "adjusted_price": 1200.00
    },
    "body_configuration": {
      "factor": "standard",
      "adjustment": 0.00,
      "final_price_after_body": 1200.00
    },
    "customizations": [
      {
        "type": "embroidery",
        "name": "Simple Embroidery",
        "quantity": 5,
        "unit": "sq_inches",
        "cost": 150.00
      }
    ],
    "customization_total": 150.00,
    "subtotal_before_urgency": 1350.00,
    "urgency": {
      "level": "normal",
      "multiplier": 1.0,
      "charge": 0.00
    },
    "with_urgency": 1350.00,
    "discount": {
      "code": null,
      "type": null,
      "value": 0.00,
      "amount": 0.00
    },
    "final_price": 1350.00,
    "advance_payment_amount": 675.00,
    "advance_payment_percentage": 50,
    "final_payment_amount": 675.00
  }
}
```

---

### 13. Get Available Materials with Pricing
**Endpoint:** `GET /pricing/materials`

**Purpose:** Get all available materials with their cost multipliers

**Query Parameters (Optional):**
```
status: "active" | "discontinued" (default: "active")
material_type: "Natural" | "Synthetic" | "Blend"
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Cotton",
      "material_type": "Natural",
      "color": "White",
      "cost_multiplier": 1.0,
      "cost_per_meter": 100.00,
      "fiber_content": "100% Cotton",
      "care_instructions": "Hand wash, avoid bleach",
      "status": "active"
    },
    {
      "id": 2,
      "name": "Silk",
      "material_type": "Natural",
      "color": "Off-white",
      "cost_multiplier": 1.5,
      "cost_per_meter": 400.00,
      "fiber_content": "100% Silk",
      "care_instructions": "Dry clean recommended",
      "status": "active"
    }
  ]
}
```

---

### 14. Get Customization Options with Pricing
**Endpoint:** `GET /pricing/customizations`

**Purpose:** Get all available customizations organized by type

**Query Parameters (Optional):**
```
type: "embroidery" | "stitching" | "treatment"
status: "active" | "inactive" (default: "active")
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "embroidery": [
      {
        "id": 1,
        "name": "Simple Embroidery",
        "description": "Basic floral or geometric patterns",
        "base_cost": 150.00,
        "cost_per_unit": 5.00,
        "unit_type": "per inch",
        "status": "active"
      },
      {
        "id": 2,
        "name": "Detailed Embroidery",
        "description": "Intricate designs, multiple colors",
        "base_cost": 300.00,
        "cost_per_unit": 10.00,
        "unit_type": "per inch",
        "status": "active"
      },
      {
        "id": 3,
        "name": "Heavy Embroidery (Zari)",
        "description": "Gold/silver thread, luxury embroidery",
        "base_cost": 500.00,
        "cost_per_unit": 20.00,
        "unit_type": "per inch",
        "status": "active"
      }
    ],
    "stitching": [
      {
        "id": 7,
        "name": "Side Zippers",
        "description": "Add side zippers to salwar/dress",
        "cost": 100.00,
        "status": "active"
      },
      {
        "id": 8,
        "name": "Extended Length",
        "description": "Make garment longer than template",
        "cost": 50.00,
        "status": "active"
      },
      {
        "id": 9,
        "name": "Custom Sleeves",
        "description": "Custom sleeve length or style",
        "cost": 75.00,
        "status": "active"
      }
    ],
    "treatment": [
      {
        "id": 12,
        "name": "Pleating Detail",
        "description": "Add pleats to skirt or dupatta",
        "cost": 80.00,
        "status": "active"
      },
      {
        "id": 13,
        "name": "Lace Border",
        "description": "Add decorative lace to edges",
        "cost": 100.00,
        "status": "active"
      }
    ]
  }
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "string (optional)",
  "data": {},
  "meta": {
    "timestamp": "2026-04-19T12:00:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

### List Response with Pagination
```json
{
  "success": true,
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

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "string (error code)",
    "message": "string (user-friendly message)",
    "details": "string (optional, detailed information)"
  },
  "meta": {
    "timestamp": "2026-04-19T12:00:00Z",
    "request_id": "req_abc123xyz"
  }
}
```

### HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing/invalid auth token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (duplicate email, etc.) |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal server error |

### Common Error Codes

| Code | Message | Scenario |
|------|---------|----------|
| INVALID_EMAIL | Invalid email format | Email validation failed |
| PHONE_EXISTS | Phone number already registered | Duplicate phone |
| EMAIL_EXISTS | Email already registered | Duplicate email |
| INVALID_OTP | OTP is invalid or expired | Wrong/expired OTP |
| USER_NOT_FOUND | User not found | Invalid user ID |
| INVALID_TOKEN | Authentication token invalid or expired | Bad/expired token |
| TEMPLATE_NOT_FOUND | Template not found | Invalid template ID |
| INSUFFICIENT_FUNDS | Insufficient balance for payment | Payment failed |
| ORDER_NOT_FOUND | Order not found | Invalid order ID |
| INVALID_STATUS | Invalid status transition | Can't change to that status |

---

## Request/Response Examples

### Full Example: Consumer Registration → Browse Templates → Place Order

#### 1. Register Consumer
```bash
curl -X POST http://localhost:3000/api/auth/consumer/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "password": "SecurePass123!",
    "address_line1": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "country": "India"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 123,
    "consumer_id": 45,
    "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 2. Browse All Templates
```bash
curl -X GET "http://localhost:3000/api/templates?status=active&category=Traditional" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 3. Get Specific Template Details
```bash
curl -X GET http://localhost:3000/api/templates/1/2 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 4. Calculate Price Before Ordering
```bash
curl -X POST http://localhost:3000/api/pricing/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciO..." \
  -d '{
    "template_type_id": 1,
    "template_sub_type_id": 2,
    "material_id": 2,
    "body_config": "standard",
    "customizations": [
      {
        "type": "embroidery",
        "name": "Simple Embroidery",
        "quantity": 5,
        "quantity_unit": "sq_inches"
      }
    ],
    "urgency_level": "normal"
  }'
```

---

#### 5. Place Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "consumer_id": 45,
    "template_type_id": 1,
    "template_sub_type_id": 2,
    "material_id": 2,
    "body_measurement_id": 1,
    "fabric_length_meters": 2.5,
    "delivery_date": "2026-05-10",
    "urgency_level": "normal",
    "customizations": [
      {
        "type": "embroidery",
        "name": "Simple Embroidery",
        "quantity": 5,
        "quantity_unit": "sq_inches"
      }
    ],
    "special_instructions": "Please ensure perfect fit",
    "delivery_address_line1": "123 Main Street",
    "delivery_city": "Mumbai",
    "delivery_state": "Maharashtra",
    "delivery_postal_code": "400001"
  }'
```

---

#### 6. View Order History
```bash
curl -X GET "http://localhost:3000/api/orders/history/123?status=completed&limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### 7. Get Order Details
```bash
curl -X GET http://localhost:3000/api/orders/1001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Authentication

### Token-Based Authentication

**All API endpoints (except auth) require Bearer token in header:**

```
Authorization: Bearer {auth_token}
Content-Type: application/json
```

**Token Expiry:** 24 hours
**Refresh Token:** Can be used to get new auth token without re-login

### Token Refresh Endpoint
**Endpoint:** `POST /auth/refresh-token`

**Request:**
```json
{
  "refresh_token": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_expiry_seconds": 86400
}
```

---

## Rate Limiting

**Rate Limits:**
- Public endpoints (auth, register): 10 requests per minute
- Authenticated endpoints: 100 requests per minute
- File uploads: 5 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1619000000
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-19 | Initial API documentation |

---

**Last Updated:** 2026-04-19
**Status:** ✅ Ready for Backend Development
