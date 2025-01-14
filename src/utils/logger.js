import {ZegoUIKitLogger} from '@zegocloud/zego-uikit-rn';

export const zloginfo = (...msg) => {
  ZegoUIKitLogger.logInfo('PrebuiltLiveAudioRoom', ...msg);
};

export const zlogwarning = (...msg) => {
  ZegoUIKitLogger.logWarning('PrebuiltLiveAudioRoom', ...msg);
};

export const zlogerror = (...msg) => {
  ZegoUIKitLogger.logError('PrebuiltLiveAudioRoom', ...msg);
};
