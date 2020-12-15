#include <node_api.h>

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

napi_value init(napi_env env, napi_value exports) {
  napi_status status;
  napi_value func;

  status = napi_create_function(env, "buffer2address", NAPI_AUTO_LENGTH, buffer2address_native, NULL, &func);
  if(status != napi_ok) {
    return NULL;
  }

  return func;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)
