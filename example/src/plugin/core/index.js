import ZIM, {
  ZIMConnectionState,
  ZIMCallUserState,
} from 'zego-zim-react-native';
import ZegoPluginResult from './defines';
import { zlogerror, zloginfo, zlogwarning } from '../utils/logger';
import ZegoPluginUserInRoomAttributesCore from './user_in_room_attributes_core';
import ZegoPluginRoomPropertiesCore from './room_properties_core';

export default class ZegoSignalingPluginCore {
  static shared = null;
  _loginUser = {};
  _callIDUsers = new Map(); // <zim call id, user id>
  _connectionState = ZIMConnectionState.Disconnected;
  _onConnectionStateChangedCallbackMap = {};
  _onCallInvitationReceivedCallbackMap = {};
  _onCallInvitationCancelledCallbackMap = {};
  _onCallInvitationAcceptedCallbackMap = {};
  _onCallInvitationRejectedCallbackMap = {};
  _onCallInvitationTimeoutCallbackMap = {};
  _onCallInviteesAnsweredTimeoutCallbackMap = {};
  constructor() {
    if (!ZegoSignalingPluginCore.shared) {
      zloginfo('[Core]ZegoSignalingPluginCore successful instantiation.');
      ZegoSignalingPluginCore.shared = this;
    }
    return ZegoSignalingPluginCore.shared;
  }
  static getInstance() {
    if (!ZegoSignalingPluginCore.shared) {
      ZegoSignalingPluginCore.shared = new ZegoSignalingPluginCore();
    }
    return ZegoSignalingPluginCore.shared;
  }
  // ------- internal events register ------
  _registerEngineCallback() {
    zloginfo('[Core]Register callback for ZIM...');
    ZIM.getInstance().on('error', (zim, errorInfo) => {
      zlogerror(
        `[Core]Zim error, code:${errorInfo.code}, message:${errorInfo.message}.`
      );
    });
    ZIM.getInstance().on(
      'connectionStateChanged',
      (zim, { state, event, extendedData }) => {
        zloginfo(
          `[Core]Connection state changed, state:${state}, event:${event}, extended data:${extendedData}`
        );
        this._connectionState = state;
        this._notifyConnectionStateChanged({ state });
        if (this._connectionState === ZIMConnectionState.Disconnected) {
          zlogwarning('[Core]Disconnected, auto logout.');
          this.logout();
        }
      }
    );
    // Callback of the call invitation received by the invitee.
    ZIM.getInstance().on(
      'callInvitationReceived',
      (zim, { callID, inviter, timeout, extendedData }) => {
        zloginfo(
          '[Core][callInvitationReceived callback]',
          callID,
          inviter,
          timeout,
          extendedData
        );
        this._callIDUsers.set(callID, inviter);
        const notifyData = { callID, inviter: { id: inviter } };
        if (extendedData) {
          const extendedMap = JSON.parse(extendedData);
          notifyData.inviter.name = extendedMap.inviter_name;
          notifyData.type = extendedMap.type;
          notifyData.data = extendedMap.data;
        }
        this._notifyCallInvitationReceived(notifyData);
      }
    );
    // Callback of the disinvitation notification received by the invitee.
    ZIM.getInstance().on(
      'callInvitationCancelled',
      (zim, { callID, inviter, extendedData }) => {
        zloginfo(
          '[Core][callInvitationCancelled callback]',
          callID,
          inviter,
          extendedData
        );
        this._callIDUsers.delete(callID);
        const notifyData = {
          callID,
          inviter: { id: inviter, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationCancelled(notifyData);
      }
    );
    // Callback of the invitation acceptance notification received by the inviter.
    ZIM.getInstance().on(
      'callInvitationAccepted',
      (zim, { callID, invitee, extendedData }) => {
        zloginfo(
          '[Core][callInvitationAccepted callback]',
          callID,
          invitee,
          extendedData
        );
        const notifyData = {
          callID,
          invitee: { id: invitee, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationAccepted(notifyData);
      }
    );
    // Callback of notification received by the inviter that the inviter has declined the invitation.
    ZIM.getInstance().on(
      'callInvitationRejected',
      (zim, { callID, invitee, extendedData }) => {
        zloginfo(
          '[Core][callInvitationRejected callback]',
          callID,
          invitee,
          extendedData
        );
        const notifyData = {
          callID,
          invitee: { id: invitee, name: '' },
          data: extendedData,
        };
        this._notifyCallInvitationRejected(notifyData);
      }
    );
    // Call invitation timeout notification callback for the invitee.
    ZIM.getInstance().on('callInvitationTimeout', (zim, { callID }) => {
      zloginfo('[Core][callInvitationTimeout callback]', callID);
      const notifyData = {
        callID,
        inviter: { id: this._getInviterIDByCallID(callID), name: '' },
        data: '',
      };
      this._notifyCallInvitationTimeout(notifyData);
    });
    // Call invitation timeout notification callback by the inviter.
    ZIM.getInstance().on(
      'callInviteesAnsweredTimeout',
      (zim, { callID, invitees }) => {
        zloginfo(
          '[Core][callInviteesAnsweredTimeout callback]',
          callID,
          invitees
        );
        const notifyData = {
          callID,
          invitees: invitees.map((invitee) => {
            return { id: invitee, name: '' };
          }),
          data: '',
        };
        this._notifyCallInviteesAnsweredTimeout(notifyData);
      }
    );
  }
  _unregisterEngineCallback() {
    zloginfo('[Core]Unregister callback from ZIM...');
    ZIM.getInstance().off('error');
    ZIM.getInstance().off('connectionStateChanged');
    ZIM.getInstance().off('callInvitationReceived');
    ZIM.getInstance().off('callInvitationCancelled');
    ZIM.getInstance().off('callInvitationAccepted');
    ZIM.getInstance().off('callInvitationRejected');
    ZIM.getInstance().off('callInvitationTimeout');
    ZIM.getInstance().off('callInviteesAnsweredTimeout');
  }
  // ------- internal events exec ------
  _notifyConnectionStateChanged(notifyData) {
    Object.keys(this._onConnectionStateChangedCallbackMap).forEach(
      (callbackID) => {
        if (this._onConnectionStateChangedCallbackMap[callbackID]) {
          this._onConnectionStateChangedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationReceived(notifyData) {
    Object.keys(this._onCallInvitationReceivedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationReceivedCallbackMap[callbackID]) {
          this._onCallInvitationReceivedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationCancelled(notifyData) {
    Object.keys(this._onCallInvitationCancelledCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationCancelledCallbackMap[callbackID]) {
          this._onCallInvitationCancelledCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationAccepted(notifyData) {
    Object.keys(this._onCallInvitationAcceptedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationAcceptedCallbackMap[callbackID]) {
          this._onCallInvitationAcceptedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationRejected(notifyData) {
    Object.keys(this._onCallInvitationRejectedCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationRejectedCallbackMap[callbackID]) {
          this._onCallInvitationRejectedCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInvitationTimeout(notifyData) {
    Object.keys(this._onCallInvitationTimeoutCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInvitationTimeoutCallbackMap[callbackID]) {
          this._onCallInvitationTimeoutCallbackMap[callbackID](notifyData);
        }
      }
    );
  }
  _notifyCallInviteesAnsweredTimeout(notifyData) {
    Object.keys(this._onCallInviteesAnsweredTimeoutCallbackMap).forEach(
      (callbackID) => {
        if (this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID]) {
          this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID](
            notifyData
          );
        }
      }
    );
  }
  // ------- internal utils ------
  _resetData() {
    this._resetDataForLogout();
  }
  _resetDataForLogout() {
    this._loginUser = {};
    this._callIDUsers.clear();
    this._connectionState = ZIMConnectionState.Disconnected;
  }
  _getInviterIDByCallID(callID) {
    return this._callIDUsers.get(callID);
  }
  // ------- external utils ------
  getLocalUser() {
    return this._loginUser;
  }
  getCallIDByUserID(userID) {
    let callID = '';
    Array.from(this._callIDUsers.keys()).forEach((key) => {
      const value = this._callIDUsers.get(key);
      if (userID === value) {
        callID = key;
        zloginfo('[Core]getCallIDByUserID', userID, this._callIDUsers, callID);
      }
    });
    return callID;
  }
  // ------- external method ------
  getZIMInstance() {
    return ZIM.getInstance();
  }
  getVersion() {
    return ZIM.getVersion();
  }
  create(appConfig) {
    if (!ZIM.getInstance()) {
      const zim = ZIM.create(appConfig);
      if (!zim) {
        zlogerror('[Core]Create zim error.');
      } else {
        zloginfo('[Core]Create zim success.');
        this._unregisterEngineCallback();
        this._registerEngineCallback();
        // live audio room
        ZegoPluginUserInRoomAttributesCore.getInstance()._unregisterEngineCallback();
        ZegoPluginUserInRoomAttributesCore.getInstance()._registerEngineCallback();
        ZegoPluginRoomPropertiesCore.getInstance()._unregisterEngineCallback();
        ZegoPluginRoomPropertiesCore.getInstance()._registerEngineCallback();
      }
    } else {
      zlogwarning('[Core]Zim has created.');
    }
  }
  login(userInfo, token = '') {
    return ZIM.getInstance()
      .login(userInfo, token)
      .then(() => {
        zloginfo('[Core]Login success.');
        this._loginUser = userInfo;
      });
  }
  logout() {
    return ZIM.getInstance()
      .logout()
      .then(() => {
        zloginfo('[Core]Logout success.');
        this._resetDataForLogout();
        // live audio room
        ZegoPluginUserInRoomAttributesCore.getInstance()._resetData();
      });
  }
  destroy() {
    ZIM.getInstance().destroy();
    zloginfo('[Core]Destroy success.');
    this._resetData();
  }
  invite(invitees, config) {
    return new Promise((resolve, reject) => {
      console.warn(invitees);
      console.warn(config);
      ZIM.getInstance()
        .callInvite(invitees, config)
        .then(({ callID, timeout, errorInvitees }) => {
          this._callIDUsers.set(callID, this._loginUser.userID);
          if (!errorInvitees || !errorInvitees.length) {
            zloginfo(`[Core]Invite done, call id: ${callID}`);
            resolve({
              ...new ZegoPluginResult('', ''),
              callID,
              errorInvitees: [],
            });
          } else {
            const errorInviteeIDs = [];
            errorInvitees.forEach((errorInvitee) => {
              const desc =
                errorInvitee.state === ZIMCallUserState.Offline
                  ? 'offine'
                  : errorInvitee.state === ZIMCallUserState.Inviting
                  ? 'inviting'
                  : '';
              zlogwarning(
                `[Core]Invite error, invitee id: ${errorInvitee.userID}, invitee state: ${errorInvitee.state}, state desc: ${desc}`
              );
              errorInviteeIDs.push(errorInvitee.userID);
            });
            resolve({
              ...new ZegoPluginResult('', ''),
              callID,
              errorInvitees: errorInviteeIDs,
            });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  cancel(invitees, callID, config) {
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .callCancel(invitees, callID, config)
        .then(({ callID: resCallID, errorInvitees }) => {
          this._callIDUsers.delete(callID);
          if (!errorInvitees || !errorInvitees.length) {
            zloginfo(`[Core]Cancel invitation done, call id: ${callID}`);
            resolve({ ...new ZegoPluginResult('', ''), errorInvitees: [] });
          } else {
            errorInvitees.forEach((inviteeID) => {
              zlogwarning(
                `[Core]Cancel invitation error, invitee id: ${inviteeID}`
              );
            });
            resolve({ ...new ZegoPluginResult('', ''), errorInvitees });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  accept(callID, config) {
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .callAccept(callID, config)
        .then(({ callID: resCallID }) => {
          zloginfo(`[Core]Accept invitation done, call id: ${callID}`);
          resolve(new ZegoPluginResult());
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  reject(callID, config) {
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .callReject(callID, config)
        .then(({ callID: resCallID }) => {
          zloginfo(`[Core]Reject invitation done, call id: ${callID}`);
          this._callIDUsers.delete(callID);
          resolve(new ZegoPluginResult());
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  // ------- external events register ------
  onConnectionStateChanged(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onConnectionStateChangedCallbackMap) {
        zloginfo(
          '[Core][onConnectionStateChanged] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onConnectionStateChangedCallbackMap[callbackID];
      }
    } else {
      this._onConnectionStateChangedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationReceived(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationReceivedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationReceived] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationReceivedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationReceivedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationCancelled(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationCancelledCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationCancelled] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationCancelledCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationCancelledCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationAccepted(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationAcceptedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationAccepted] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationAcceptedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationAcceptedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationRejected(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationRejectedCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationRejected] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationRejectedCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationRejectedCallbackMap[callbackID] = callback;
    }
  }
  onCallInvitationTimeout(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInvitationTimeoutCallbackMap) {
        zloginfo(
          '[Core][onCallInvitationTimeout] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInvitationTimeoutCallbackMap[callbackID];
      }
    } else {
      this._onCallInvitationTimeoutCallbackMap[callbackID] = callback;
    }
  }
  onCallInviteesAnsweredTimeout(callbackID, callback) {
    if (typeof callback !== 'function') {
      if (callbackID in this._onCallInviteesAnsweredTimeoutCallbackMap) {
        zloginfo(
          '[Core][onCallInviteesAnsweredTimeout] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!'
        );
        delete this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID];
      }
    } else {
      this._onCallInviteesAnsweredTimeoutCallbackMap[callbackID] = callback;
    }
  }
}
