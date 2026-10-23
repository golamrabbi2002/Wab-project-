# Security Specification & Test Suite

## 1. Data Invariants
1. **Public Catalog vs Admin Write**: Products and Store Configuration are publicly readable so visitors can browse the store, but can only be modified by authenticated store administrators.
2. **Customer Identity Protection**: Customer profile documents (`/customers/{customerId}`) can only be read or modified by the owner (`request.auth.uid == customerId`) or verified administrators (`isAdmin()`).
3. **Customer PII Isolation**: Non-owners cannot read or scrape other customers' personal phone numbers or shipping addresses.
4. **Order Integrity**: Orders can be created with valid order payloads. Customers can access their own orders. Only administrators can update order status or fulfillments.
5. **Anti-Update-Gap**: Document modifications must adhere strictly to allowed fields, size limits, and invariant identity matching.
6. **Immortal Fields**: Fields such as `id`, `customerId`, and `createdAt` are immutable once saved.

## 2. The "Dirty Dozen" Malicious Payloads
1. **Payload 1 (Identity Spoofing - Customer)**: Attacker attempts to create or overwrite a `/customers/{victimId}` document where `victimId != request.auth.uid`.
2. **Payload 2 (Shadow Field Injection)**: Attacker attempts to update a profile or order adding an unauthorized privilege field `isAdmin: true` or `role: 'superadmin'`.
3. **Payload 3 (Denial of Wallet - Massive Payload)**: Attacker sends an excessively long string (e.g. 500KB) into `name` or `title` exceeding `maxLength`.
4. **Payload 4 (Unauthenticated Admin Write)**: Unauthenticated visitor attempts to delete or overwrite `/products/prod-123`.
5. **Payload 5 (Unauthenticated Store Config Hijack)**: Unauthenticated visitor attempts to update `/store/config` modifying the payment bKash/Nagad accounts.
6. **Payload 6 (Cross-Customer Order Tampering)**: Customer B attempts to update the shipping address or price total of Customer A's order.
7. **Payload 7 (Immortal Field Modification)**: User attempts to modify `createdAt` or change the `customerId` on an existing order.
8. **Payload 8 (Invalid Path Characters / ID Poisoning)**: User attempts to write with an invalid ID containing path traversal characters like `../../hack`.
9. **Payload 9 (Order Price Manipulation on Update)**: User attempts to reduce the `total` or `subtotal` of an existing order to `0`.
10. **Payload 10 (Coupon Spoofing)**: Non-admin user attempts to create a 100% off coupon code in `/coupons/{couponId}`.
11. **Payload 11 (Customer List Snooping)**: Non-admin customer attempts to execute an unbounded `list` on `/customers` to harvest all shopper emails.
12. **Payload 12 (Email Spoofing without Verification)**: Attacker creates an account claiming the admin email without `email_verified: true`.
