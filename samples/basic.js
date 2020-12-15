import buffer2address from "../lib/index.js";

const buf = Buffer.alloc(32);
console.log(`buffer address = ${buffer2address(buf)}`);
