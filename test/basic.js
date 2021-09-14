/* global describe */
/* global it */

import assert from "assert";
import b2a from "../lib/index.js";

describe("buffer2address", () => {
  it("should provide address of buffer as BigInt", () => {
    const buf = Buffer.alloc(32);
    const addr = b2a.buffer2address(buf);
    assert.equal(typeof addr, "bigint");
  });

  it("should throw an error when no arguments are given", () => {
    assert.throws(() => b2a.buffer2address());
  });

  it("should throw an error when more than 1 argument is given", () => {
    assert.throws(() => b2a.buffer2address(Buffer.alloc(8), Buffer.alloc(8)));
  });

  it("should throw an error when wrong argument type is given", () => {
    assert.throws(() => b2a.buffer2address("abc"));
  });
});

describe("address2buffer", () => {
  it("should create buffer from address correctly", () => {
    const size = 32;
    const buf = Buffer.alloc(size);
    const address = b2a.buffer2address(buf);

    const newBuf = b2a.address2buffer({ address, size: BigInt(size) });

    const testValues = [ 0x22, 0x33, 0x44 ];

    testValues.forEach((value) => {
      buf.writeUInt8(value, 0);
      assert.equal(newBuf.readUInt8(0), value);
    });
  });

  it("should fail on missing address parameter", () => {
    assert.throws(() => b2a.address2buffer({ size: 32 }), (err) => {
      assert.equal(err.message, "address must be a BigInt");
      return true;
    });
  });

  it("should fail on missing size parameter", () => {
    assert.throws(() => b2a.address2buffer({ address: 0x10000n }), (err) => {
      assert.equal(err.message, "size must be a BigInt");
      return true;
    });
  });

  it("should fail on too large addresses", () => {
    assert.throws(() => b2a.address2buffer({ address: 0x1000000000000000000n, size: 0x10000n }), (err) => {
      assert.equal(err.message, "address must not exceed UINTPTR_MAX");
      return true;
    });
  });

  it("should fail on too large sizes", () => {
    assert.throws(() => b2a.address2buffer({ address: 0x10000n, size: 0x1000000000000000000n }), (err) => {
      assert.equal(err.message, "length must not exceed UINTPTR_MAX");
      return true;
    });
  });
});