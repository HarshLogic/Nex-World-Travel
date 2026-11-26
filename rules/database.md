# DATABASE ENGINEERING RULES (rules/database.md)

> **Status**: Active & Mandatory  
> **Database**: MongoDB Atlas / Mongoose 8.7

---

## 1. Schema Design & Data Integrity

- **Explicit Type Declarations**: All Mongoose schema fields must declare explicit data types, default values, and trimming options where applicable.
- **Unique & Index Declarations**: Declare unique indexes on natural keys (`memberId`, `email`, `slug`, `enquiryNumber`, `transactionId`, `requestId`).
- **Binary Media Projection Filtering**: Always declare binary image buffer fields with `{ select: false }` to prevent multi-megabyte payloads from bloating general directory queries into memory.

---

## 2. Atomic Updates & Concurrency Control

- **Atomic Financial Adjustments**: Use MongoDB atomic operators (`$inc`, `$set`) rather than reading a document, modifying numbers in memory, and writing it back:
  ```javascript
  await MemberProfile.updateOne(
    { memberId },
    { $inc: { totalAmountPaid: amount, outstandingBalance: -amount } }
  );
  ```
- **Transaction Safety**: When recording payments, execute `PaymentTransaction.create()` and `MemberProfile.updateOne()` within a MongoDB session transaction (`session.startTransaction()`) whenever supported by the cluster.

---

## 3. Production Safety Invariants

- **No Destructive Database Operations**: Never execute `drop()`, `deleteMany({})`, or destructive migrations against collections containing production data.
- **Safe Schema Evolution**: All schema modifications must be strictly additive and backward-compatible with legacy documents.
- **Connection Pooling**: Restrict connection pool bounds (`maxPoolSize: 10`, `minPoolSize: 2`, `maxIdleTimeMS: 30000`) to respect Railway RAM constraints.
