import ZegoUIKit, {
  ZegoUIKitPluginType,
  ZegoInvitationConnectionState,
} from '@zegocloud/zego-uikit-rn';
import { zloginfo } from '../utils/logger';
import ZegoUIKitSignalingPlugin from '@zegocloud/zego-uikit-signaling-plugin-rn';

const _appInfo = {};
const _localUser = {};
let _pluginConnectionState;
const _install = (plugins) => {
  ZegoUIKit.installPlugins(plugins);
  Object.values(ZegoUIKitPluginType).forEach((pluginType) => {
    const plugin = ZegoUIKit.getPlugin(pluginType);
    plugin &&
      ZegoUIKit.getPlugin(pluginType)
        .getVersion()
        .then((pluginVersion) => {
          zloginfo(
            `[Plugins] install success, pluginType: ${pluginType}, version: ${pluginVersion}`
          );
        });
  });
};

const ZegoPrebuiltPlugins = {
  init: (appID, appSign, userID, userName, plugins = []) => {
    const callbackID =
      'ZegoPrebuiltPlugins' + String(Math.floor(Math.random() * 10000));
    plugins.push(ZegoUIKitSignalingPlugin);
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
