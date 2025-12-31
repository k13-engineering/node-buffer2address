import { buffer2address, address2buffer } from "../lib/index.ts";

const buf = new Uint8Array(16);
buf[0] = 0xAA;

const address = buffer2address({ buffer: buf });
console.log(`buffer address = ${address}`);

const buf2 = address2buffer({ address, size: buf.length });
console.log(`buffer =`, buf2);
