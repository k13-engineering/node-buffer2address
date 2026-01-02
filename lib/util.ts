const formatPointerAddress = ({ pointerAddress }: { pointerAddress: bigint }) => {
  return `0x${pointerAddress}`;
};

export {
  formatPointerAddress
};
