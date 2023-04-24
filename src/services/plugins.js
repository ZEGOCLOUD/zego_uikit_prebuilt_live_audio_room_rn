import ZegoUIKit, {
  ZegoInvitationConnectionState,
} from '@zegocloud/zego-uikit-rn';
import { zloginfo } from '../utils/logger';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';

const _appInfo = {};
const _localUser = {};
let _pluginConnectionState;
let ZIMKitPlugin = null;
const _install = (plugins) => {
  ZegoUIKit.installPlugins(plugins);
  plugins.forEach(plugin => {
    if (plugin.ZIMKit) {
      zloginfo('[Plugins] install ZIMKit success.');
      ZIMKitPlugin = plugin;
    } else if (plugin.default && typeof plugin.default.getModuleName === 'function') {
      const temp = plugin.default.getModuleName();
      if (temp === 'ZIMKit') {
        zloginfo('[Plugins] install ZIMKit success.');
        ZIMKitPlugin = plugin;
      }
    }
  })
};

const ZegoPrebuiltPlugins = {
  init: (appID, appSign, userID, userName, plugins = []) => {
    const callbackID =
      'ZegoPrebuiltPlugins' + String(Math.floor(Math.random() * 10000));
    plugins.push(ZIM, ZPNs);
    _install(plugins);
    ZegoUIKit.getSignalingPlugin().init(appID, appSign);
    ZegoUIKit.getSignalingPlugin().onConnectionStateChanged(
      callbackID,
      ({ state }) => {
        _pluginConnectionState = state;
      }
    );
    _appInfo.appID = appID;
    _appInfo.appSign = appSign;
    _localUser.userID = userID;
    _localUser.userName = userName;
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
      ZegoUIKit.getSignalingPlugin().logout.then(() => {
        zloginfo('[Plugins] auto logout success.');
        ZegoUIKit.getSignalingPlugin()
          .login(_localUser.userID, _localUser.userName)
          .then(() => {
            zloginfo('[Plugins] auto reconnect success.');
          });
      });
    }
  },
  uninit: () => {
    ZegoUIKit.getSignalingPlugin().logout();
    ZegoUIKit.getSignalingPlugin().uninit();
  },
  getLocalUser: () => {
    return _localUser;
  },
  getAppInfo: () => {
    return _appInfo;
  },
};

export default ZegoPrebuiltPlugins;
