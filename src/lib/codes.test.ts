import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeCode, platePath, isSeqCode } from "./codes.ts";

test("códigos sequenciais", () => {
  assert.equal(normalizeCode("snfc1"), "SNFC1");
  assert.equal(normalizeCode(" SNFC 12 "), "SNFC12");
  assert.equal(normalizeCode("7"), "SNFC7");
  assert.equal(normalizeCode("SNFC007"), "SNFC7");
  assert.equal(normalizeCode("a7k2q9"), "A7K2Q9");
  assert.ok(isSeqCode("SNFC10"));
  assert.ok(!isSeqCode("A7K2Q9"));
  assert.equal(platePath("SNFC3"), "/SNFC3");
  assert.equal(platePath("A7K2Q9"), "/p/A7K2Q9");
});
