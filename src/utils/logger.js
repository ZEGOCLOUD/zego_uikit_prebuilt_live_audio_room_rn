import { getLocalDateFormat } from './timer';

export const zloginfo = (...msg) => {
  console.log(getLocalDateFormat() + ' LiveAudioRoom[INFO]: ', ...msg);
};

export const zlogwarning = (...msg) => {
  console.warn(getLocalDateFormat() + ' LiveAudioRoom[WARNING]: ', ...msg);
};

export const zlogerror = (...msg) => {
  console.error(getLocalDateFormat() + ' LiveAudioRoom[ERROR]: ', ...msg);
};
