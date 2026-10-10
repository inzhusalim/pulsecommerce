import { test } from "node:test";
import assert from "node:assert/strict";
import { filterOrders, ordersCsv } from "../src/order-utils.ts";
import {
  initialOrders,
  currency,
  dateLabel,
  monthlyRevenue,
} from "../src/data.ts";

test("customer and order ID searches compose with status filters", () => {
  assert.equal(
    filterOrders(initialOrders, "OLIVIA", "All statuses", {
      field: "date",
      direction: "desc",
    })[0].id,
    1042,
  );
  assert.equal(
    filterOrders(initialOrders, "#1040", "Pending", {
      field: "date",
      direction: "desc",
    }).length,
    1,
  );
  assert.equal(
    filterOrders(initialOrders, "#1040", "Fulfilled", {
      field: "date",
      direction: "desc",
    }).length,
    0,
  );
  assert.equal(
    filterOrders(initialOrders, "unknown", "All statuses", {
      field: "date",
      direction: "desc",
    }).length,
    0,
  );
});
test("amount and date sorts preserve source data and correct ordering", () => {
  const original = initialOrders.map((o) => o.id);
  for (const field of ["amount", "date"]) {
    const asc = filterOrders(initialOrders, "", "All statuses", {
      field,
      direction: "asc",
    });
    const desc = filterOrders(initialOrders, "", "All statuses", {
      field,
      direction: "desc",
    });
    assert.deepEqual(
      asc.map((o) => o.id),
      desc.map((o) => o.id).reverse(),
    );
    for (let i = 1; i < asc.length; i++)
      assert.ok(asc[i - 1][field] <= asc[i][field]);
  }
  assert.deepEqual(
    initialOrders.map((o) => o.id),
    original,
  );
});
test("both page sizes cover the dataset without duplicates", () => {
  const sorted = filterOrders(initialOrders, "", "All statuses", {
    field: "date",
    direction: "desc",
  });
  for (const size of [5, 10]) {
    const ids = Array.from(
      { length: Math.ceil(sorted.length / size) },
      (_, i) => sorted.slice(i * size, (i + 1) * size),
    )
      .flat()
      .map((o) => o.id);
    assert.equal(new Set(ids).size, initialOrders.length);
    assert.equal(ids.at(-1), 1011);
  }
});
test("CSV keeps US dates, dollar precision, ZIP strings, and quoted cells", () => {
  const csv = ordersCsv([initialOrders[0]]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"10/10/2026","128.50","Fulfilled"'));
  assert.ok(csv.includes('"CA","90012"'));
  assert.equal(csv.split("\r\n").length, 2);
  const escaped = ordersCsv([
    { ...initialOrders[0], name: 'Doe, "Jane"', email: "=1+1" },
  ]);
  assert.ok(escaped.includes('"Doe, ""Jane"""'));
  assert.ok(escaped.includes('"\'=1+1"'));
});
test("US locale and monthly chart total match the required KPI", () => {
  assert.equal(currency(128450), "$128,450.00");
  assert.equal(dateLabel("2026-10-09"), "10/09/2026");
  assert.equal(
    monthlyRevenue.reduce((sum, o) => sum + o.revenue, 0),
    48290.5,
  );
  assert.ok(
    initialOrders.every(
      (o) => /^(CA|NY|TX|FL)$/.test(o.state) && /^\d{5}$/.test(o.zip),
    ),
  );
});
