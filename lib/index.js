import { createRequire } from "module";
const require = createRequire(import.meta.url);

let native;

try {
  native = require("../build/Release/buffer2address.node");
} catch (ex) {
  native = require("../build/Debug/buffer2address.node");
}

export default native;
