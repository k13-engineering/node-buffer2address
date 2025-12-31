import { createNativeAddonLoader } from "./snippets/native-loader.ts";

const nativeAddonLoader = createNativeAddonLoader();
const native = nativeAddonLoader.loadRelativeToPackageRoot({
  relativeBuildFolderPath: "./build"
});

type TBuffer2AddressFunc = (buffer: Uint8Array) => bigint;
type TAddress2BufferFunc = (address: bigint, length: bigint) => Uint8Array;

const nativeBuffer2address: TBuffer2AddressFunc = native.buffer2address;
const nativeAddress2buffer: TAddress2BufferFunc = native.address2buffer;

export {
  nativeBuffer2address,
  nativeAddress2buffer
};
