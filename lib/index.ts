import { nativeBuffer2address, nativeAddress2buffer } from "./native.ts";
import nodeAssert from "node:assert";

let pinnedBuffers: Uint8Array[] = [];

type TPinnedBuffer = {
  address: bigint;
  unpin: () => void;
};

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
  };

  const address = nativeBuffer2address(buffer);

  return {
    address,
    unpin
  };
};

const address2buffer = ({ address, size }: { address: bigint, size: number }) => {
  return nativeAddress2buffer(address, BigInt(size));
};

export {
  pinBuffer,
  address2buffer
};

export type {
  TPinnedBuffer
};
