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

### `buffer2address({ buffer })`

Retrieves the memory address of a Buffer.

**Parameters:**
- `buffer` (Uint8Array) - The buffer whose memory address to retrieve

**Returns:** `bigint` - The memory address of the buffer

### `address2buffer({ address, size })`

Creates a Buffer view from a memory address.

**Parameters:**
- `address` (bigint) - The memory address to create a buffer from
- `size` (number) - The size of the buffer in bytes

**Returns:** `Uint8Array` - A buffer view at the specified memory address

**⚠️ Warning:** Using `address2buffer` with invalid addresses can cause crashes or undefined behavior. Only use addresses obtained from valid buffers.

## Example

```javascript
import { buffer2address, address2buffer } from "buffer2address";

const buf = new Uint8Array(16);
buf[0] = 0xAA;

const address = buffer2address({ buffer: buf });
console.log(`buffer address = ${address}`);

const buf2 = address2buffer({ address, size: buf.length });
console.log(`buffer =`, buf2);
```
