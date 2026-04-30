import { pinBuffer, address2buffer } from "../lib/index.ts";

const buf = new Uint8Array(16);
// eslint-disable-next-line immutable/no-mutation
buf[0] = 0xAA;

const pinnedBuffer = pinBuffer({ buffer: buf });
console.log(`buffer address = ${pinnedBuffer.address}`);

const buf2 = address2buffer({ address: pinnedBuffer.address, size: buf.length });
console.log(`buffer =`, buf2);

pinnedBuffer.unpin();
