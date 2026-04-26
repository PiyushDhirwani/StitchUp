# StitchUp

### Consumer-to-Tailor Stitching Platform

This application connects consumers who want to get their clothes stitched (such as salwar suits or kurtas) with local tailors and stitching shops. It serves as a one-stop solution where users simply provide the necessary details—fabric type, measurements, design preferences, and delivery timeline—and the platform handles the rest.

#### Key Features

* **Easy Order Placement**: Users can submit stitching requests with all required details in one place.
* **Tailor Matching**: The platform connects users with suitable local tailors or shops.
* **Progress Tracking**: Users can track the status of their stitching orders.
* **Dynamic Pricing**: Configurable pricing based on template type, material, customizations, body complexity, and urgency.
* **OTP-based Authentication**: Secure phone-number login with JWT tokens.
* **Convenience**: Eliminates the need for multiple visits or manual coordination.

#### Use Case

This platform is ideal for users who already have raw materials or fabric and want a simple, reliable way to get them stitched professionally.

#### Goal

To streamline the traditional tailoring process by making it more accessible, efficient, and user-friendly.

---

## Project Structure

```
StitchUp/
├── Readme.md                 # This file
├── PROJECT_SUMMARY.md        # Detailed project overview
├── db/                       # SQL schema files (23 files, 31 tables)
│   ├── 01_user_roles.sql
│   ├── ...
│   └── 23_pricing_config.sql
└── backend/                  # NestJS API server
    ├── README.md             # Backend-specific documentation
    ├── src/
    ├── docker-compose.yml
    └── package.json
```

## Quick Start

See [backend/README.md](./backend/README.md) for full setup and usage instructions.