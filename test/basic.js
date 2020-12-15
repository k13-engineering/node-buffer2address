/* global describe */
/* global it */

import assert from "assert";
import buffer2address from "../lib/index.js";

describe("basic", () => {
  it("should provide address of buffer as BigInt", () => {
    const buf = Buffer.alloc(32);
    const addr = buffer2address(buf);
    assert.equal(typeof addr, "bigint");
  });

  it("should throw an error when no arguments are given", () => {
    assert.throws(() => buffer2address());
  });

  it("should throw an error when more than 1 argument is given", () => {
    assert.throws(() => buffer2address(Buffer.alloc(8), Buffer.alloc(8)));
  });

  it("should throw an error when wrong argument type is given", () => {
    assert.throws(() => buffer2address("abc"));
  });
});
