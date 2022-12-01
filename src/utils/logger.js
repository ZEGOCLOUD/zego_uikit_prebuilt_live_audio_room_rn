export const zloginfo = (...msg) => {
  console.log('ZEGOUIKit[INFO]: ', ...msg);
};
export const zlogwarning = (...msg) => {
  console.warn('ZEGOUIKit[WARNING]: ', ...msg);
};

export const zlogerror = (...msg) => {
  console.error('ZEGOUIKit[ERROR]: ', ...msg);
};
