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

### `buffer2address(buf)` => `BigInt`
Returns the address of a Node.js buffer instance as a `BigInt`. On 32-bit systems we could actually return a `Number` but to be consistent over all architectures always `BigInt`s are returned.

## Example

```javascript
import buffer2address from "buffer2address";

const buf = Buffer.alloc(32);
console.log(`buffer address = ${buffer2address(buf)}`);
```
