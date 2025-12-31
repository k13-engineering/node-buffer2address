import { nativeBuffer2address, nativeAddress2buffer } from "./native.ts";

const buffer2address = ({ buffer }: { buffer: Uint8Array }) => {
  return nativeBuffer2address(buffer);
};

const address2buffer = ({ address, size }: { address: bigint, size: number }) => {


  return nativeAddress2buffer(address, BigInt(size));
};

export {
  buffer2address,
  address2buffer
};
