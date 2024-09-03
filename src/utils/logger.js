import ZegoUIKit from '@zegocloud/zego-uikit-rn';

export const zloginfo = (...msg) => {
  ZegoUIKit.kitLogInfo('PrebuiltLiveAudioRoom', ...msg);
};

export const zlogwarning = (...msg) => {
  ZegoUIKit.kitLogWarning('PrebuiltLiveAudioRoom', ...msg);
};

export const zlogerror = (...msg) => {
  ZegoUIKit.kitLogError('PrebuiltLiveAudioRoom', ...msg);
};
