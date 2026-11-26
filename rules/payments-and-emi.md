# PAYMENTS & EMI ENGINEERING RULES (rules/payments-and-emi.md)

> **Status**: Active & Mandatory  
> **Domain**: Financial Ledgers, AED Monetary Calculations, Structured EMI

---

## 1. Monetary Precision & Currency Standards

- **Denomination**: All platform financials are denominated in **UAE Dirhams (AED)**.
- **Display Standard**: Always use `formatAED(amount)` from [client/lib/currency.js](file:///home/harshvardhan/Desktop/Nexworldtravel/client/lib/currency.js).
- **Database Storage**: Store monetary values as raw numeric values in MongoDB. Never store currency symbols or formatted strings in document fields.

---

## 2. Financial Reconciliation Formulas

All calculations must strictly follow these verified business formulas:

1. **Outstanding Balance**:
   $$\text{Outstanding Balance} = \max(0, \text{Product Price} - \text{Total Amount Paid})$$
2. **Payment Status Transitions**:
   - If $\text{Outstanding Balance} \le 0 \implies \text{paymentStatus} = \text{'Fully Paid'}, \text{dueAmount} = 0$.
   - If current installment is fully remitted $\implies \text{paymentStatus} = \text{'Up to Date'}, \text{dueAmount} = 0$, and advance $\text{nextEMIDueDate}$ by 1 month.
   - If installment is partially paid $\implies \text{dueAmount} = \max(0, \text{emiAmount} - \text{amount})$, $\text{paymentStatus} = \text{'Due Soon'}$.
   - If current date exceeds $\text{nextEMIDueDate}$ without settlement $\implies \text{paymentStatus} = \text{'Overdue'}$.

---

## 3. Transaction Integrity & Ledger Preservation

- **Immutable Transaction Records**: Every payment must append an immutable record to `PaymentTransaction` with unique `transactionId`. Records must never be deleted or updated in place.
- **Reconciliation Audit**: Record an audit log entry for every payment mutation (`store.logAudit('PAYMENT_RECORDED', ...)`).
- **No Manual Overwrites**: Financial balances must only be updated through verified payment transactions or approved Master Head change requests.
