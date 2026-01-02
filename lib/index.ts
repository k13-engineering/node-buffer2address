import { nativeBuffer2address, nativeAddress2buffer } from "./native.ts";
import nodeAssert from "node:assert";
import { formatPointerAddress } from "./util.ts";

let pinnedBuffers: Uint8Array[] = [];

type TPinnedBufferInfo = {
  pinId: number;
  address: bigint;
};

type TPinnedBuffer = {
  pinId: number;
  address: bigint;
  unpin: () => void;
};

class PinnedBufferGarbageCollectedWithoutUnpinError extends Error {

  public bufferInfo: TPinnedBufferInfo;

  constructor ({ bufferInfo }: { bufferInfo: TPinnedBufferInfo }) {
    let message = `pinned buffer with pinId=${bufferInfo.pinId} at`;
    message += ` address 0x${formatPointerAddress({ pointerAddress: bufferInfo.address })}`;
    message += ` was garbage collected without calling unmap().`;
    message += ` This would causes a memory leak -`;
    message += ` therefore this raises an uncaught exception.`;
    message += ` Please make sure to call unpin() on all pinned buffers when you are done with them.`;

    super(message);

    this.bufferInfo = bufferInfo;
    this.name = "PinnedBufferGarbageCollectedWithoutUnpinError";
  }
};

const pinnedBuffersFinalizationRegistry = new FinalizationRegistry((bufferInfo: TPinnedBufferInfo) => {
  // this callback is called when a buffer pinning instance is garbage collected without unpin() being called
  throw new PinnedBufferGarbageCollectedWithoutUnpinError({ bufferInfo });
});

let pinIdCounter = 0;

const pinBuffer = ({ buffer }: { buffer: Uint8Array }): TPinnedBuffer => {

  pinnedBuffers = [...pinnedBuffers, buffer];
  let pinned = true;

  const unpin = () => {

    if (!pinned) {
      throw new Error("buffer already unpinned");
    }
    pinned = false;

    // do not use filter, as one could pin the same buffer multiple times
    const pinnedIndex = pinnedBuffers.indexOf(buffer);
    nodeAssert.ok(pinnedIndex >= 0, "buffer should be in pinned buffers, this is a bug");

    pinnedBuffers.splice(pinnedIndex, 1);
    pinnedBuffersFinalizationRegistry.unregister(buffer);
  };

  const address = nativeBuffer2address(buffer);

  const pinId = pinIdCounter;
  pinIdCounter += 1;

  const pinnedBuffer: TPinnedBuffer = {
    pinId,
    address,
    unpin
  };

  const pinnedBufferInfo: TPinnedBufferInfo = {
    pinId,
    address
  };

  pinnedBuffersFinalizationRegistry.register(pinnedBuffer, pinnedBufferInfo, buffer);

  return pinnedBuffer;
};

const address2buffer = ({ address, size }: { address: bigint, size: number }) => {
  return nativeAddress2buffer(address, BigInt(size));
};

export {
  pinBuffer,
  address2buffer,

  PinnedBufferGarbageCollectedWithoutUnpinError
};

export type {
  TPinnedBuffer,
  TPinnedBufferInfo
};
