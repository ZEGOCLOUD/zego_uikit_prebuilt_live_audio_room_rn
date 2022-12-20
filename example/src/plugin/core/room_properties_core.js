import ZIM from 'zego-zim-react-native';
import {zlogerror, zloginfo, zlogwarning} from '../utils/logger';
import ZegoPluginResult from './defines';
import ZegoPluginUserInRoomAttributesCore from './user_in_room_attributes_core';

export default class ZegoPluginRoomPropertiesCore {
  static shared;
  _onRoomPropertyUpdatedCallbackMap = {};
  constructor() {
    if (!ZegoPluginRoomPropertiesCore.shared) {
      ZegoPluginRoomPropertiesCore.shared = this;
    }
    return ZegoPluginRoomPropertiesCore.shared;
  }
  static getInstance() {
    if (!ZegoPluginRoomPropertiesCore.shared) {
      ZegoPluginRoomPropertiesCore.shared = new ZegoPluginRoomPropertiesCore();
    }
    return ZegoPluginRoomPropertiesCore.shared;
  }
  // ------- internal events register ------
  _registerEngineCallback() {
    ZIM.getInstance().on('roomAttributesUpdated', (zim, {roomID, infos}) => {
      zloginfo(
        '[ZegoPluginRoomPropertiesCore]NotifyRoomPropertiesUpdated',
        infos,
      );
      infos.forEach(info => {
        this._notifyRoomPropertiesUpdated(info);
      });
    });
    ZIM.getInstance().on(
      'roomAttributesBatchUpdated',
      (zim, {roomID, infos}) => {
        zloginfo(
          '[ZegoPluginRoomPropertiesCore]NotifyRoomPropertiesUpdated',
          infos,
        );
        infos.forEach(info => {
          this._notifyRoomPropertiesUpdated(info);
        });
      },
    );
    zloginfo('[ZegoPluginRoomPropertiesCore]Register callback for ZIM...');
  }
  _unregisterEngineCallback() {
    zloginfo('[ZegoPluginRoomPropertiesCore]Unregister callback from ZIM...');
    ZIM.getInstance().off('roomAttributesUpdated');
    ZIM.getInstance().off('roomAttributesBatchUpdated');
  }
  // ------- internal events exec ------
  _notifyRoomPropertiesUpdated(notifyData) {
    Object.keys(this._onRoomPropertyUpdatedCallbackMap).forEach(callbackID => {
      if (this._onRoomPropertyUpdatedCallbackMap[callbackID]) {
        this._onRoomPropertyUpdatedCallbackMap[callbackID](notifyData);
      }
    });
  }
  // ------- external method ------
  updateRoomProperty(attributes, config) {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .setRoomAttributes(attributes, roomID, config)
        .then(({roomID: resRoomID, errorKeys}) => {
          zloginfo(
            '[ZegoPluginRoomPropertiesCore]Update the room properties successfully.',
          );
          resolve({...new ZegoPluginResult('', ''), errorKeys});
        })
        .catch(error => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to update room properties, code: ${error.code}, message: ${error.message}`,
          );
          reject(error);
        });
    });
  }
  deleteRoomProperties(keys, config) {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .deleteRoomAttributes(keys, roomID, config)
        .then(({roomID: resRoomID, errorKeys}) => {
          zloginfo(
            '[ZegoPluginRoomPropertiesCore]Delete the room properties successfully.',
          );
          resolve({...new ZegoPluginResult('', ''), errorKeys});
        })
        .catch(error => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to delete room properties, code: ${error.code}, message: ${error.message}`,
          );
          reject(error);
        });
    });
  }
  beginRoomPropertiesBatchOperation(config) {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    ZIM.getInstance().beginRoomAttributesBatchOperation(roomID, config);
    zloginfo(
      '[ZegoPluginRoomPropertiesCore]Begin batch operate room properties successfully.',
    );
  }
  endRoomPropertiesBatchOperation() {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .endRoomAttributesBatchOperation(roomID)
        .then(({roomID: resRoomID}) => {
          zloginfo(
            '[ZegoPluginRoomPropertiesCore]End batch operate room properties successfully.',
          );
          resolve(new ZegoPluginResult('', ''));
        })
        .catch(error => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to end batch operate room properties, code: ${error.code}, message: ${error.message}`,
          );
          reject(error);
        });
    });
  }
  queryRoomProperties() {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
      return Promise.reject();
    }
    const roomID =
      ZegoPluginUserInRoomAttributesCore.getInstance().getRoomBaseInfo().roomID;
    return new Promise((resolve, reject) => {
      ZIM.getInstance()
        .queryRoomAllAttributes(roomID)
        .then(({roomID: resRoomID, roomAttributes}) => {
          zloginfo(
            '[ZegoPluginRoomPropertiesCore]Query room all attributes successfully.',
          );
          resolve({roomAttributes, ...new ZegoPluginResult('', '')});
        })
        .catch(error => {
          zlogerror(
            `[ZegoPluginRoomPropertiesCore]Failed to query room all properties, code: ${error.code}, message: ${error.message}`,
          );
          reject(error);
        });
    });
  }
  onRoomPropertyUpdated(callbackID, callback) {
    if (!ZIM.getInstance()) {
      zlogerror('[ZegoPluginRoomPropertiesCore]Please initialize it first.');
    }
    if (typeof callback !== 'function') {
      if (callbackID in this._onRoomPropertyUpdatedCallbackMap) {
        zloginfo(
          '[Core][onRoomPropertyUpdated] Remove callback for: [',
          callbackID,
          '] because callback is not a valid function!',
        );
        delete this._onRoomPropertyUpdatedCallbackMap[callbackID];
      }
    } else {
      this._onRoomPropertyUpdatedCallbackMap[callbackID] = callback;
    }
  }
}
