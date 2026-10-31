import { test } from "node:test";
import assert from "node:assert/strict";
import { initialStore, createInvoice, nextDate } from "./billing";
test("discount precedes tax and duplicate periods cannot be billed", () => {
  const store = initialStore();
  const sub = store.subscriptions[0];
  const invoice = createInvoice(store, sub);
  assert.equal(invoice.subtotal, 47988);
  assert.equal(invoice.discount, 4799);
  assert.equal(invoice.tax, 7774);
  assert.equal(invoice.total, 50963);
  store.invoices.push(invoice);
  assert.throws(() => createInvoice(store, sub), /already/);
});
test("only active subscriptions can be billed", () => {
  const store = initialStore();
  assert.throws(() => createInvoice(store, store.subscriptions[5]), /Activate/);
});
test("renewal clamps month ends and leap years", () => {
  assert.equal(nextDate("2026-01-31", "Monthly"), "2026-02-28");
  assert.equal(nextDate("2024-02-29", "Yearly"), "2025-02-28");
});
