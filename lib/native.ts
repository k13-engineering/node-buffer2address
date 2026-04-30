import { loadAddonFromMemory } from "./load-addon-from-memory.ts";
import { buffer2addressAddonArm64 } from "./generated/buffer2address-arm64.ts";
import { buffer2addressAddonX64 } from "./generated/buffer2address-x64.ts";
import nodeProcess from "node:process";

type TBuffer2AddressAddon = {
  buffer2address: (buffer: Uint8Array) => bigint;
  address2buffer: (address: bigint, length: bigint) => Uint8Array;
};

const addonBinariesByArch: Partial<{ [key in NodeJS.Architecture]: Uint8Array }> = {
  x64: buffer2addressAddonX64,
  arm64: buffer2addressAddonArm64,
};

let loadedAddon: TBuffer2AddressAddon | undefined = undefined;

// eslint-disable-next-line complexity
const maybeLoadAddon = (): TBuffer2AddressAddon => {
  if (loadedAddon !== undefined) {
    return loadedAddon;
  }

  if (nodeProcess.platform !== "linux") {
    throw Error("only supported on linux");
  }

  const addonBinary = addonBinariesByArch[nodeProcess.arch];
  if (addonBinary === undefined) {
    throw Error(`unsupported architecture: ${nodeProcess.arch}`);
  }

  const { error, addon } = loadAddonFromMemory({ addonAsBuffer: addonBinary });
  if (error !== undefined) {
    throw Error(`failed to load native addon from memory: ${error.message}`);
  }

  loadedAddon = addon as TBuffer2AddressAddon;
  return loadedAddon;
};

const nativeBuffer2address = (buffer: Uint8Array): bigint => {
  const addon = maybeLoadAddon();
  return addon.buffer2address(buffer);
};

// eslint-disable-next-line k13-engineering/prefer-single-object-parameters
const nativeAddress2buffer = (address: bigint, length: bigint): Uint8Array => {
  const addon = maybeLoadAddon();
  return addon.address2buffer(address, length);
};

export {
  nativeBuffer2address,
  nativeAddress2buffer
};
