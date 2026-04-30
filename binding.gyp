{
  "targets": [
    {
      "target_name": "buffer2address",
      "sources": [ "native/buffer2address.c" ],
      "cflags": [ "-nostdlib", "-nodefaultlibs", "-ffreestanding" ],
      "ldflags": [ "-nostdlib", "-nodefaultlibs" ]
    }
  ]
}
