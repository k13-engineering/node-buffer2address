/* global describe */
/* global it */

import assert from "assert";
import { pinBuffer, address2buffer } from "../lib/index.ts";

describe("buffer2address", () => {
  it("should provide address of buffer as BigInt", () => {
    const buffer = Buffer.alloc(32);

    const pinnedBuffer = pinBuffer({ buffer });
    assert.equal(typeof pinnedBuffer.address, "bigint");
    pinnedBuffer.unpin();
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

  it("should throw an error when unpinning twice", () => {
    const buffer = Buffer.alloc(16);
    const pinnedBuffer = pinBuffer({ buffer });

    pinnedBuffer.unpin();

    assert.throws(() => {
      pinnedBuffer.unpin();
    }, (err: Error) => {
      assert.equal(err.message, "buffer already unpinned");
      return true;
    });
  });
});

describe("address2buffer", () => {
  it("should create buffer from address correctly", () => {
    const size = 32;
    const buf = new Uint8Array(size);

    const pinnedBuffer = pinBuffer({ buffer: buf });
    const newBuf = address2buffer({ address: pinnedBuffer.address, size });

    const testValues = [0x22, 0x33, 0x44];

    testValues.forEach((value) => {
      buf[0] = value;
      assert.equal(newBuf[0], value);
    });

    pinnedBuffer.unpin();
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
