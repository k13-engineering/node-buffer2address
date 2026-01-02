const captureUncaughtExceptionsDuring = async (fn: (args: { uncaughtExceptions: () => Error[] }) => Promise<void>): Promise<Error[]> => {

  let uncaughtExceptions: Error[] = [];

  const uncaughtExceptionListener = (ex: Error) => {
    uncaughtExceptions = [
      ...uncaughtExceptions,
      ex
    ];
  };

  const previousListeners = process.listeners("uncaughtException");
  previousListeners.forEach((listener) => {
    process.off("uncaughtException", listener);
  });

  process.on("uncaughtException", uncaughtExceptionListener);

  try {
    await fn({
      uncaughtExceptions: () => {
        return uncaughtExceptions;
      }
    });
  } finally {
    process.off("uncaughtException", uncaughtExceptionListener);
    previousListeners.forEach((listener) => {
      process.on("uncaughtException", listener);
    });
  }

  return uncaughtExceptions;
};

const forceGarbageCollection = () => {
  /* c8 ignore start */
  if (gc === undefined) {
    throw Error(`please run with --expose-gc`);
  }
  /* c8 ignore end */

  gc();
};

export {
  captureUncaughtExceptionsDuring,
  forceGarbageCollection
};
