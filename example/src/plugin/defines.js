import { ZIMConnectionState } from 'zego-zim-react-native';

export const ZegoUIKitPluginType = {
  signaling: 1,
};

export const ZegoUIKitPluginConnectionState = {
  disconnected: ZIMConnectionState.Disconnected,
  connecting: ZIMConnectionState.Connecting,
  connected: ZIMConnectionState.Connected,
  reconnecting: ZIMConnectionState.Reconnecting,
};
