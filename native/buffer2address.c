#include <node_api.h>

#include <stdint.h>

// For the sake of simplicity, this code assumes that if any of the basic functions
// fail, that the engine (e.g. Node) will handle errors accordingly and therefore
// we simply return NULL in such a case (instead of trying to create a nice error
// object, which will most likely fail as well anyway)

static napi_value buffer2address_native(napi_env env, napi_callback_info info) {
  napi_value argv[1];
  size_t argc = 1;
  napi_value thisArg;
  void* opaque;
  napi_status status;
  napi_value addr_of_buf;
  void* buf;
  size_t buf_len;
  bool is_buffer;

  status = napi_get_cb_info(env, info, &argc, argv, &thisArg, &opaque);
  if(status != napi_ok) {
    return NULL;
  }

  if(argc != 1) {
    napi_throw_error(env, "EINVAL", "Expected exactly one Node.js Buffer as argument");
    return NULL;
  }

  status = napi_is_buffer(env, argv[0], &is_buffer);
  if(status != napi_ok) {
    return NULL;
  }

  if(!is_buffer) {
    napi_throw_error(env, "EINVAL", "Argument must be a Node.js Buffer");
    return NULL;
  }

  status = napi_get_buffer_info(env, argv[0], &buf, &buf_len);
  if(status != napi_ok) {
    return NULL;
  }

  status = napi_create_bigint_uint64(env, (uint64_t) buf, &addr_of_buf);
  if(status != napi_ok) {
    return NULL;
  }

  return addr_of_buf;
}

static napi_value address2buffer_native(napi_env env, napi_callback_info info) {
  napi_value argv[2];
  size_t argc = sizeof(argv) / sizeof(argv[0]);
  napi_value thisArg;
  void* opaque;
  napi_status status;
  napi_value result;
  void* address;
  size_t length;
  uint64_t address_u64;
  uint64_t length_u64;
  _Bool lossless;

  status = napi_get_cb_info(env, info, &argc, argv, &thisArg, &opaque);
  if(status != napi_ok) {
    return NULL;
  }

  if(argc != 2) {
    napi_throw_error(env, "EINVAL", "Expected address and size as arguments");
    return NULL;
  }

  status = napi_get_value_bigint_uint64(env, argv[0], &address_u64, &lossless);
  if(status == napi_bigint_expected) {
    napi_throw_error(env, "EINVAL", "address must be a BigInt");
    return NULL;
  } else if(status != napi_ok) {
    return NULL;
  }

  if(!lossless || address_u64 > UINTPTR_MAX) {
    napi_throw_error(env, "EINVAL", "address must not exceed UINTPTR_MAX");
    return NULL;
  }

  status = napi_get_value_bigint_uint64(env, argv[1], &length_u64, &lossless);
  if(status == napi_bigint_expected) {
    napi_throw_error(env, "EINVAL", "size must be a BigInt");
    return NULL;
  } else if(status != napi_ok) {
    return NULL;
  }

  if(!lossless || length_u64 > UINTPTR_MAX) {
    napi_throw_error(env, "EINVAL", "length must not exceed UINTPTR_MAX");
    return NULL;
  }

  address = (void*) address_u64;
  length = (size_t) length_u64;

  status = napi_create_external_buffer(env, length, address, NULL, NULL, &result);
  if(status != napi_ok) {
    return NULL;
  }

  return result;
}

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value func;
  napi_value func_address2buffer;
  napi_value result;

  status = napi_create_function(env, "buffer2address", NAPI_AUTO_LENGTH, buffer2address_native, NULL, &func);
  if(status != napi_ok) {
    return NULL;
  }

  status = napi_create_function(env, "address2buffer", NAPI_AUTO_LENGTH, address2buffer_native, NULL, &func_address2buffer);
  if(status != napi_ok) {
    return NULL;
  }

  status = napi_create_object(env, &result);
  if(status != napi_ok) {
    return NULL;
  }

  status = napi_set_named_property(env, result, "buffer2address", func);
  if(status != napi_ok) {
    return NULL;
  }

  status = napi_set_named_property(env, result, "address2buffer", func_address2buffer);
  if(status != napi_ok) {
    return NULL;
  }

  return result;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
