import b2a from "../lib/index.js";

const buf = Buffer.alloc(32);
console.log(`buffer address = ${b2a.buffer2address(buf)}`);
