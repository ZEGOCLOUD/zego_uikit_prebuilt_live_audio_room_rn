import ZegoUIKit, {
  ZegoInvitationConnectionState,
} from '@zegocloud/zego-uikit-rn';
import { zloginfo } from '../utils/logger';
import * as ZIM from 'zego-zim-react-native';

import { getPackageVersion } from '../utils/package_version';

let _ZIMKitPlugin = null;
let _pluginConnectionState;
const _callbackID = 'ZegoPrebuiltPlugins' + String(Math.floor(Math.random() * 10000));

const _install = (plugins) => {
  ZegoUIKit.installPlugins(plugins);
  ZegoUIKit.logComponentsVersion(new Map([['PrebuiltLiveAudioRoom', getPackageVersion()]]));

  plugins.forEach(plugin => {
    if (plugin.ZIMKit) {
      zloginfo('[Plugins] install ZIMKit success.');
      _ZIMKitPlugin = plugin;
    } else if (plugin.default && typeof plugin.default.getModuleName === 'function') {
      const temp = plugin.default.getModuleName();
      if (temp === 'ZIMKit') {
        zloginfo('[Plugins] install ZIMKit success.');
        _ZIMKitPlugin = plugin;
      }
    }
  })
};

const ZegoPrebuiltPlugins = {
  init: (appID, appSign, userID, userName, plugins = []) => {
    plugins.push(ZIM)
    _install(plugins);

    ZegoUIKit.getSignalingPlugin().init(appID, appSign);
    ZegoUIKit.getSignalingPlugin().onConnectionStateChanged(
      _callbackID,
      ({ state }) => {
        _pluginConnectionState = state;
      }
    );
    return ZegoUIKit.getSignalingPlugin()
      .login(userID, userName)
      .then(() => {
        zloginfo('[Plugins] login success.');
      });
  },
  reconnectIfDisconnected: () => {
    zloginfo(
      '[Plugins] reconnectIfDisconnected',
      _pluginConnectionState,
      ZegoInvitationConnectionState.disconnected
    );
    if (_pluginConnectionState === ZegoInvitationConnectionState.disconnected) {
      ZegoUIKit.getSignalingPlugin().logout().then(() => {
        zloginfo('[Plugins] auto logout success.');
        const localUser = ZegoUIKit.getLocalUserInfo();
        ZegoUIKit.getSignalingPlugin()
          .login(localUser.userID, localUser.userName)
          .then(() => {
            zloginfo('[Plugins] auto reconnect success.');
          });
      });
    }
  },
  uninit: () => {
    ZegoUIKit.getSignalingPlugin().onConnectionStateChanged(_callbackID);
    ZegoUIKit.getSignalingPlugin().logout();
    ZegoUIKit.getSignalingPlugin().uninit();

    _pluginConnectionState = undefined;
    _ZIMKitPlugin = null;
  },
  getZIMKitPlugin: () => {
    return _ZIMKitPlugin;
  },
};

export default ZegoPrebuiltPlugins;
