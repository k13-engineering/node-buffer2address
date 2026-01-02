# node-buffer2address
Node.js module to retrieve memory address of Buffer


## About
This tiny module allows to retrieve the memory address of a Node.js Buffer as a BigInt. This address can be used for interoperability with native code.

## Installation

```
npm install buffer2address
```

or

```
yarn add buffer2address
```

## API

### `pinBuffer({ buffer })`

Pins a buffer in memory and retrieves its memory address. Returns an object containing the address and an unpin function.

**Parameters:**
- `buffer` (Uint8Array) - The buffer to pin and retrieve the memory address from

**Returns:** `{ address: bigint, unpin: () => void }` - An object containing:
  - `address` - The memory address of the pinned buffer
  - `unpin()` - Function to unpin the buffer when no longer needed

**⚠️ Important:** Always call `unpin()` when you're done using the address to prevent memory leaks. The buffer remains pinned in memory until unpinned.

### `address2buffer({ address, size })`

Creates a Buffer view from a memory address.

**Parameters:**
- `address` (bigint) - The memory address to create a buffer from
- `size` (number) - The size of the buffer in bytes

**Returns:** `Uint8Array` - A buffer view at the specified memory address

**⚠️ Warning:** Using `address2buffer` with invalid addresses can cause crashes or undefined behavior. Only use addresses obtained from valid buffers.

## Example

```javascript
import { pinBuffer, address2buffer } from "buffer2address";

const buf = new Uint8Array(16);
buf[0] = 0xAA;

const pinnedBuffer = pinBuffer({ buffer: buf });
console.log(`buffer address = ${pinnedBuffer.address}`);

const buf2 = address2buffer({ address: pinnedBuffer.address, size: buf.length });
console.log(`buffer =`, buf2);

pinnedBuffer.unpin();
```
