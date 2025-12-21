# Refund Feature Update Summary

## Backend (BE)

### 1. Refund Entity & Enum Alignment

- **File:** Ecommerce/src/main/java/com/PBL6/Ecommerce/domain/entity/order/Refund.java
- Updated the `RefundStatus` enum to use values: `REQUESTED`, `APPROVED`, `REJECTED`, `COMPLETED`.
- Ensured the enum values match the MySQL enum in the `refunds` table to prevent data truncation errors.

### 2. Refund Service & Controller

- **File:** Ecommerce/src/main/java/com/PBL6/Ecommerce/service/RefundService.java
- Updated logic to use the new enum values for refund status.
- Added/updated method to create refund requests by item, using the correct status.
- **File:** Ecommerce/src/main/java/com/PBL6/Ecommerce/controller/order/RefundController.java
- Added/updated endpoint `/api/refund/create` to support item-based refund requests.

### 3. Database Migration

- **File:** Ecommerce/sql/update_refund_status_enum.sql
- Created a migration script to update the `status` enum in the `refunds` table and convert existing data to the new values.

---

## Frontend (FE)

### 1. Refund Request Page

- **File:** PBL6_E-Commerce_FrontEnd/src/pages/order/ReturnRequestPage.jsx
- Integrated refund request form with image upload.
- Added validation for required fields and image preview.
- Used the correct API endpoint for refund requests.

### 2. Image Upload Service

- **File:** PBL6_E-Commerce_FrontEnd/src/services/ImageUploadService.js
- Updated the image upload endpoint to `/api/images/upload?folder=refund`.
- Ensured refund images are uploaded before submitting the refund request.

---

## Notes

- The enum mismatch between Java and MySQL was the root cause of the backend error.
- After code and migration updates, run the migration SQL and restart the backend before testing the refund flow.
