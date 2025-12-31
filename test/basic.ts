/* global describe */
/* global it */

import assert from "assert";
import { buffer2address, address2buffer } from "../lib/index.ts";

describe("buffer2address", () => {
  it("should provide address of buffer as BigInt", () => {
    const buffer = Buffer.alloc(32);
    const addr = buffer2address({ buffer });
    assert.equal(typeof addr, "bigint");
  });

  // it("should throw an error when no arguments are given", () => {
  //   // @ts-expect-error testing missing argument
  //   assert.throws(() => buffer2address());
  // });

  // it("should throw an error when more than 1 argument is given", () => {
  //   // @ts-expect-error testing too many arguments
  //   assert.throws(() => buffer2address(Buffer.alloc(8), Buffer.alloc(8)));
  // });

  // it("should throw an error when wrong argument type is given", () => {
  //   // @ts-expect-error testing wrong argument type
  //   assert.throws(() => buffer2address("abc"));
  // });
});

describe("address2buffer", () => {
  it("should create buffer from address correctly", () => {
    const size = 32;
    const buf = new Uint8Array(size);
    const address = buffer2address({ buffer: buf });

    const newBuf = address2buffer({ address, size });

    const testValues = [0x22, 0x33, 0x44];

    testValues.forEach((value) => {
      buf[0] = value;
      assert.equal(newBuf[0], value);
    });
  });

  // it("should fail on missing address parameter", () => {
  //   // @ts-expect-error testing missing argument
  //   assert.throws(() => address2buffer({ size: 32 }), (err: Error) => {
  //     assert.equal(err.message, "address must be a BigInt");
  //     return true;
  //   });
  // });

  // it("should fail on missing size parameter", () => {
  //   // @ts-expect-error testing missing argument
  //   assert.throws(() => address2buffer({ address: 0x10000n }), (err: Error) => {
  //     assert.equal(err.message, "size must be a BigInt");
  //     return true;
  //   });
  // });

  it("should fail on too large addresses", () => {
    // @ts-expect-error testing too large address
    assert.throws(() => address2buffer({ address: 0x1000000000000000000n, size: 0x10000n }), (err: Error) => {
      assert.equal(err.message, "address must not exceed UINTPTR_MAX");
      return true;
    });
  });

  it("should fail on too large sizes", () => {
    // @ts-expect-error testing too large length
    assert.throws(() => address2buffer({ address: 0x10000n, size: 0x1000000000000000000n }), (err: Error) => {
      assert.equal(err.message, "length must not exceed UINTPTR_MAX");
      return true;
    });
  });
});
