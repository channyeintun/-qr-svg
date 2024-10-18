import { assertEquals } from "@std/assert";
import { getSVGData } from "./mod.ts";

Deno.test(function checkResult() {
  const result = getSVGData({ data: "deno" });
  assertEquals(result.length, 21);
});
