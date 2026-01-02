/* global describe */
/* global it */

import assert from "assert";
import {
  pinBuffer,
  address2buffer,
  PinnedBufferGarbageCollectedWithoutUnpinError
} from "../lib/index.ts";
import type {
  TPinnedBuffer,
  TPinnedBufferInfo
} from "../lib/index.ts";
import { captureUncaughtExceptionsDuring, forceGarbageCollection } from "./util.ts";
import { formatPointerAddress } from "../lib/util.ts";

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

  it("should be able to pin the same buffer multiple times", () => {
    const buffer = Buffer.alloc(16);
    const pinnedBuffer1 = pinBuffer({ buffer });
    const pinnedBuffer2 = pinBuffer({ buffer });

    assert.strictEqual(pinnedBuffer1.address, pinnedBuffer2.address);

    pinnedBuffer1.unpin();
    pinnedBuffer2.unpin();
  });

  it("should throw an error when unpinning twice even when pinning the same buffer multiple times", () => {
    const buffer = Buffer.alloc(16);
    const pinnedBuffer1 = pinBuffer({ buffer });
    const pinnedBuffer2 = pinBuffer({ buffer });

    pinnedBuffer1.unpin();

    assert.throws(() => {
      pinnedBuffer1.unpin();
    }, (err: Error) => {
      assert.equal(err.message, "buffer already unpinned");
      return true;
    });

    pinnedBuffer2.unpin();
  });

  describe("memory leak detection", () => {
    it("should throw exception when buffer is garbage collected without unmap", async function () {
      this.timeout(5000);

      const buffer = new Uint8Array(64);
      let pinnedBuffer: TPinnedBuffer | undefined = pinBuffer({ buffer });

      const bufferInfo: TPinnedBufferInfo = {
        pinId: pinnedBuffer.pinId,
        address: pinnedBuffer.address
      };

      const capturedUncaughtExceptions = await captureUncaughtExceptionsDuring(async ({ uncaughtExceptions }) => {
        // remove reference to buffer to allow garbage collection
        pinnedBuffer = undefined;

        const startedAt = performance.now();

        while (performance.now() - startedAt < 3000) {
          forceGarbageCollection();
          await new Promise((resolve) => setTimeout(resolve, 20));

          const exceptions = uncaughtExceptions();
          if (exceptions.length > 0) {
            return;
          }
        }
      });

      // mainly for linter
      assert.strictEqual(pinnedBuffer, undefined, "pinnedBuffer should be undefined");

      assert.strictEqual(capturedUncaughtExceptions.length, 1);

      const ex = capturedUncaughtExceptions[0];
      assert.ok(ex instanceof PinnedBufferGarbageCollectedWithoutUnpinError);
      assert.strictEqual(ex.bufferInfo.pinId, bufferInfo.pinId);
      assert.strictEqual(ex.bufferInfo.address, bufferInfo.address);

      const formattedPointerAddress = formatPointerAddress({ pointerAddress: bufferInfo.address });

      assert.ok(ex.message.includes(`pinId=${bufferInfo.pinId}`));
      assert.ok(ex.message.includes(formattedPointerAddress));
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
