import { createRequire } from "module";
const require = createRequire(import.meta.url);

let native;

try {
  native = require("../build/Release/buffer2address.node");
} catch (ex) {
  native = require("../build/Debug/buffer2address.node");
}

const buffer2address = (...args) => {
  return native.buffer2address(...args);
};

const address2buffer = ({ address, size }) => {
  return native.address2buffer(address, size);
};

export default {
  buffer2address,
  address2buffer
};
