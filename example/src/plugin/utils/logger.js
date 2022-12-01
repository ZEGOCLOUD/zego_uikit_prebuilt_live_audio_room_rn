export const zloginfo = (...msg) => {
  console.log('SignalingPlugin[INFO]: ', ...msg);
};
export const zlogwarning = (...msg) => {
  console.warn('SignalingPlugin[WARNING]: ', ...msg);
};

export const zlogerror = (...msg) => {
  console.error('SignalingPlugin[ERROR]: ', ...msg);
};
